---
title: 移动端浮层定位与触屏事件（插件 UI 实战总结）
category: frontend
tags: [mobile, css, positioning, touch, z-index, transform, ui]
summary: 插件浮层的三类定位方案（全屏面板用 fixed+inset、Modal 用 fixed+flex 遮罩、跟随小窗用 absolute）、触屏事件接管要点，以及坐标系错位的诊断模板。
sources: [SillyTavern/public/scripts/extensions/third-party/The-Riparian-Gaze/index.js, SillyTavern/public/scripts/extensions/third-party/The-Riparian-Gaze/style.css]
---

# 移动端浮层定位与触屏事件（插件 UI 实战总结）

适用场景：酒馆插件在移动端做全屏面板、编辑弹窗、跟随 canvas 的小窗，以及画布类的触摸拖拽。下面的结论来自 `The-Riparian-Gaze`（河岸凝视）的实测排错，`#tlg-panel`、`geoHitTest`、`updateGeoInfoBox` 都是该插件的实现符号。

## 一、全屏面板（如 `#tlg-panel`）

**方法**：`position: fixed; inset: 0;`

**要点**：

- 用 `fixed` + `inset:0` 铺满视口，不依赖父容器尺寸。
- 如果祖先链有 `transform`，`fixed` 会退化为相对该祖先定位（经典坑）——确保面板直接挂在 `document.body` 上。
  - 原因：带 `transform` 的元素会成为后代 `position: fixed` 的包含块（containing block），于是"视口定位"变成"相对该元素定位"。
- `z-index` 给足（`2147483640` 级别），避免被酒馆其它 UI 遮盖。
- 内部滚动用 `-webkit-overflow-scrolling: touch`，保证 iOS 惯性滚动。
- 酒馆前端本身跑在支持 ESM 的现代浏览器上，`inset` 这类现代 CSS 不需要做兼容降级。

## 二、悬浮窗 / 弹窗（如编辑 Modal）

**方法**：`position: fixed` + 半透明遮罩层，居中用 `flex`

**要点**：

- 遮罩层（backdrop）：`position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2147483645;`
- 弹窗本体不需要算 `left/top`，靠 flex 居中。
- 必须挂在 `document.body` 上（不是面板内部），否则父容器的 `overflow: hidden` 或 `transform` 会干扰。
- 关闭面板时记得清除残留弹窗：`if (bd) bd.remove()`
- `pointer-events: auto` 只给弹窗本体；遮罩层也用 `pointer-events: auto`，并支持点击遮罩关闭。

## 三、跟随小窗（如地理 Info Box）

**方法**：`position: absolute`，挂在 canvas 的直接父容器上

| 项目 | 规则 |
| --- | --- |
| 挂载位置 | `canvas.parentElement`（不要用 `getElementById` 查——可能有 ID 重复） |
| 父容器要求 | 必须有 `position: relative`（代码中防御性设置） |
| 坐标计算 | 与 `geoHitTest` 用**同一套 API**：要么都用 `getBoundingClientRect()`，要么都用 `offsetWidth`。**混用是移动端错位的第一大杀手** |
| transform 补偿 | `scaleX = rect.width / offsetWidth`，`left` 和 `top` 最后除以 scale 再赋值 |
| 边界 clamp | 双向都做：`Math.max(margin, Math.min(left, cw - boxW - margin))`。单向 clamp 在窄屏上会把小窗怼死在角落 |
| 内容滚动 | 简介区域加 `max-height: 120px; overflow-y: auto; -webkit-overflow-scrolling: touch;` |
| 不要用 `position: fixed` | 祖先链上大概率有 `transform`，`fixed` 会退化；且 `fixed` 浮层会遮挡 canvas 的触摸事件 |

## 四、触屏事件处理（通用要点）

```javascript
// 1. touchstart 必须 preventDefault，否则浏览器可能把手势抢走当滚动
c.ontouchstart = function(e) {
    e.preventDefault();
    // ...
};

// 2. touchmove 里也要 preventDefault（阻止页面跟着动）
c.ontouchmove = function(e) {
    e.preventDefault();
    // ...
};

// 3. 必须补 touchcancel（来电/通知栏/系统手势会触发）
c.ontouchcancel = function() {
    geoIsPanning = false;
    geoLastTouchDist = 0;
};

// 4. 拖拽判定阈值：桌面 4px 够用，手机建议 8-10px
//    手指按下到抬起几乎不可能 0 位移
if (Math.abs(dx) > 8 || Math.abs(dy) > 8) geoDragMoved = true;
```

补充：`touchcancel` 不补的典型症状是"缩放状态卡住"——手指被系统手势打断后 `geoIsPanning` 一直是 true，下一次触摸直接跳变。

## 五、诊断模板（下次出问题直接跑）

```javascript
// 塞到 updateGeoInfoBox 开头，看数值是否分裂
var rect = geoCanvas.getBoundingClientRect();
console.log(
    'rect:', rect.width, rect.height,
    'offset:', geoCanvas.offsetWidth, geoCanvas.offsetHeight,
    'visualViewport:', window.visualViewport && window.visualViewport.width
);
// 查祖先链 transform
var el = geoCanvas;
while (el) {
    var t = getComputedStyle(el).transform;
    if (t && t !== 'none') console.log('transform祖先:', el.id || el.className, t);
    el = el.parentElement;
}
```

判读方式：`rect.width` 与 `offsetWidth` 不等，说明存在缩放或 CSS 尺寸干扰；两者都正常但仍错位，就往上找 `transform` 祖先——打印出来的那一个通常就是元凶。

## 核心原则（一句话）

> **三处代码（渲染、点击检测、小窗定位）必须用同一个坐标系取值；触屏事件必须 `preventDefault` 明确接管；`fixed` 只用于直接挂 body 的全屏层，跟随元素永远用 `absolute`。**

## 与本工作区其它文档的关系

- 挂载点、主题变量、移动端判断（`ctx.isMobile`）见 `16-ui-i18n`。
- 出现"改了没生效 / 表现和代码不符"时的定位顺序见 `22-local-dev-loop`、`23-debugging`。
- 涉及 Service Worker 或 Early Bridge 改道请求导致 UI 异常时，额外检查其匹配范围（见 `24-security-review` 的网络与外联一节）。
