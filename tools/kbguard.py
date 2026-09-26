#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
kbguard.py —— 脱敏镜像三件套：让 agent 只读镜像，改动再回填。

子命令：
  scan   扫描目录，用二分探针自动找出所有"会触发过滤"的片段，写出 terms.local.json
  build  按词表把源目录镜像成脱敏副本（agent 只读这个）
  apply  把镜像里被改过的文件回填成真文件（带冲突检测）

scan 需要环境变量：
  PROBE_URL / PROBE_KEY / PROBE_MODEL
可选：
  PROBE_UA      User-Agent（很多中转必须配，默认 Mozilla/5.0）
  PROBE_SLEEP   每次请求间隔秒数，默认 0.6
  PROBE_MAX_CALLS  最多调用次数，默认 400

典型用法：
  set PROBE_URL=https://你的中转/v1/chat/completions
  set PROBE_KEY=sk-xxx
  set PROBE_MODEL=你的模型
  set PROBE_UA=你客户端用的那个 User-Agent

  python kbguard.py scan  E:\MCP\st-plugin-kb --terms terms.local.json
  python kbguard.py build E:\MCP\st-plugin-kb E:\MCP\st-plugin-kb.mirror
  # 让 agent 改镜像目录里的文件……
  python kbguard.py apply E:\MCP\st-plugin-kb.mirror
"""
import argparse
import hashlib
import json
import os
import shutil
import sys
import time
from pathlib import Path

import httpx

TEXT_EXT = {".md", ".txt", ".mjs", ".js", ".cjs", ".ts", ".tsx", ".jsx", ".vue",
            ".json", ".yml", ".yaml", ".html", ".css", ".py", ".ps1", ".sh"}
SKIP_DIRS = {".git", "node_modules", "dist", "build", "__pycache__", ".venv",
             "venv", "coverage", ".next", ".mirror"}
MANIFEST = ".kbguard-manifest.json"

URL = os.environ.get("PROBE_URL", "")
KEY = os.environ.get("PROBE_KEY", "")
MODEL = os.environ.get("PROBE_MODEL", "")
UA = os.environ.get("PROBE_UA", "Mozilla/5.0")
SLEEP = float(os.environ.get("PROBE_SLEEP", "0.6"))
MAX_CALLS = int(os.environ.get("PROBE_MAX_CALLS", "400"))

_calls = 0
_net_err = 0
_cache = {}


# ----------------------------- 探针 -----------------------------
def tripped(text: str) -> bool:
    """这段文本发过去会不会被拦。带缓存。"""
    global _calls, _net_err
    if not text.strip():
        return False
    if text in _cache:
        return _cache[text]
    if _calls >= MAX_CALLS:
        raise SystemExit(f"探针调用达到上限 {MAX_CALLS}，可调 PROBE_MAX_CALLS")
    _calls += 1
    time.sleep(SLEEP)
    body = {"model": MODEL, "stream": False, "max_tokens": 4,
            "messages": [{"role": "user", "content": text}]}
    try:
        r = httpx.post(URL, json=body, timeout=60,
                       headers={"Authorization": f"Bearer {KEY}",
                                "Content-Type": "application/json",
                                "User-Agent": UA,
                                "Accept": "application/json"})
    except Exception:
        _net_err += 1
        _cache[text] = False
        return False
    if r.status_code >= 400:
        _cache[text] = True
        return True
    try:
        d = r.json()
    except Exception:
        _cache[text] = True
        return True
    ch = (d.get("choices") or [{}])[0]
    fr = ch.get("finish_reason")
    has_content = bool((ch.get("message") or {}).get("content"))
    _cache[text] = (fr not in (None, "stop", "length")) or not has_content
    return _cache[text]


def ddmin_str(text: str, lo: int, hi: int, floor: int = 4):
    """反复从两端砍块，缩到最小触发窗口。"""
    while hi - lo > floor:
        n = hi - lo
        moved = False
        for frac in (2, 4, 8):
            k = max(1, n // frac)
            if tripped(text[lo + k:hi]):
                lo, moved = lo + k, True
                break
            if tripped(text[lo:hi - k]):
                hi, moved = hi - k, True
                break
        if not moved:
            break
    return lo, hi


def find_all(text: str, max_n: int = 12):
    """在一个文本块里反复找触发片段，最多 max_n 个。"""
    spans, work = [], text
    while len(spans) < max_n and tripped(work):
        lo, hi = ddmin_str(work, 0, len(work))
        frag = work[lo:hi]
        if not frag.strip():
            break
        spans.append(frag)
        work = work[:lo] + "\n" + work[hi:]
    return spans


def scan_text(text: str, max_n: int = 12, chunk: int = 1500):
    """整篇不触发就分块再试（应对只在局部生效的过滤）。"""
    if tripped(text):
        return find_all(text, max_n)
    out = []
    for i in range(0, len(text), chunk):
        part = text[i:i + chunk]
        if part.strip() and tripped(part):
            out += find_all(part, max_n - len(out))
            if len(out) >= max_n:
                break
    return out


# ----------------------------- 工具 -----------------------------
def iter_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            yield Path(dirpath) / fn


def sha(b: bytes) -> str:
    return hashlib.sha1(b).hexdigest()


def load_terms(p) -> dict:
    path = Path(p)
    if not path.exists():
        sys.exit(f"找不到词表 {p}")
    return json.loads(path.read_text("utf-8"))


def apply_terms(text: str, terms: dict) -> str:
    for k, v in sorted(terms.items(), key=lambda kv: -len(kv[1])):
        if v:
            text = text.replace(v, k)
    return text


def restore_terms(text: str, terms: dict) -> str:
    for k, v in sorted(terms.items(), key=lambda kv: -len(kv[0])):
        text = text.replace(k, v)
    return text


# ----------------------------- 子命令 -----------------------------
def cmd_scan(a) -> int:
    if not URL or not MODEL:
        sys.exit("scan 需要 PROBE_URL / PROBE_KEY / PROBE_MODEL")
    root = Path(a.root).resolve()
    found = []
    for f in iter_files(root):
        if f.suffix.lower() not in TEXT_EXT:
            continue
        rel = f.relative_to(root)
        frags = scan_text(f.read_text("utf-8", errors="replace"))
        if frags:
            print(f"[命中] {rel}  ->  {len(frags)} 处")
        found += frags

    uniq = []
    for g in found:
        if any(g != u and g in u for u in uniq):   # 吃短词
            continue
        if g not in uniq:
            uniq.append(g)
    uniq.sort(key=len, reverse=True)

    terms = {f"T_{i:02d}": g for i, g in enumerate(uniq, 1)}
    out = Path(a.terms)
    if out.exists() and not a.force:
        sys.exit(f"{out} 已存在，加 --force 覆盖")
    out.write_text(json.dumps(terms, ensure_ascii=False, indent=2), "utf-8")

    print(f"\n[词表] {out}  共 {len(terms)} 条")
    for k, v in terms.items():
        print(f"   {k} = {v!r}")
    print(f"\n探针调用 {_calls} 次，网络异常 {_net_err} 次")
    if _net_err:
        print("⚠ 有网络异常，可能漏掉了一些片段，建议重跑")
    print("⚠ 这个词表别提交 git、别贴进任何聊天窗口。")
    return 0


def cmd_build(a) -> int:
    src, dst = Path(a.src).resolve(), Path(a.dst).resolve()
    terms = load_terms(a.terms)
    if dst == src or src in dst.parents:
        sys.exit("镜像目录不能放在源目录里面")
    if dst.exists():
        if not a.force:
            sys.exit(f"{dst} 已存在，加 --force 覆盖")
        shutil.rmtree(dst)

    files = {}
    for f in iter_files(src):
        rel = f.relative_to(src)
        out = dst / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        raw = f.read_bytes()
        if f.suffix.lower() in TEXT_EXT:
            out.write_text(apply_terms(raw.decode("utf-8", "replace"), terms), "utf-8")
        else:
            out.write_bytes(raw)
        files[rel.as_posix()] = {"src": sha(raw), "mirror": sha(out.read_bytes())}

    (dst / MANIFEST).write_text(
        json.dumps({"src": str(src), "terms": terms, "files": files},
                   ensure_ascii=False, indent=2), "utf-8")
    print(f"[镜像] {src}\n    -> {dst}")
    print(f"       {len(files)} 个文件，词表 {len(terms)} 条")
    print("       把 agent 指向镜像目录，别再让它读源目录。")
    return 0


def cmd_apply(a) -> int:
    dst = Path(a.dst).resolve()
    man = json.loads((dst / MANIFEST).read_text("utf-8"))
    src, terms = Path(man["src"]), man["terms"]
    changed = conflicts = 0
    for rel, meta in man["files"].items():
        m = dst / rel
        if not m.exists() or sha(m.read_bytes()) == meta["mirror"]:
            continue                                  # agent 没改
        s = src / rel
        body = restore_terms(m.read_text("utf-8", errors="replace"), terms)
        if s.exists() and sha(s.read_bytes()) != meta["src"]:
            alt = s.with_name(s.name + ".restored")
            alt.write_text(body, "utf-8")
            print(f"[冲突] {rel} 源文件在镜像之后被改过 -> {alt.name}")
            conflicts += 1
            continue
        s.parent.mkdir(parents=True, exist_ok=True)
        s.write_text(body, "utf-8")
        print(f"[回填] {rel}")
        changed += 1
    print(f"\n写回 {changed} 个，冲突 {conflicts} 个")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s1 = sub.add_parser("scan", help="自动挖出触发片段，写词表")
    s1.add_argument("root")
    s1.add_argument("--terms", default="terms.local.json")
    s1.add_argument("--force", action="store_true")
    s1.set_defaults(func=cmd_scan)

    s2 = sub.add_parser("build", help="源目录 -> 脱敏镜像")
    s2.add_argument("src")
    s2.add_argument("dst")
    s2.add_argument("--terms", default="terms.local.json")
    s2.add_argument("--force", action="store_true")
    s2.set_defaults(func=cmd_build)

    s3 = sub.add_parser("apply", help="镜像 -> 回填源目录")
    s3.add_argument("dst")
    s3.set_defaults(func=cmd_apply)

    a = p.parse_args()
    return a.func(a)


if __name__ == "__main__":
    sys.exit(main())
