# Canvas 模块

Canvas 模块提供了一个功能完整的无限画布系统，支持形状管理、视口控制、交互操作等功能。

## 主要特性

### 1. 形状管理
- 支持多种形状类型（矩形、圆形、箭头等）
- 基于 zIndex 的层级管理
- 形状的显示/隐藏控制
- 形状的添加、删除、查询

### 2. 视口控制
- 无限画布平移
- 多级缩放（支持锚点缩放）
- 世界坐标与屏幕坐标转换
- 视口状态管理

### 3. 交互功能
- **画布拖拽**：点击空白区域拖拽画布
- **滚轮缩放**：使用滚轮进行缩放操作
- **形状拖拽**：点击形状进行拖拽移动
- **光标模式**：支持多种绘制模式 ✨ **新功能**

### 4. 渲染引擎
- 高性能渲染管道
- 按需重绘机制
- 支持连续渲染模式

## 光标模式功能 ✨ 新功能

### 支持的模式

- **`pan`** - 平移模式（默认）：可以拖拽画布和形状
- **`rect`** - 矩形绘制模式：拖拽绘制矩形
- **`circle`** - 圆形绘制模式：拖拽绘制圆形
- **`arrow`** - 箭头绘制模式：拖拽绘制箭头
- **`draw`** - 笔刷绘制模式：自由绘制（预留接口）

### 使用方式

```typescript
import { CanvasApp } from '@jl-org/cvs'

// 创建画布应用
const app = new CanvasApp({
  el: document.getElementById('canvas-container'),
  background: '#ffffff'
})

// 设置光标模式
app.setCursorMode('rect') // 切换到矩形绘制模式

// 设置绘制样式
app.setDrawOptions({
  shapeStyle: {
    strokeStyle: '#3b82f6',
    lineWidth: 2,
    fillStyle: '#3b82f620'
  }
})

// 监听绘制事件
app.on('drawStart', (shape) => {
  console.log('开始绘制:', shape.meta.id)
})

app.on('drawing', (shape) => {
  console.log('绘制中:', shape.meta.id)
})

app.on('drawEnd', (shape) => {
  console.log('绘制完成:', shape.meta.id)
})
```

### 交互逻辑

1. **模式切换**：通过 `setCursorMode()` 方法切换不同的绘制模式
2. **绘制过程**：在绘制模式下，按下鼠标开始绘制，拖拽调整大小，释放完成绘制
3. **样式设置**：通过 `setDrawOptions()` 设置绘制的颜色、线宽、填充等样式
4. **事件监听**：提供 `drawStart`、`drawing`、`drawEnd` 事件监听绘制过程
5. **光标样式**：自动根据模式切换光标样式（平移模式为默认光标，绘制模式为十字光标）
6. **优先级处理**：形状拖拽在任何模式下都有最高优先级，点击形状时会优先拖拽而不是绘制

### 笔刷绘制模式

笔刷模式（`draw`）支持自由绘制，与其他形状模式不同：

- **矩形/圆形/箭头**：拖拽绘制固定形状，从起点拖拽到终点
- **笔刷**：自由绘制，鼠标移动轨迹即为绘制路径

```typescript
// 切换到笔刷模式
app.setCursorMode('draw')

// 设置笔刷样式
app.setDrawOptions({
  shapeStyle: {
    strokeStyle: '#ff0000',
    lineWidth: 3
    // 注意：笔刷模式不使用 fillStyle
  }
})
```

## 形状拖拽功能

### 使用方式

```typescript
import { CanvasApp } from '@jl-org/cvs'
import { Rect, Circle } from '@jl-org/cvs'

// 创建画布应用
const app = new CanvasApp({
  container: document.getElementById('canvas-container'),
  background: '#ffffff'
})

// 添加可拖拽的形状
const rect = new Rect({
  startX: 100,
  startY: 100,
  shapeStyle: {
    fillStyle: '#3b82f6',
    strokeStyle: '#1d4ed8',
    lineWidth: 2
  },
  meta: {
    id: 'my-rect',
    zIndex: 1,
    visible: true
  }
})
rect.endX = 250
rect.endY = 200
app.add(rect)

// 监听拖拽事件
app.on('shapeDragStart', (shape) => {
  console.log('开始拖拽:', shape.meta.id)
})

app.on('shapeDrag', (shape) => {
  console.log('拖拽中:', shape.meta.id, shape.startX, shape.startY)
})

app.on('shapeDragEnd', (shape) => {
  console.log('拖拽结束:', shape.meta.id)
})
```

### 交互逻辑

1. **形状检测**：点击时优先检测是否点击了形状
2. **拖拽优先级**：形状拖拽在任何模式下都有最高优先级，优先于画布拖拽和绘制功能
3. **坐标转换**：自动处理屏幕坐标到世界坐标的转换
4. **实时更新**：拖拽过程中实时更新形状位置并重新渲染
5. **跨模式支持**：无论当前是什么光标模式，都可以拖拽已存在的形状 