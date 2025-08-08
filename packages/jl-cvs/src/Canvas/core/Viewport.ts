import type { Point, Size, ViewportOptions, ViewportState } from '../utils/types'
import type { Rect } from '@/Shapes/type'
import { clamp } from '@jl-org/tool'

/**
 * 视口
 * - 维护 pan/zoom，提供坐标转换与可视区域计算
 */
export class Viewport {
  options: Required<ViewportOptions>

  constructor(options: ViewportOptions = {}) {
    this.options = {
      pan: { x: 0, y: 0 },
      zoom: 1,
      minZoom: 0.05,
      maxZoom: 16,
      onViewportChange: () => { },
      ...options,
    }
  }

  /** 获取视口状态 */
  getState(): ViewportState {
    const { pan, zoom } = this.options
    return { pan, zoom }
  }

  /** 设置视口状态（可局部），默认会触发回调 */
  setState(partial: Partial<ViewportState>, silent = false) {
    const { options } = this

    this.options = {
      ...options,
      ...partial,
      zoom: this.clampZoom(partial.zoom ?? options.zoom),
    }

    if (!silent) {
      options.onViewportChange(this.getState())
    }
  }

  private clampZoom(value: number): number {
    return clamp(value, this.options.minZoom, this.options.maxZoom)
  }

  /** 设置缩放（可指定世界坐标锚点） */
  setZoom(nextZoom: number, anchorWorldPoint?: Point): void {
    const clamped = this.clampZoom(nextZoom)
    const { options } = this

    if (!anchorWorldPoint) {
      options.zoom = clamped
    }
    else {
      /** 保持锚点屏幕位置不变：(a - pan') * z' = (a - pan) * z */
      const prevZoom = options.zoom
      const ratio = prevZoom / clamped
      options.zoom = clamped
      options.pan.x = anchorWorldPoint.x - (anchorWorldPoint.x - options.pan.x) * ratio
      options.pan.y = anchorWorldPoint.y - (anchorWorldPoint.y - options.pan.y) * ratio
    }

    options.onViewportChange(this.getState())
  }

  /** 围绕屏幕点缩放 */
  zoomAtScreenPoint(screenPt: Point, factor: number): void {
    const worldPt = this.screenToWorld(screenPt)
    this.setZoom(this.options.zoom * factor, worldPt)
  }

  /** 按照世界坐标位移平移 */
  panBy(dx: number, dy: number): void {
    const { options } = this
    options.pan.x += dx
    options.pan.y += dy

    options.onViewportChange(this.getState())
  }

  /** 世界坐标到屏幕坐标 */
  worldToScreen(pt: Point): Point {
    const { options } = this
    return {
      x: (pt.x - options.pan.x) * options.zoom,
      y: (pt.y - options.pan.y) * options.zoom,
    }
  }

  /** 屏幕坐标到世界坐标 */
  screenToWorld(pt: Point): Point {
    const { options } = this
    return {
      x: pt.x / options.zoom + options.pan.x,
      y: pt.y / options.zoom + options.pan.y,
    }
  }

  /** 获取当前屏幕对应的世界坐标可视矩形 */
  getWorldVisibleRect(screenSize: Size): Rect {
    const { options } = this
    const widthWorld = screenSize.width / options.zoom
    const heightWorld = screenSize.height / options.zoom

    return {
      x: options.pan.x,
      y: options.pan.y,
      width: widthWorld,
      height: heightWorld,
    }
  }
}
