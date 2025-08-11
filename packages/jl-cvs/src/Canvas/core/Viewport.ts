import type { Point, Size, ViewportOptions, ViewportState } from '../types'
import type { BoundRect } from '@/Shapes/type'
import { clamp } from '@jl-org/tool'

/**
 * ### 视口
 * - 维护 pan/zoom，提供坐标转换与可视区域计算
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
 *
 *    其中：
 *    - 视口偏移(pan)：当前视口在世界坐标系中的位置
 *    - 缩放比例(zoom)：当前视口的缩放级别
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

  /**
   * 设置缩放（可指定世界坐标锚点）
   *
   * 设置视口的缩放级别，可选择是否围绕特定的世界坐标点进行缩放。
   *
   * 缩放锚点原理：
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
   * 示例：
   * 假设当前视口状态：pan = {x: 100, y: 50}, zoom = 2
   * 锚点世界坐标：anchorWorldPoint = {x: 200, y: 150}
   * 新缩放级别：nextZoom = 4
   *
   * 计算过程：
   * 1. ratio = 2 / 4 = 0.5
   * 2. pan'x = 200 - (200 - 100) * 0.5 = 200 - 50 = 150
   * 3. pan'y = 150 - (150 - 50) * 0.5 = 150 - 50 = 100
   *
   * 结果：新视口状态为 pan = {x: 150, y: 100}, zoom = 4
   * 此时锚点(200, 150)在屏幕上的位置保持不变
   *
   * @param nextZoom 新的缩放级别
   * @param anchorWorldPoint 可选的世界坐标锚点
   */
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

  /**
   * 围绕屏幕点缩放
   *
   * 根据屏幕坐标点进行缩放操作。首先将屏幕坐标转换为世界坐标作为锚点，
   * 然后调用setZoom方法进行缩放。
   *
   * 示例：
   * 假设当前视口状态：pan = {x: 100, y: 50}, zoom = 2
   * 屏幕坐标点：screenPt = {x: 300, y: 200}
   * 缩放因子：factor = 2
   *
   * 计算过程：
   * 1. 将屏幕坐标转换为世界坐标：
   *    worldX = 300 / 2 + 100 = 250
   *    worldY = 200 / 2 + 50 = 150
   *    锚点为 {x: 250, y: 150}
   * 2. 新缩放级别 = 2 * 2 = 4
   * 3. 调用setZoom(4, {x: 250, y: 150})进行缩放
   *
   * @param screenPt 屏幕坐标点
   * @param factor 缩放因子（>1放大，<1缩小）
   */
  zoomAtScreenPoint(screenPt: Point, factor: number): void {
    const worldPt = this.screenToWorld(screenPt)
    this.setZoom(this.options.zoom * factor, worldPt)
  }

  /**
   * 按照世界坐标位移平移
   *
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
   * 世界坐标到屏幕坐标转换
   *
   * 将世界坐标系中的点转换为屏幕坐标系中的点。
   *
   * 转换公式：
   * ```
   * screenX = (worldX - panX) * zoom
   * screenY = (worldY - panY) * zoom
   * ```
   *
   * 示例：
   * 假设视口状态为：pan = {x: 100, y: 50}, zoom = 2
   * 世界坐标点 pt = {x: 200, y: 150}
   *
   * 转换过程：
   * 1. 计算相对于视口偏移的坐标:
   *    relativeX = 200 - 100 = 100
   *    relativeY = 150 - 50 = 100
   * 2. 应用缩放:
   *    screenX = 100 * 2 = 200
   *    screenY = 100 * 2 = 200
   *
   * 结果：屏幕坐标为 {x: 200, y: 200}
   *
   * @param pt 世界坐标系中的点
   * @returns 对应的屏幕坐标系中的点
   */
  worldToScreen(pt: Point): Point {
    const { options } = this
    return {
      x: (pt.x - options.pan.x) * options.zoom,
      y: (pt.y - options.pan.y) * options.zoom,
    }
  }

  /**
   * 屏幕坐标到世界坐标转换
   *
   * 将屏幕坐标系中的点转换为世界坐标系中的点。
   * 这是worldToScreen的逆向操作。
   *
   * 转换公式：
   * ```
   * worldX = screenX / zoom + panX
   * worldY = screenY / zoom + panY
   * ```
   *
   * 示例：
   * 假设视口状态为：pan = {x: 100, y: 50}, zoom = 2
   * 屏幕坐标点 pt = {x: 200, y: 200}
   *
   * 转换过程：
   * 1. 逆向应用缩放:
   *    worldRelativeX = 200 / 2 = 100
   *    worldRelativeY = 200 / 2 = 100
   * 2. 加上视口偏移:
   *    worldX = 100 + 100 = 200
   *    worldY = 100 + 50 = 150
   *
   * 结果：世界坐标为 {x: 200, y: 150}
   *
   * @param pt 屏幕坐标系中的点
   * @returns 对应的世界坐标系中的点
   */
  screenToWorld(pt: Point): Point {
    const { options } = this
    return {
      x: pt.x / options.zoom + options.pan.x,
      y: pt.y / options.zoom + options.pan.y,
    }
  }

  /**
   * 获取当前屏幕对应的世界坐标可视矩形
   *
   * 计算当前视口在世界坐标系中对应的可视区域矩形。
   *
   * 计算过程：
   * 1. 矩形的左上角坐标就是当前视口的偏移量(panX, panY)
   * 2. 矩形的宽度和高度需要将屏幕尺寸除以缩放比例得到世界尺寸
   *
   * 示例：
   * 假设视口状态为：pan = {x: 100, y: 50}, zoom = 2
   * 屏幕尺寸为：screenSize = {width: 800, height: 600}
   *
   * 计算过程：
   * 1. 世界宽度 = 800 / 2 = 400
   * 2. 世界高度 = 600 / 2 = 300
   * 3. 可视区域矩形 = {x: 100, y: 50, width: 400, height: 300}
   *
   * @param screenSize 屏幕尺寸（CSS像素）
   * @returns 世界坐标系中的可视区域矩形
   */
  getWorldVisibleRect(screenSize: Size): BoundRect {
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
