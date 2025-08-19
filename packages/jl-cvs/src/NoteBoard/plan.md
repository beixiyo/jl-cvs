# NoteBoard2 无限画布升级计划

## 目标概述

基于现有的 `NoteBoard.ts` 优秀架构，融合 `packages/jl-cvs/src/Canvas` 模块的无限画布能力，创建 `NoteBoard2.ts`。保留现有的所有功能特性，将 CSS transform 方式的缩放拖拽升级为 Canvas API 实现的真正无限画布。

## 现有架构分析

### NoteBoard.ts 的优秀特性 ✨

1. **完善的模块化设计**
   - `NoteBoardEvents`: 统一的事件处理
   - `NoteBoardRenderer`: 渲染逻辑管理
   - `NoteBoardInteraction`: 交互逻辑处理
   - `NoteBoardBase`: 基础功能抽象

2. **丰富的功能实现**
   - ✅ 多种绘制模式：笔刷、橡皮擦、矩形、圆形、箭头
   - ✅ 完整的历史记录系统（撤销/重做）
   - ✅ 形状拖拽和交互
   - ✅ 分层画布管理
   - ✅ 导出功能
   - ✅ 样式系统

3. **当前的缩放拖拽实现**
   - 使用 CSS `transform: scale() translate()` 
   - 使用 `transformOrigin` 设置缩放中心
   - 通过 `setTransform()` 方法统一管理变换

### Canvas 模块的无限画布能力 🚀

1. **真正的无限画布**
   - 世界坐标系与屏幕坐标系分离
   - Canvas API 级别的变换矩阵
   - 视口裁剪和性能优化

2. **精确的坐标转换**
   - `screenToWorld()` / `worldToScreen()`
   - 锚点缩放算法
   - DPR 适配

## 核心升级策略

### 🎯 **保留优秀架构，升级核心能力**

不重新设计架构，而是在现有模块基础上增强：

1. **保留现有模块结构**
   - `NoteBoardEvents` → 增强坐标转换
   - `NoteBoardRenderer` → 升级为世界坐标渲染
   - `NoteBoardInteraction` → 增加视口管理
   - `NoteBoardBase` → 替换 CSS transform 为 Canvas API

2. **新增视口管理模块**
   - `NoteBoard2Viewport`: 借鉴 Canvas 模块的 Viewport 类
   - 管理世界坐标与屏幕坐标转换
   - 实现锚点缩放

3. **升级渲染系统**
   - 使用 Canvas `setTransform()` 替代 CSS transform
   - 实现视口裁剪优化
   - 保持现有的分层渲染逻辑

## 实施计划

### 阶段一：视口系统集成（M1）

**目标**：将 Canvas 的视口能力集成到 NoteBoard

**任务清单**：

1. **创建 NoteBoard2Viewport.ts**
   ```typescript
   // 直接借鉴 Canvas/core/Viewport.ts 的实现
   class NoteBoard2Viewport {
     // 世界坐标与屏幕坐标转换
     screenToWorld(point: Point): Point
     worldToScreen(point: Point): Point
     // 锚点缩放
     setZoom(zoom: number, anchorWorldPoint?: Point): void
     // 平移
     setPan(pan: Point): void
   }
   ```

2. **升级 NoteBoardBase.ts**
   - 继承 NoteBoardBase时，重写对应的方法，将 `scale/translateX/translateY` 改为 `viewport` 实例
   - 将 `setTransform()` 从 CSS 方式改为 Canvas API 方式
   - 保持所有现有 API 接口不变

3. **升级坐标转换**
   - 在事件处理中加入坐标转换
   - 确保笔刷和形状使用世界坐标存储

**验收标准**：
- ✅ 鼠标拖拽平移正常（Canvas API 方式）
- ✅ 滚轮缩放以鼠标为中心
- ✅ 现有功能完全保持（笔刷、形状、撤销重做）

### 阶段二：渲染系统升级（M2）

**目标**：实现世界坐标系下的高性能渲染

**任务清单**：

1. **升级 NoteBoardRenderer.ts**
   ```typescript
   class NoteBoardRenderer {
     // 新增：设置世界坐标变换矩阵
     setWorldTransform(ctx: CanvasRenderingContext2D): void
     
     // 升级：世界坐标系下重绘
     redrawAll(): void
     
     // 新增：视口裁剪优化
     getVisibleShapes(): BaseShape[]
   }
   ```

2. **升级形状渲染**
   - 确保所有形状在世界坐标系下正确渲染
   - 保持现有的样式和混合模式逻辑
   - 优化大量图形时的渲染性能

3. **保持分层逻辑**
   - 保留现有的多画布分层架构
   - 每个画布都应用相同的世界坐标变换

**验收标准**：
- ✅ 所有图形在缩放平移时正确显示
- ✅ 笔刷粗细在缩放时保持视觉一致
- ✅ 形状拖拽在世界坐标系下正常工作

### 阶段三：交互系统增强（M3）

**目标**：优化交互体验和性能

**任务清单**：

1. **升级 NoteBoardEvents.ts**
   - 在所有鼠标事件中加入坐标转换
   - 优化拖拽和缩放的响应性
   - 保持现有的事件分发机制

2. **升级 NoteBoardInteraction.ts**
   - 确保形状创建和编辑使用世界坐标
   - 优化形状选择和拖拽的精度
   - 保持现有的模式切换逻辑

3. **性能优化**
   - 实现连续渲染模式（交互期间）
   - 添加视口裁剪，只渲染可见区域
   - 优化大量图形时的交互响应

**验收标准**：
- ✅ 所有交互模式正常工作
- ✅ 形状创建和编辑精度提升
- ✅ 大量图形时交互流畅

### 阶段四：历史记录兼容（M4）

**目标**：确保撤销重做在新坐标系下正常工作

**任务清单**：

1. **坐标系兼容**
   - 确保历史记录中的坐标数据正确
   - 处理坐标转换的一致性
   - 保持现有的历史记录格式

2. **渲染一致性**
   - 撤销重做后的渲染结果正确
   - 视口状态与历史记录的同步
   - 保持现有的历史记录逻辑

**验收标准**：
- ✅ 撤销重做功能完全正常
- ✅ 历史记录不会导致坐标错乱
- ✅ 与现有 NoteBoard 的数据格式兼容

### 阶段五：高级功能完善（M5）

**目标**：实现高级无限画布功能

**任务清单**：

1. **视口裁剪优化**
   - 实现智能的可见区域计算
   - 只渲染视口内的图形
   - 优化大量图形的性能

2. **导出功能升级**
   - 确保导出时坐标转换正确
   - 支持指定区域导出
   - 保持现有的导出格式

3. **高级交互**
   - 实现更精确的形状选择
   - 支持框选功能
   - 优化触摸设备支持

**验收标准**：
- ✅ 大量图形时性能优秀
- ✅ 导出功能完全正常
- ✅ 高级交互体验流畅

## 核心技术实现

### 1. 视口管理（核心升级）

```typescript
// 替换现有的 CSS transform 方式
class NoteBoard2 extends NoteBoardBase {
  viewport: NoteBoard2Viewport
  
  // 重写原有的 setTransform 方法
  setTransform(): void {
    // 对每个画布应用世界坐标变换
    this.canvasList.forEach(item => {
      this.viewport.applyTransform(item.ctx)
    })
    this.requestRender()
  }
  
  // 新增：坐标转换方法
  screenToWorld(point: Point): Point {
    return this.viewport.screenToWorld(point)
  }
  
  worldToScreen(point: Point): Point {
    return this.viewport.worldToScreen(point)
  }
}
```

### 2. 事件坐标转换

```typescript
// 在 NoteBoardEvents 中升级事件处理
onMousedown = (e: MouseEvent) => {
  // 转换为世界坐标
  const worldPoint = this.noteBoard.screenToWorld({
    x: e.offsetX,
    y: e.offsetY
  })
  
  // 使用世界坐标进行后续处理
  if (this.noteBoard.interaction.isBrushMode()) {
    this.noteBoard.currentBrush = new Brush({
      startX: worldPoint.x,
      startY: worldPoint.y,
      // ...
    })
  }
}
```

### 3. 渲染系统升级

```typescript
// 在 NoteBoardRenderer 中升级渲染逻辑
redrawAll(): void {
  this.noteBoard.clear(false)
  
  // 设置世界坐标变换矩阵
  this.noteBoard.canvasList.forEach(item => {
    this.noteBoard.viewport.applyTransform(item.ctx)
  })
  
  // 获取可见图形（视口裁剪优化）
  const visibleShapes = this.getVisibleShapes()
  
  // 渲染可见图形
  this.renderShapes(visibleShapes)
}
```

## 兼容性保证

### 1. API 兼容性
- 保持所有现有的公共方法签名
- 保持现有的事件接口
- 保持现有的配置选项

### 2. 功能兼容性
- 所有现有功能必须正常工作
- 历史记录格式保持兼容
- 导出格式保持一致

### 3. 性能提升
- 大量图形时性能更好
- 缩放平移更流畅
- 内存使用更优化

## 实施优势

### 1. 风险最小化
- 基于成熟的现有架构
- 渐进式升级，每个阶段可独立验证
- 保持现有功能完整性

### 2. 开发效率
- 复用现有的优秀模块
- 借鉴 Canvas 模块的成熟实现
- 模块化升级，易于测试和调试

### 3. 用户体验
- 保持现有的使用习惯
- 获得真正的无限画布能力
- 性能和交互体验显著提升

## 总结

这个计划充分利用了 NoteBoard.ts 现有的优秀架构，通过精准的模块升级实现无限画布功能。相比重新设计，这种方式风险更小、效率更高，同时能够保证现有功能的完整性和用户体验的连续性。核心是将 CSS transform 方式升级为 Canvas API 方式，并引入世界坐标系统，从而实现真正的无限画布能力。

## 实施进度

### ✅ 已完成功能

#### 1. 事件绑定系统重构 (2024-12-19)
**问题**：原有实现直接重写 `this.events.onWheel` 等方法，导致内存泄漏和事件冲突。

**解决方案**：
- 创建独立的无限画布事件处理器：
  - `bindInfiniteCanvasEvents()` - 绑定无限画布专用事件
  - `rmInfiniteCanvasEvents()` - 清理无限画布事件
  - `onInfiniteCanvasMousedown/move/up/leave/wheel/contextmenu` - 专用事件处理方法
- 重写 `rmEvent()` 和 `bindEvent()` 方法，支持模式切换
- 在 `dispose()` 中正确清理资源

**验证结果**：
- ✅ 右键拖拽画布功能正常
- ✅ 拖拽模式左键拖拽功能正常  
- ✅ 滚轮以鼠标位置为中心缩放功能正常
- ✅ 笔刷绘制在缩放拖拽后坐标正确

#### 2. 视口管理器完善 (2024-12-19)
**实现**：
- 为 `NoteBoard2Viewport` 添加 `panBy(dx, dy)` 方法，与 Canvas Viewport 保持一致
- 修复拖拽逻辑：使用 `panBy(-dx/zoom, -dy/zoom)` 确保拖拽方向正确
- 完善坐标转换：`screenToWorld()` 和 `worldToScreen()` 方法

**验证结果**：
- ✅ 拖拽方向正确，符合用户直觉
- ✅ 缩放锚点功能正常
- ✅ 坐标转换计算正确

#### 3. 图形绘制坐标转换 (2024-12-19)
**问题**：Rect、Circle、Arrow 等形状在缩放拖拽后坐标不正确，但 Brush 笔刷正常。

**分析**：
- Brush 使用了 `screenToWorld()` 转换，坐标正确
- DrawShape 直接使用 `e.offsetX/offsetY`（屏幕坐标），未进行世界坐标转换
- 需要在传递给 DrawShape 之前转换坐标

**解决方案**：
- 创建 `transformMouseEventForDrawShape()` 方法，将屏幕坐标转换为世界坐标
- 修改图形模式的事件处理：
  - `onInfiniteCanvasMousedown` - 转换坐标后调用 `drawShape.handleMouseDown()`
  - `onInfiniteCanvasMousemove` - 转换坐标后调用 `drawShape.handleMouseMove()`
  - `onInfiniteCanvasMouseup` - 转换坐标后调用 `drawShape.handleMouseUp()`
  - `onInfiniteCanvasMouseLeave` - 调用 `drawShape.handleMouseLeave()`
- 使用 `Object.defineProperty` 重写事件对象的 `offsetX/offsetY` 属性

**验证结果**：
- ✅ Rect、Circle、Arrow 等图形在缩放拖拽后坐标正确
- ✅ 图形绘制使用世界坐标，与视口变换保持一致
- ✅ 所有绘制模式（笔刷、图形）都支持无限画布

### 🔄 进行中功能

*目前没有进行中的功能*

### 📋 待实施功能

#### 4. 渲染性能优化
- [ ] 实现视口裁剪，只渲染可见区域内的图形
- [ ] 优化 `redrawAllWithWorldTransform()` 性能
- [ ] 添加渲染缓存机制

#### 5. 历史记录兼容性
- [ ] 确保撤销/重做在无限画布模式下正常工作
- [ ] 验证历史记录的坐标一致性

#### 6. API 完善
- [ ] 添加更多视口控制方法
- [ ] 完善事件回调参数
- [ ] 添加边界限制选项