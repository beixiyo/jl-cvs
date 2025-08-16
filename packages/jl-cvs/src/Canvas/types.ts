/*
 * 基础类型与接口定义
 */

/** 平面点坐标 */
export interface Point { x: number, y: number }

/** 尺寸（宽高） */
export interface Size { width: number, height: number }

/**
 * 形状绘制样式
 * - 可选填充与描边，包含线宽、虚线与透明度
 */
export interface ShapeStyle {
  fill?: string | CanvasGradient | CanvasPattern
  stroke?: string | CanvasGradient | CanvasPattern
  lineWidth?: number
  lineDash?: number[]
  /** 透明度，0..1 */
  opacity?: number
}

import type { Viewport } from './core/Viewport'
import type { BaseShape } from '@/Shapes/libs/BaseShape'

/**
 * 绘制上下文
 * - 携带 2D 上下文、视口与 dpr 比例
 */
export interface RenderContext {
  ctx: CanvasRenderingContext2D
  viewport: Viewport
  dpiScale: number
}

/** 视口状态 */
export interface ViewportState {
  pan: Point
  zoom: number
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
    | 'shapedragstart'
    | 'shapedrag'
    | 'shapedragend'
    | 'resize'

/**
 * 画布应用初始化选项
 */
export interface CanvasAppOptions {
  /** 容器元素 */
  el: HTMLElement
  /** 背景色（CSS 颜色） */
  background?: string
  /** 是否使用 OffscreenCanvas（预留） */
  enableOffscreen?: boolean
  /** 最小缩放 */
  minZoom?: number
  /** 最大缩放 */
  maxZoom?: number
  /** 初始缩放 */
  zoom?: number
  /** 初始平移（世界坐标） */
  pan?: Point
  /** 双击缩放开关（预留） */
  enableDblClickZoom?: boolean
  /** 滚轮缩放速度（默认 1.1，预留） */
  wheelZoomSpeed?: number
  /** 拖拽惯性（预留） */
  dragInertia?: boolean
}

/**
 * 光标模式类型
 */
export type CursorMode
  = | 'pan' // 平移模式（默认）
    | 'brush' // 笔刷绘制
    | 'rect' // 矩形绘制
    | 'circle' // 圆形绘制
    | 'arrow' // 箭头绘制

/**
 * 绘制模式选项
 */
export interface DrawModeOptions {
  /** 绘制样式 */
  shapeStyle?: {
    strokeStyle?: string
    lineWidth?: number
    fillStyle?: string
  }
  /** 绘制开始回调 */
  onDrawStart?: (shape: BaseShape) => void
  /** 绘制中回调 */
  onDrawing?: (shape: BaseShape) => void
  /** 绘制完成回调 */
  onDrawEnd?: (shape: BaseShape) => void
}

export type ViewportOptions = Pick<
  CanvasAppOptions,
  'minZoom' | 'maxZoom' | 'zoom' | 'pan'
> & {
  /** 视口变化回调 */
  onViewportChange?: (state: ViewportState) => void
}
