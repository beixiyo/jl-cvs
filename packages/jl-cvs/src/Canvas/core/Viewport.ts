import type { Point, Size, ViewportState } from '../utils/types'
import type { Rect } from '@/Shapes/type'
import { EventEmitter } from '../utils/EventEmitter'

export interface ViewportOptions {
  /** 最小缩放 */
  minZoom?: number
  /** 最大缩放 */
  maxZoom?: number
  /** 初始缩放 */
  zoom?: number
  /** 初始平移 */
  pan?: Point
}

export interface ViewportEventMap {
  /** 视口变化事件 */
  viewportchange: ViewportState
}

/**
 * 视口
 * - 维护 pan/zoom，提供坐标转换与可视区域计算
 */
export class Viewport extends EventEmitter<ViewportEventMap> {
  private panX = 0
  private panY = 0
  private zoom = 1
  private minZoom = 0.05
  private maxZoom = 16

  constructor(options: ViewportOptions = {}) {
    super()
    if (options.zoom != null)
      this.zoom = options.zoom
    if (options.pan) {
      this.panX = options.pan.x
      this.panY = options.pan.y
    }
    if (options.minZoom != null)
      this.minZoom = options.minZoom
    if (options.maxZoom != null)
      this.maxZoom = options.maxZoom
  }

  /** 获取视口状态 */
  getState(): ViewportState {
    return { panX: this.panX, panY: this.panY, zoom: this.zoom }
  }

  /** 设置视口状态（可局部），默认会触发事件 */
  setState(partial: Partial<ViewportState>, silent = false) {
    if (partial.panX != null)
      this.panX = partial.panX
    if (partial.panY != null)
      this.panY = partial.panY
    if (partial.zoom != null)
      this.zoom = this.clampZoom(partial.zoom)
    if (!silent)
      this.emit('viewportchange', this.getState())
  }

  private clampZoom(z: number): number {
    return Math.min(this.maxZoom, Math.max(this.minZoom, z))
  }

  /** 设置缩放（可指定世界坐标锚点） */
  setZoom(nextZoom: number, anchorWorldPoint?: Point): void {
    const clamped = this.clampZoom(nextZoom)
    if (!anchorWorldPoint) {
      this.zoom = clamped
      this.emit('viewportchange', this.getState())
      return
    }
    /** 保持锚点屏幕位置不变：(a - pan') * z' = (a - pan) * z */
    const prevZoom = this.zoom
    const ratio = prevZoom / clamped
    this.zoom = clamped
    this.panX = anchorWorldPoint.x - (anchorWorldPoint.x - this.panX) * ratio
    this.panY = anchorWorldPoint.y - (anchorWorldPoint.y - this.panY) * ratio
    this.emit('viewportchange', this.getState())
  }

  /** 围绕屏幕点缩放（语法糖） */
  zoomAtScreenPoint(screenPt: Point, factor: number, screenSize: Size): void {
    const worldPt = this.screenToWorld(screenPt)
    this.setZoom(this.zoom * factor, worldPt)
  }

  /** 按照世界坐标位移平移 */
  panBy(dx: number, dy: number): void {
    this.panX += dx
    this.panY += dy
    this.emit('viewportchange', this.getState())
  }

  /** 世界坐标到屏幕坐标 */
  worldToScreen(pt: Point): Point {
    return {
      x: (pt.x - this.panX) * this.zoom,
      y: (pt.y - this.panY) * this.zoom,
    }
  }

  /** 屏幕坐标到世界坐标 */
  screenToWorld(pt: Point): Point {
    return {
      x: pt.x / this.zoom + this.panX,
      y: pt.y / this.zoom + this.panY,
    }
  }

  /** 获取当前屏幕对应的世界坐标可视矩形 */
  getWorldVisibleRect(screenSize: Size): Rect {
    const widthWorld = screenSize.width / this.zoom
    const heightWorld = screenSize.height / this.zoom
    return { x: this.panX, y: this.panY, width: widthWorld, height: heightWorld }
  }
}

export type { ViewportState }
