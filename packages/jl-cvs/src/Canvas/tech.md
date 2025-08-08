## 无限画布技术说明（当前实现）

### 1. 架构概览
- CanvasApp（门面）：对外统一 API，组合 CanvasManager、Viewport、Scene、RenderEngine；管理生命周期与事件派发。
- CanvasManager：创建与管理 `<canvas>`，处理容器自适应、DPR 缩放、ResizeObserver。
- Viewport：维护世界坐标与屏幕坐标的映射（panX、panY、zoom），提供 worldToScreen/screenToWorld 等转换方法。
- Scene：图形容器与查询，维护 IShape 列表、zIndex 排序与矩形查询（初版线性扫描）。
- RenderEngine：渲染调度与绘制；支持交互期连续重绘、可选离屏缓冲（双缓冲），统一 setTransform 合成矩阵（dpr*zoom 与 pan）。
- Scheduler：封装 requestAnimationFrame 循环。

### 2. 坐标与变换
- 世界坐标：图形数据存储与场景空间索引使用的坐标。
- 屏幕坐标：CSS 像素；`CanvasManager` 负责设置 dpr 的基础缩放，使 1 单位对应 1 CSS 像素。
- 视口：`Screen = (World - pan) * zoom * dpr`，引擎通过 `ctx.setTransform(dpr*zoom, 0, 0, dpr*zoom, -panX*dpr*zoom, -panY*dpr*zoom)` 设置矩阵。
- 锚点缩放：`(a - pan') * z' = (a - pan) * z`，通过 `ratio = z/z'` 推导 `pan'`，保证围绕鼠标点缩放。

### 3. 渲染流程
1) 获取容器尺寸与 dpr，计算像素尺寸（pixelW/H）。
2) 清屏（或填充背景），设置变换矩阵（合成 dpr/zoom/pan）。
3) 计算可见世界矩形：`Viewport.getWorldVisibleRect`。
4) `Scene.queryByRect` 筛选候选图形（当前线性扫描）。
5) 按 zIndex 顺序依次调用 `shape.draw` 绘制。
6) 复原 dpr 基础状态，便于下一次清屏使用 CSS 像素。

- 连续重绘：在拖拽/绘制/滚轮等交互期间，启用 `setContinuousRendering(true)` 强制每帧渲染，交互结束关闭，避免“清屏后未及时重绘”的闪烁。
- 双缓冲（可选）：在 OffscreenCanvas 或离屏 Canvas 绘制，再 `drawImage` 到可见画布，进一步提升稳定性与避免闪烁（默认关闭）。

### 4. 事件与交互
- 外部页面：在 `CanvasStage` 中统一绑定 pointer/wheel 事件，归一化模式（平移/矩形/画笔）。
- 平移：左键按下进入拖拽，根据当前 zoom 换算 pan 位移；交互期间开启连续重绘。
- 缩放：滚轮以鼠标点为锚点缩放，调用 `Viewport.setZoom(nextZoom, anchorWorldPoint)`。
- 绘制：
  - 矩形：pointerdown 创建，pointermove 更新 width/height，pointerup 完成。
  - 画笔：pointerdown 新建路径并添加首点，pointermove 追加点，pointerup 完成。

### 5. 图形接口（IShape）
- 必需：`id`、`zIndex`、`visible`、`style`、`getBounds()`、`draw(RenderContext)`、`containsPoint(worldPt)`、`markDirty()`。
- 当前测试图形：DemoRect（矩形）、DemoPath（手绘路径，支持颜色/线宽）、DemoImage（图片）。

### 6. 性能策略（当前与预留）
- 已实现：
  - 统一 setTransform 合成矩阵，减少状态切换；
  - 连续重绘与可选双缓冲；
  - dpr 支持与 ResizeObserver 自适应；
- 预留：
  - 视口裁剪接入 QuadTree 空间索引；
  - 脏矩形与 Path2D 缓存；
  - 批量样式切换与最小化 save/restore。

### 7. 历史（undo/redo）现状与计划
- 现状（测试页层）：使用 `createUnReDoList` 记录快照；对新增图形的 undo 执行 remove（演示用），redo 暂为指针移动占位。
- 计划：引入“命令模式 + 历史栈”（Add/Remove/Modify/Transform/CompositeCommand），实现可逆与可重放的完整历史系统；支持分组与合并（coalesce）。

### 8. 与现有模块的协作
- `packages/jl-cvs/src/Shapes/**` 可通过适配器桥接到 IShape；
- 工具函数（几何、DPI）在 `utils/` 提供；
- 对外导出在 `Canvas/index.ts` 暴露 `CanvasApp` 与类型。

### 9. 后续增强路线
- M2：内置基础图形（Rectangle/Circle/Line/Path/Image），命中测试与选择；
- M3：框选与拖拽编辑、键盘快捷键；
- M4：QuadTree、脏矩形、Path2D 缓存；
- M5：命令式历史系统； 