/*
 * 基础类型与接口定义
 */

/** 浮点数类型 */
export type Float = number

/** 平面点坐标 */
export interface Point { x: Float, y: Float }

/** 尺寸（宽高） */
export interface Size { width: Float, height: Float }

/** 轴对齐矩形 */
export interface Rect { x: Float, y: Float, width: Float, height: Float }

/** 形状唯一标识（品牌化字符串） */
export type ShapeId = string & { __brand: 'ShapeId' }

/**
 * 形状绘制样式
 * - 可选填充与描边，包含线宽、虚线与透明度
 */
export interface ShapeStyle {
  fill?: string | CanvasGradient | CanvasPattern
  stroke?: string | CanvasGradient | CanvasPattern
  lineWidth?: Float
  lineDash?: Float[]
  /** 透明度，0..1 */
  opacity?: Float
}

/** 为了避免循环依赖，这里使用 type-only import 引入 Viewport */
import type { Viewport } from '../core/Viewport'

/**
 * 绘制上下文
 * - 携带 2D 上下文、视口与 dpr 比例
 */
export interface RenderContext {
  ctx: CanvasRenderingContext2D
  viewport: Viewport
  dpiScale: Float
}

/**
 * 画布形状接口
 * - 所有图形应实现该接口以参与渲染与命中
 */
export interface IShape {
  /** 形状 id */
  readonly id: ShapeId
  /** zIndex 越大越后绘制 */
  zIndex: number
  /** 是否可见 */
  visible: boolean
  /** 绘制样式 */
  style: ShapeStyle
  /** 获取世界坐标下的包围盒 */
  getBounds: () => Rect
  /** 执行绘制（已设置好视口变换） */
  draw: (rc: RenderContext) => void
  /** 世界坐标命中测试（可含容差） */
  containsPoint: (worldPt: Point, tolerance?: Float) => boolean
  /** 标记脏区（预留，通知渲染器重绘） */
  markDirty: () => void
}

/** 视口状态 */
export interface ViewportState {
  panX: Float
  panY: Float
  zoom: Float
}

/** 画布事件类型 */
export type CanvasEventType
  = | 'viewportchange'
    | 'pointerdown'
    | 'pointermove'
    | 'pointerup'
    | 'wheelzoom'
    | 'selectionchange'
    | 'shapeadded'
    | 'shaperemoved'
    | 'shapetransform'
    | 'resize'

/**
 * 画布应用初始化选项
 */
export interface CanvasAppOptions {
  /** 容器元素 */
  container: HTMLElement
  /** 背景色（CSS 颜色） */
  background?: string
  /** 是否使用 OffscreenCanvas（预留） */
  enableOffscreen?: boolean
  /** 最小/最大/初始缩放 */
  minZoom?: Float
  maxZoom?: Float
  zoom?: Float
  /** 初始平移（世界坐标） */
  pan?: Point
  /** 双击缩放开关（预留） */
  enableDblClickZoom?: boolean
  /** 滚轮缩放速度（默认 1.1，预留） */
  wheelZoomSpeed?: Float
  /** 拖拽惯性（预留） */
  dragInertia?: boolean
}
