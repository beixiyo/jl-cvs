# Canvas 模块技术文档

## 1. 概述

Canvas 模块提供了一个功能完整的无限画布系统，支持形状管理、视口控制、交互操作等功能。该模块基于 HTML5 Canvas 实现，具有高性能渲染能力，支持平移、缩放、形状拖拽、多种绘制模式等交互功能。

## 2. 核心功能

### 2.1 形状管理
- 支持多种形状类型（矩形、圆形、箭头、画笔等）
- 基于 zIndex 的层级管理
- 形状的显示/隐藏控制
- 形状的添加、删除、查询

### 2.2 视口控制
- 无限画布平移
- 多级缩放（支持锚点缩放）
- 世界坐标与屏幕坐标转换
- 视口状态管理

### 2.3 交互功能
- **画布拖拽**：点击空白区域拖拽画布
- **滚轮缩放**：使用滚轮进行缩放操作
- **形状拖拽**：点击形状进行拖拽移动
- **光标模式**：支持多种绘制模式（平移、矩形、圆形、箭头、画笔）

### 2.4 渲染引擎
- 高性能渲染管道
- 按需重绘机制
- 支持连续渲染模式
- 可选双缓冲渲染（离屏 Canvas）

## 3. 核心类和模块

Canvas 模块采用了分层架构设计，包含以下核心类：

### 3.1 CanvasApp（门面）
作为整个画布应用的入口点和协调者，组合了所有核心组件：
- 组合 CanvasManager、Viewport、Scene、RenderEngine、InteractionManager
- 管理应用生命周期与事件派发
- 提供对外统一 API

### 3.2 CanvasManager（Canvas 管理器）
负责管理 Canvas 元素和上下文：
- 创建和维护 `<canvas>` 节点
- 处理容器尺寸变化与 DPR 变化
- 提供 2D 上下文与尺寸查询

### 3.3 Viewport（视口）
维护世界坐标与屏幕坐标的映射关系：
- 管理 panX、panY、zoom 状态
- 提供世界坐标与屏幕坐标之间的转换
- 实现锚点缩放功能

### 3.4 Scene（场景）
管理场景中的所有形状对象：
- 维护形状列表与 id 索引
- 支持 zIndex 排序
- 提供矩形查询功能（当前为线性扫描，后续计划接入 QuadTree）

### 3.5 RenderEngine（渲染引擎）
负责画布渲染：
- 清屏、变换设置、视口裁剪候选、逐图形绘制
- 支持交互期连续重绘与可选双缓冲
- 视口裁剪优化（仅渲染可见区域的形状）

### 3.6 InteractionManager（交互管理器）
处理用户交互：
- 管理平移与缩放交互
- 管理形状拖拽交互
- 支持多种光标模式（平移、绘制等）

### 3.7 InputController（输入控制器）
处理底层输入事件：
- 绑定 Canvas 的 pointer/wheel 事件
- 将事件转发给上层处理

### 3.8 Scheduler（调度器）
封装 requestAnimationFrame 循环：
- 提供启动/停止/状态查询功能
- 驱动渲染引擎的帧循环

## 4. 初始化过程

### 4.1 创建 CanvasApp 实例
1. 传入配置选项（容器元素、背景色、缩放限制等）
2. 初始化默认配置参数
3. 创建 CanvasManager 实例管理 Canvas 元素
4. 创建 Viewport 实例管理视口状态
5. 创建 Scene 实例管理形状集合
6. 创建 RenderEngine 实例管理渲染流程
7. 创建 InteractionManager 实例管理交互

### 4.2 各组件初始化
- **CanvasManager**：创建 Canvas 元素并添加到容器，获取 2D 上下文，设置尺寸和 DPR
- **Viewport**：设置初始平移和缩放状态
- **Scene**：初始化空的形状集合
- **RenderEngine**：初始化渲染器，设置背景色和缓冲选项
- **InteractionManager**：创建 InputController 实例，设置交互选项

### 4.3 启动渲染循环
- 调用 RenderEngine.start() 启动渲染循环
- 请求首次渲染

## 5. 事件绑定和交互处理

### 5.1 事件绑定流程
1. InteractionManager 创建 InputController 实例
2. InputController 绑定 pointer 和 wheel 事件到 Canvas 元素
3. 事件处理函数将坐标转换为相对 Canvas 的坐标
4. 将处理后的事件转发给 InteractionManager

### 5.2 交互处理机制
#### 5.2.1 模式识别
InteractionManager 根据当前光标模式处理不同交互：
- **pan 模式**：支持画布拖拽和平移
- **绘制模式（rect/circle/arrow/draw）**：支持创建新形状

#### 5.2.2 形状拖拽优先级
无论当前是什么光标模式，点击形状时都会优先进行形状拖拽，而不是创建新形状。

#### 5.2.3 事件处理流程
1. **pointerdown**：检测点击位置
   - 首先检查是否点击了形状（形状拖拽优先级最高）
   - 如果没有点击形状且处于绘制模式，则开始创建新形状
   - 如果没有点击形状且处于平移模式，则准备画布拖拽
   
2. **pointermove**：
   - 如果正在绘制，则更新形状的结束点或添加路径点
   - 如果正在拖拽形状，则更新形状位置
   - 如果正在拖拽画布，则更新视口平移状态

3. **pointerup**：
   - 如果正在绘制，则结束绘制并触发相应事件
   - 如果正在拖拽形状，则结束拖拽并触发相应事件
   - 如果没有进行任何操作，则检测是否为点击事件

#### 5.2.4 滚轮缩放
- 阻止默认滚轮行为
- 计算缩放因子
- 以鼠标位置为锚点进行缩放

## 6. 性能特点

### 6.1 坐标变换优化
- 使用统一的 setTransform 合成矩阵，减少状态切换
- 世界坐标到屏幕坐标的高效转换

### 6.2 渲染优化
- **视口裁剪**：仅渲染与可见矩形相交的形状
- **连续重绘**：在交互期间强制每帧重绘，避免闪烁
- **可选双缓冲**：使用 OffscreenCanvas 或离屏 Canvas 绘制，再 drawImage 到可见画布

### 6.3 内存管理
- 对象复用和及时释放
- 事件监听器的正确绑定和解绑

### 6.4 高 DPI 支持
- 自动检测和适配设备像素比（DPR）
- 使用 ResizeObserver 监听容器尺寸变化

## 7. 未来规划

### 7.1 性能优化
- 接入 QuadTree 空间索引提升查询性能
- 实现脏矩形重绘机制
- 使用 Path2D 缓存静态形状路径

### 7.2 功能增强
- 完善撤销/重做系统，实现基于操作的重放机制
- 支持更多形状类型（文本、图片等）
- 实现框选和多选功能
- 添加键盘快捷键支持

### 7.3 扩展性改进
- 提供更丰富的事件系统
- 支持插件机制扩展功能
- 提供更完善的 API 文档和示例

## 8. 使用示例

```typescript
import { CanvasApp } from '@jl-org/cvs'
import { Rect, Circle } from '@jl-org/cvs'

// 创建画布应用
const app = new CanvasApp({
  el: document.getElementById('canvas-container')!,
  background: '#ffffff'
})

// 添加形状
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

// 设置光标模式
app.setCursorMode('rect')

// 设置绘制样式
app.setDrawOptions({
  shapeStyle: {
    strokeStyle: '#3b82f6',
    lineWidth: 2,
    fillStyle: '#3b82f620'
  }
})

// 监听事件
app.on('drawStart', (shape) => {
  console.log('开始绘制:', shape.meta.id)
})

app.on('shapeDragStart', (shape) => {
  console.log('开始拖拽:', shape.meta.id)
})
```

## 9. 总结

Canvas 模块是一个功能完善、性能优化的无限画布实现。它采用了模块化设计，各组件职责清晰，易于扩展和维护。通过视口裁剪、连续重绘、双缓冲等技术手段，确保了在大量图形元素下的流畅交互体验。该模块为构建复杂的图形编辑器、白板应用等提供了坚实的基础。