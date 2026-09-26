#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
kbcheck.py —— 验证端点 / KEY / UA / 模型名，并区分「被拦」与「通路出错」。
不依赖 kbguard.py，不改任何已有文件。

准备：
  set PROBE_URL=https://agentrouter.org/v1/chat/completions
  set PROBE_KEY=sk-...
  set PROBE_MODEL=模型ID（先用 --models 查准确名字）
  set PROBE_UA=claude-cli/2.1.161 (external, cli)

用法：
  python tools\kbcheck.py --models          # 列出你能用的模型 ID
  python tools\kbcheck.py                   # 发一段普通文本，验证能不能通
  python tools\kbcheck.py "要测的文字"        # 测这段会不会被拦
"""
import argparse
import os
import sys

import httpx

URL = os.environ.get("PROBE_URL", "")
KEY = os.environ.get("PROBE_KEY", "")
MODEL = os.environ.get("PROBE_MODEL", "")
UA = os.environ.get("PROBE_UA", "Mozilla/5.0")

# 判定「这是内容拦截」的特征词；不含这些的一律算通路出错
POLICY_HINTS = ("content_filter", "content-policy", "content_policy",
                "policy", "violat", "moderation", "sensitive", "prohibited",
                "unsafe", "blocked", "违规", "敏感", "内容", "拦截", "风险")


def _is_policy(text: str) -> bool:
    t = (text or "").lower()
    return any(h in t for h in POLICY_HINTS)


def headers():
    return {"Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": UA}


def probe(text: str):
    """返回 (判定, 说明, 原始片段)。判定: OK / HIT / ERR"""
    body = {"model": MODEL, "stream": False, "max_tokens": 8,
            "messages": [{"role": "user", "content": text}]}
    try:
        r = httpx.post(URL, json=body, timeout=60, headers=headers())
    except Exception as e:
        return "ERR", f"网络异常 {type(e).__name__}: {e}", ""

    snip = (r.text or "")[:500].replace("\n", " ")
    if r.status_code >= 400:
        if _is_policy(snip):
            return "HIT", f"HTTP {r.status_code} 内容拦截", snip
        return "ERR", f"HTTP {r.status_code} 通路出错（不是内容拦截）", snip

    try:
        d = r.json()
    except Exception:
        return "ERR", "返回不是 JSON", snip

    ch = (d.get("choices") or [{}])[0]
    fr = ch.get("finish_reason")
    content = (ch.get("message") or {}).get("content")
    if fr and fr not in ("stop", "length", "tool_calls"):
        return "HIT", f"finish_reason={fr}", snip
    if not content:
        return "ERR", "回复为空（多半是模型名/额度问题）", snip
    return "OK", f"finish_reason={fr}", content[:120]


def cmd_models():
    base = URL.replace("/chat/completions", "").rstrip("/")
    url = base + "/models"
    print(f"GET  {url}")
    try:
        r = httpx.get(url, timeout=60, headers=headers())
    except Exception as e:
        sys.exit(f"连不上：{type(e).__name__}: {e}")
    print(f"HTTP {r.status_code}\n")
    try:
        d = r.json()
    except Exception:
        print((r.text or "")[:1000])
        return
    items = d.get("data") or d.get("models") or []
    if not items:
        print((r.text or "")[:1000])
        return
    for m in items:
        print("  ", m.get("id") if isinstance(m, dict) else m)
    print(f"\n共 {len(items)} 个。把要用的那个填给 PROBE_MODEL。")


def main():
    ap = argparse.ArgumentParser(description="验证中转通路与拦截判定")
    ap.add_argument("text", nargs="?", default="hello, write a python function")
    ap.add_argument("--models", action="store_true", help="列出可用模型 ID")
    a = ap.parse_args()

    if not URL or not MODEL:
        sys.exit("先设 PROBE_URL / PROBE_KEY / PROBE_MODEL / PROBE_UA")
    if a.models:
        return cmd_models()

    print(f"URL    {URL}")
    print(f"MODEL  {MODEL}")
    print(f"UA     {UA}")
    print(f"发送   {len(a.text)} 字")

    verdict, why, extra = probe(a.text)
    print(f"\n判定   {verdict}    ({why})")
    print(f"原始   {extra}\n")

    if verdict == "ERR":
        print("→ 通路问题，和敏感词无关。上面的原始返回看具体原因：")
        print("   无可用渠道 / model not found → 模型名不对，先跑 --models")
        print("   401 / 403 → KEY 或 UA 不对      402 → 额度")
        print("   503 / 502 → 上游暂时不可用，等会儿再试")
    elif verdict == "OK":
        print("→ 通了，且判为「正常」。现在把你知道会触发的那段再测一次：")
        print('   python tools\\kbcheck.py "那段文字"')
        print("   如果那次也是 OK，说明判定偏保守，scan 会挖不到东西。")
    else:
        print("→ 这是真·内容拦截。可当作阳性样本；确认后再跑 scan。")


if __name__ == "__main__":
    main()
