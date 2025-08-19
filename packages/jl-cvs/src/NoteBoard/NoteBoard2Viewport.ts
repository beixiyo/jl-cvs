import type { Point, Size } from '@/Canvas/types'

/**
 * 视口状态接口
 */
export interface ViewportState {
  /** 视口在世界坐标系中的偏移 */
  pan: Point
  /** 缩放级别 */
  zoom: number
}

/**
 * 视口配置选项
 */
export interface ViewportOptions {
  /** 初始平移偏移 */
  pan?: Point
  /** 初始缩放级别 */
  zoom?: number
  /** 最小缩放级别 */
  minZoom?: number
  /** 最大缩放级别 */
  maxZoom?: number
  /** 视口变化回调 */
  onViewportChange?: (state: ViewportState) => void
}

/**
 * NoteBoard2 视口管理器
 *
 * 负责管理世界坐标系与屏幕坐标系的转换，实现无限画布的核心功能
 *
 * 坐标系统说明：
 * 1. 世界坐标系 (World Coordinate System):
 *    - 无限大的坐标系，用于定义场景中对象的绝对位置
 *    - 坐标单位通常与逻辑像素相对应
 *    - 不受视口变换影响
 *
 * 2. 屏幕坐标系 (Screen Coordinate System):
 *    - 以Canvas元素左上角为原点(0,0)的坐标系
 *    - X轴向右为正，Y轴向下为正
 *    - 坐标单位为CSS像素
 *
 * 3. 坐标转换关系：
 *    屏幕坐标 = (世界坐标 - 视口偏移) * 缩放比例
 *    世界坐标 = 屏幕坐标 / 缩放比例 + 视口偏移
 */
export class NoteBoard2Viewport {
  private options: Required<ViewportOptions>

  constructor(options: ViewportOptions = {}) {
    this.options = {
      pan: { x: 0, y: 0 },
      zoom: 1,
      minZoom: 0.1,
      maxZoom: 10,
      onViewportChange: () => {},
      ...options,
    }
  }

  /**
   * 获取当前视口状态
   */
  getState(): ViewportState {
    const { pan, zoom } = this.options
    return { pan: { ...pan }, zoom }
  }

  /**
   * 设置视口状态（可局部更新）
   * @param partial 要更新的状态
   * @param silent 是否静默更新（不触发回调）
   */
  setState(partial: Partial<ViewportState>, silent = false): void {
    const { options } = this

    if (partial.pan) {
      this.options.pan = { ...partial.pan }
    }

    if (partial.zoom !== undefined) {
      this.options.zoom = this.clampZoom(partial.zoom)
    }

    if (!silent) {
      options.onViewportChange(this.getState())
    }
  }

  /**
   * 限制缩放值在有效范围内
   */
  private clampZoom(value: number): number {
    return Math.min(Math.max(value, this.options.minZoom), this.options.maxZoom)
  }

  /**
   * 设置缩放级别（可指定世界坐标锚点）
   *
   * 锚点缩放原理：
   * 为了保持锚点在屏幕上的位置不变，需要调整视口的偏移量。
   *
   * 公式推导：
   * 设锚点的世界坐标为a，原视口状态为(pan, zoom)，新视口状态为(pan', zoom')
   * 要保持锚点在屏幕上的位置不变，需满足：
   * (a - pan') * zoom' = (a - pan) * zoom
   *
   * 解得：
   * pan' = a - (a - pan) * (zoom / zoom')
   *
   * @param nextZoom 新的缩放级别
   * @param anchorWorldPoint 可选的世界坐标锚点
   */
  setZoom(nextZoom: number, anchorWorldPoint?: Point): void {
    const clamped = this.clampZoom(nextZoom)

    if (anchorWorldPoint) {
      const { pan, zoom } = this.options
      const ratio = zoom / clamped

      const newPan = {
        x: anchorWorldPoint.x - (anchorWorldPoint.x - pan.x) * ratio,
        y: anchorWorldPoint.y - (anchorWorldPoint.y - pan.y) * ratio,
      }

      this.setState({ pan: newPan, zoom: clamped })
    }
    else {
      this.setState({ zoom: clamped })
    }
  }

  /**
   * 设置平移偏移
   * @param pan 新的平移偏移
   */
  setPan(pan: Point): void {
    this.setState({ pan })
  }

  /**
   * 增量平移
   * @param delta 平移增量
   */
  addPan(delta: Point): void {
    const { pan } = this.options
    this.setPan({
      x: pan.x + delta.x,
      y: pan.y + delta.y,
    })
  }

  /**
   * 按照世界坐标位移平移（与 Canvas Viewport 兼容）
   * @param dx X轴方向的平移量（世界坐标单位）
   * @param dy Y轴方向的平移量（世界坐标单位）
   */
  panBy(dx: number, dy: number): void {
    const { options } = this
    options.pan.x += dx
    options.pan.y += dy

    options.onViewportChange(this.getState())
  }

  /**
   * 屏幕坐标转世界坐标
   * @param screenPoint 屏幕坐标点
   * @returns 世界坐标点
   */
  screenToWorld(screenPoint: Point): Point {
    const { pan, zoom } = this.options
    return {
      x: screenPoint.x / zoom + pan.x,
      y: screenPoint.y / zoom + pan.y,
    }
  }

  /**
   * 世界坐标转屏幕坐标
   * @param worldPoint 世界坐标点
   * @returns 屏幕坐标点
   */
  worldToScreen(worldPoint: Point): Point {
    const { pan, zoom } = this.options
    return {
      x: (worldPoint.x - pan.x) * zoom,
      y: (worldPoint.y - pan.y) * zoom,
    }
  }

  /**
   * 应用世界坐标变换到 Canvas 上下文
   * @param ctx Canvas 2D 上下文
   * @param dpr 设备像素比（默认为 1）
   */
  applyTransform(ctx: CanvasRenderingContext2D, dpr: number = 1): void {
    const { pan, zoom } = this.options

    /**
     * 设置变换矩阵：缩放 + 平移
     * 公式：ctx.setTransform(scaleX, skewY, skewX, scaleY, translateX, translateY)
     */
    ctx.setTransform(
      dpr * zoom, // scaleX
      0, // skewY
      0, // skewX
      dpr * zoom, // scaleY
      -pan.x * dpr * zoom, // translateX
      -pan.y * dpr * zoom, // translateY
    )
  }

  /**
   * 重置变换矩阵到初始状态
   * @param ctx Canvas 2D 上下文
   * @param dpr 设备像素比（默认为 1）
   */
  resetTransform(ctx: CanvasRenderingContext2D, dpr: number = 1): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  /**
   * 计算可见的世界坐标矩形区域
   * @param canvasSize 画布尺寸
   * @returns 可见的世界坐标矩形
   */
  getVisibleWorldRect(canvasSize: Size): { x: number, y: number, width: number, height: number } {
    const topLeft = this.screenToWorld({ x: 0, y: 0 })
    const bottomRight = this.screenToWorld({ x: canvasSize.width, y: canvasSize.height })

    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    }
  }

  /**
   * 获取缩放范围
   */
  getZoomRange(): { min: number, max: number } {
    return {
      min: this.options.minZoom,
      max: this.options.maxZoom,
    }
  }
}
