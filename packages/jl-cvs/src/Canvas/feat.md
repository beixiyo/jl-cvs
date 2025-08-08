## 功能记录（无限画布 Canvas）

日期按最近在上。

- [x] 背景与样式
  - 背景默认白色，测试页使用 TailwindCSS 样式与 `lucide-react` 图标（白底工具栏、按钮样式）。
- [x] 视口与交互（M1）
  - 支持无限平移、缩放；滚轮围绕鼠标点缩放；DPR 适配。
  - 坐标转换：世界坐标 <-> 屏幕坐标。
- [x] 渲染引擎（M1）
  - 视口裁剪（线性候选，场景线性扫描，后续接入 QuadTree）。
  - 统一合成矩阵：`setTransform(dpr*zoom, 0, 0, dpr*zoom, -panX*dpr*zoom, -panY*dpr*zoom)`。
- [x] 基础场景管理（M1）
  - `Scene` 管理形状集合、zIndex 排序、矩形查询。
- [x] 测试页功能
  - 工具栏：平移/矩形/画笔模式切换，放大/缩小，撤销、重做、清空。
  - 绘制矩形：按下开始、拖拽改变长宽、抬起完成。
  - 画笔路径：按下开始、移动追加点、抬起完成。
  - 简单历史记录：使用 `createUnReDoList` 记录新增形状快照（后续完善回放）。

待办（下一步）：
- [ ] 撤销/重做完善：记录形状 id 与操作（add/remove/modify），实现回放重建与删除。
- [ ] 将测试页 `DemoRect/DemoPath` 抽象为库内置 `Rectangle/Path`（M2）。
- [ ] 命中测试与选择框选、拖拽移动（M3）。
- [ ] QuadTree 空间索引、脏矩形与 Path2D 缓存（M4）。 

- [x] 问题分析与开源调研（拖拽清屏）
  - 现状：库内部仅使用单一 `<canvas>`。拖拽时出现“瞬时清空”的观感，原因是渲染循环在某些帧中发生“先清屏、未及时重绘”的间隙。改进方向：交互期间强制持续重绘（不依赖条件标记），或采用双缓冲（OffscreenCanvas）避免闪烁。
  - 参考库：`excalidraw/excalidraw`、`personalizedrefrigerator/js-draw`、`emilefokkema/infinite-canvas`、`thfrei/infinite-drawing-canvas`（建议转向 Excalidraw）。 

- [x] 闪烁修复（交互期连续渲染 + 可选双缓冲）
  - 在渲染引擎中新增 `setContinuousRendering`，交互（拖拽/绘制/滚轮缩放）期间强制每帧重绘，结束后关闭以节能。
  - 新增可选离屏缓冲（OffscreenCanvas 或普通 Canvas）合成，避免清屏-重绘间隙引发闪烁（默认关闭，可按需开启）。 