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
- **形状拖拽**：点击形状进行拖拽移动 ✨ **新功能**

### 4. 渲染引擎
- 高性能渲染管道
- 按需重绘机制
- 支持连续渲染模式

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
app.on('shapedragstart', (shape) => {
  console.log('开始拖拽:', shape.meta.id)
})

app.on('shapedrag', (shape) => {
  console.log('拖拽中:', shape.meta.id, shape.startX, shape.startY)
})

app.on('shapedragend', (shape) => {
  console.log('拖拽结束:', shape.meta.id)
})
```

### 交互逻辑

1. **形状检测**：点击时优先检测是否点击了形状
2. **拖拽优先级**：形状拖拽优先于画布拖拽
3. **坐标转换**：自动处理屏幕坐标到世界坐标的转换
4. **实时更新**：拖拽过程中实时更新形状位置并重新渲染

### 配置选项

```typescript
// 在创建 CanvasApp 时，交互功能默认启用
// 可以通过 enableBasicInteraction 方法控制

app.enableBasicInteraction(true)  // 启用所有交互（包括形状拖拽）
app.enableBasicInteraction(false) // 禁用所有交互
```

### 事件系统

- `shapedragstart`: 形状拖拽开始
- `shapedrag`: 形状拖拽进行中
- `shapedragend`: 形状拖拽结束
- `viewportchange`: 视口变化
- `shapeadded`: 形状添加
- `shaperemoved`: 形状移除

## 架构设计

### 核心组件

- **CanvasApp**: 应用门面，聚合所有功能
- **Scene**: 形状容器，管理形状集合
- **Viewport**: 视口管理，处理坐标转换
- **InteractionManager**: 交互管理，处理用户输入
- **RenderEngine**: 渲染引擎，处理绘制逻辑

### 形状系统

- **BaseShape**: 形状基类，定义通用接口
- **具体形状**: Rect, Circle, Arrow 等
- **isInPath**: 点击检测方法，每个形状实现自己的碰撞检测

## 示例

查看 `packages/test/src/views/Canvas` 中的完整示例，演示了：

- 基础形状创建
- 拖拽交互
- 事件监听
- 画布控制

运行测试：
```bash
cd packages/test
pnpm run dev
```

然后访问 Canvas 页面体验形状拖拽功能。 