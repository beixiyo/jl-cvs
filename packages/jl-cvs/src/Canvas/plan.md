### 目标与范围

- **目标**: 在浏览器中实现高性能、可扩展的无限画布组件，支持无限拖拽、缩放、图形绘制与交互；提供清晰、稳定的 TypeScript API。
- **非目标**: 暂不实现复杂矢量编辑（布尔运算、文本排版）、协同编辑、持久化存储；作为后续增量能力。

### 架构总览

- **核心层**
  - `CanvasApp`（门面）：统一入口，聚合视口、渲染、场景、交互与事件系统；提供对外 API。
  - `CanvasManager`：DOM 与 2D 上下文管理、尺寸与 DPR 管理、可选多层 Canvas（主绘制层、命中测试层/离屏层）。
  - `Viewport`：世界坐标 <-> 屏幕坐标转换；平移、缩放与边界/阻尼控制；对齐缩放中心点（光标/特定点）。
  - `Scene`：场景树/显示列表，统一管理图形对象、ZIndex、可见性；维护空间索引（`QuadTree`）。
  - `RenderEngine`：渲染调度与绘制优化；视口裁剪、脏矩形、Path2D 缓存、批渲染；高 DPI 支持。
- **图形层**
  - `BaseShape`：抽象图形，规范 `draw(ctx)`, `getBounds()`, `containsPoint()`, `markDirty()` 等。
  - 具体图形：`Rectangle`, `Circle`, `Line`（初版），未来扩展 `Path`, `Image`, `Text` 等。
  - 适配层：与现有 `packages/jl-cvs/src/Shapes/**` 的 `libs/Rect.ts`, `libs/Circle.ts`, `libs/Arrow.ts` 进行适配桥接（可选）。
- **交互层**
  - `InputController`：统一鼠标/触摸/滚轮事件；归一化指针状态；节流与被动监听。
  - `InteractionManager`：命中测试、选中/多选、拖拽、框选、节点变换（移动/缩放/旋转基础）。
  - `HitTest`：结合 `QuadTree` 与形状 `containsPoint` 做精准拾取，支持选择优先级与容差。
- **算法与工具层**
  - `QuadTree`：世界坐标空间索引（动态更新）；用于命中与裁剪候选集合快速查询。
  - `ObjectPool`：可选对象池，复用临时对象（点、矩形、事件包装）。
  - `Scheduler`：`requestAnimationFrame` 渲染循环；批量更新与任务分片（大数据量场景）。
  - `Math/Geometry`：矩阵、向量、包围盒、相交判定与近似误差处理。

### 关键类型与接口（草案）

```ts
export type Float = number;
export interface Point { x: Float; y: Float }
export interface Size { width: Float; height: Float }
export interface Rect { x: Float; y: Float; width: Float; height: Float }
export type ShapeId = string & { __brand: 'ShapeId' };

export interface ShapeStyle {
  fill?: string | CanvasGradient | CanvasPattern;
  stroke?: string | CanvasGradient | CanvasPattern;
  lineWidth?: Float;
  lineDash?: Float[];
  opacity?: Float; // 0..1
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  dpiScale: Float;
}

export interface IShape {
  readonly id: ShapeId;
  zIndex: number;
  visible: boolean;
  style: ShapeStyle;
  getBounds(): Rect; // 世界坐标
  draw(rc: RenderContext): void; // 仅绘制
  containsPoint(worldPt: Point, tolerance?: Float): boolean; // 命中
  markDirty(): void; // 通知场景与渲染器
}

export interface CanvasAppOptions {
  container: HTMLElement;
  background?: string;
  enableOffscreen?: boolean; // 可选 OffscreenCanvas
  minZoom?: Float; maxZoom?: Float; zoom?: Float;
  pan?: Point; // 初始平移（世界坐标）
  enableDblClickZoom?: boolean;
  wheelZoomSpeed?: Float; // 默认 1.1
  dragInertia?: boolean; // 是否加入拖拽惯性
}

export interface ViewportState {
  panX: Float; panY: Float; zoom: Float;
}

export interface ICanvasApp {
  getViewport(): Viewport;
  getScene(): Scene;
  add(shape: IShape): void;
  remove(id: ShapeId): void;
  clear(): void;
  worldToScreen(pt: Point): Point;
  screenToWorld(pt: Point): Point;
  setZoom(zoom: Float, anchor?: Point): void; // anchor 为屏幕或世界点，见重载
  panBy(dx: Float, dy: Float): void;
  fitToScreen(bounds?: Rect, padding?: number): void;
  exportAsImage(type?: 'image/png' | 'image/jpeg', quality?: number): Promise<string>; // dataURL
  on(event: CanvasEventType, handler: Function): () => void; // 反注册
  dispose(): void;
}
```

### 类职责与关键方法（草案）

- **CanvasApp**
  - 组合 `CanvasManager`, `Viewport`, `Scene`, `RenderEngine`, `InputController`, `InteractionManager`。
  - 维护应用状态与生命周期；对外暴露高层 API。
- **CanvasManager**
  - 创建与管理 `<canvas>` 元素（主层、可选命中/离屏层）。
  - 处理容器尺寸变化（`ResizeObserver`）与 DPR 变更；自动缩放画布像素尺寸。
  - 提供 `getContext()`, `getSize()`, `setBackground()` 等。
- **Viewport**
  - 状态：`panX`, `panY`, `zoom`; 约束：`minZoom`, `maxZoom`。
  - 坐标变换：`worldToScreen(pt)`, `screenToWorld(pt)`；矩阵计算缓存。
  - 交互：`zoomAt(anchorScreenPt, factor)`, `panBy(dx, dy)`；触发 `viewportchange` 事件。
- **Scene**
  - 管理 `IShape[]`；支持 `add/remove/clear` 与 `sortByZIndex()`。
  - 维护 `QuadTree`（以 `getBounds()` 更新/重建）。
  - 提供 `queryByRect(rect)`（用于裁剪/命中候选）。
- **RenderEngine**
  - 主循环：`tick()`（raf）；脏区域与全量渲染策略切换。
  - 视口裁剪：将 `viewport.getWorldVisibleRect()` 作为查询窗口，从 `QuadTree` 获取候选后逐个 `draw`。
  - 优化：`Path2D` 缓存（静态形状）、`save/restore` 最小化、批量设置样式。
- **InteractionManager**
  - 结合 `InputController` 归一化的指针事件，执行命中测试与状态机（空闲/框选/拖拽）。
  - 选择变化事件：`selectionchange`；图形移动事件：`shapetransform`。
- **HitTest**
  - 先 `QuadTree` 粗筛，再按 zIndex 逆序做 `containsPoint` 精筛；支持容差与近似线段命中。
- **QuadTree**
  - 以世界坐标轴对齐包围盒构建；节点容量/最大深度可配置；增删改触发节点更新。

### 坐标系与视口

- 世界坐标：形状数据与场景索引使用的坐标系。
- 屏幕坐标：Canvas 像素空间（已考虑 DPR 缩放）。
- `Viewport` 维护 `panX/panY/zoom`，并提供：
  - `worldToScreen({x,y}) => { x': (x - panX) * zoom, y': (y - panY) * zoom }`
  - `screenToWorld({x',y'}) => { x: x'/zoom + panX, y: y'/zoom + panY }`
  - 高 DPI：`CanvasManager` 提供 `dpiScale`，渲染时 `ctx.scale(dpiScale, dpiScale)`，避免模糊。

### 交互与事件

- 支持：
  - 左键拖拽平移（空白处）；滚轮缩放（以光标为缩放中心）；双击快速缩放切换（可选）。
  - 选中/多选（Shift/框选）；拖拽移动形状；后续可扩展旋转/缩放手柄。
- 事件：
  - `viewportchange`, `pointerdown`, `pointermove`, `pointerup`, `wheelzoom`, `selectionchange`, `shapeadded`, `shaperemoved`, `shapetransform`。

### 性能优化策略

- **视口裁剪**：仅渲染与可见矩形相交的形状；候选由 `QuadTree` 返回。
- **脏矩形**：形状变动或视口微小变化时精确重绘；大范围变化退化为全量渲染。
- **对象池**：`Point/Rect/EventWrapper` 等小对象复用，降低 GC 压力。
- **批次渲染**：尽可能减少 `ctx.save/restore`；按样式分批（后续可选）。
- **Path2D/缓存**：静态形状缓存路径；几何/样式变更时失效。
- **调度**：`requestAnimationFrame` 统一刷帧；交互高优先级更新（平移/缩放）；渲染时间切片以保证 60FPS。
- **OffscreenCanvas**（可选）：在支持环境中启用工作线程渲染；主线程仅处理输入与合成。

### 与现有 `packages/jl-cvs/src/Shapes/**` 的关系

- 现有 `Shapes` 中的 `libs/Rect.ts`, `libs/Circle.ts`, `libs/Arrow.ts` 可通过适配器实现为 `IShape`：
  - 读取其几何数据与样式，桥接 `draw/containsPoint/getBounds`。
  - 初版先提供内置 `Rectangle`, `Circle`, `Line`，保证独立性；适配作为增量迭代。

### 目录结构（拟定）

```
packages/jl-cvs/src/Canvas/
  plan.md
  index.ts
  core/
    CanvasApp.ts
    CanvasManager.ts
    Viewport.ts
    Scene.ts
    RenderEngine.ts
    Scheduler.ts
  shapes/
    BaseShape.ts
    Rectangle.ts
    Circle.ts
    Line.ts
    adapters/
      ExistingShapeAdapter.ts
  interaction/
    InputController.ts
    InteractionManager.ts
    HitTest.ts
    Selection.ts
  spatial/
    QuadTree.ts
  utils/
    math.ts
    geometry.ts
    pool.ts
    dpi.ts
    types.ts
  constants.ts
```

### 对外 API（草案）

```ts
const app = new CanvasApp({
  container: document.getElementById('canvas-root')!,
  background: '#0b0d10',
  minZoom: 0.1,
  maxZoom: 8,
});

// 添加形状
const rect = new Rectangle({ x: 0, y: 0, width: 200, height: 100, style: { fill: '#2dd4bf' } });
app.add(rect);

// 视口操作
app.setZoom(1.2, { x: 400, y: 300 }); // 围绕屏幕点缩放
app.panBy(50, 0);

// 命中与选择事件
app.on('selectionchange', (ids: ShapeId[]) => console.log(ids));

// 导出图片
const dataUrl = await app.exportAsImage('image/png');
```

### 迭代里程碑

- **M0 设计**：本文档评审与冻结（你确认后进入实现）。
- **M1 框架搭建**：`CanvasManager`, `Viewport`, `Scene`, `RenderEngine` 框架与主循环；空场景渲染。
- **M2 基础图形**：`BaseShape`, `Rectangle`, `Circle`, `Line`；绘制与命中；`QuadTree` 初版；视口裁剪。
- **M3 交互**：平移/缩放、选择/多选、拖拽移动；事件总线；基本热区手柄（可选）。
- **M4 性能**：脏矩形、对象池、Path2D 缓存；DPR 与 Resize 完整支持；60FPS 优化。
- **M5 适配与导出**：`Shapes` 适配器；`exportAsImage`；简单单元测试与示例页面。
- **M6 可选增强**：OffscreenCanvas/Worker 渲染；批渲染；键盘快捷操作；撤销重做（复用 `utils/unRedoList.ts`）。

### 验收标准

- 在 5k+ 简单形状（矩形/圆/线）场景中，拖拽与缩放交互稳定 60FPS（中高端机器，Chrome）。
- API 与类型定义完善，具备示例与 JSDoc 注释；关键模块具备基础单测。
- 代码结构清晰，易于扩展新的图形与交互能力。 