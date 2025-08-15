import type { BaseShapeOpts } from '../BaseShape'
import { BaseShape } from '../BaseShape'

/**
 * 笔刷路径点
 */
export interface BrushPoint {
  x: number
  y: number
}

/**
 * 笔刷形状类，用于自由绘制
 */
export class Brush extends BaseShape {
  /** 笔刷路径点集合 */
  private points: BrushPoint[] = []

  constructor(opts: BaseShapeOpts) {
    super(opts)
    /** 初始点 */
    this.points.push({ x: opts.startX, y: opts.startY })
  }

  /**
   * 添加路径点
   */
  addPoint(x: number, y: number) {
    this.points.push({ x, y })
    /** 更新边界 */
    this.updateBounds()
  }

  /**
   * 获取所有路径点
   */
  getPoints(): BrushPoint[] {
    return [...this.points]
  }

  /**
   * 更新形状边界
   */
  private updateBounds() {
    if (this.points.length === 0)
      return

    let minX = this.points[0].x
    let minY = this.points[0].y
    let maxX = this.points[0].x
    let maxY = this.points[0].y

    for (const point of this.points) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }

    this.startX = minX
    this.startY = minY
    this.endX = maxX
    this.endY = maxY
  }

  /**
   * 绘制笔刷路径
   */
  draw(ctx = this.ctx): void {
    if (!ctx) {
      throw new Error('Canvas context is required')
    }

    if (this.points.length < 2)
      return

    this.ctx = ctx
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    /** 设置样式 */
    ctx.strokeStyle = this.shapeStyle.strokeStyle || '#000000'
    ctx.lineWidth = this.shapeStyle.lineWidth || 2

    /** 为了支持擦除，每个线段都独立绘制 */
    for (let i = 0; i < this.points.length - 1; i++) {
      const currentPoint = this.points[i]
      const nextPoint = this.points[i + 1]

      ctx.beginPath()
      ctx.moveTo(currentPoint.x, currentPoint.y)
      ctx.lineTo(nextPoint.x, nextPoint.y)
      ctx.stroke()
    }
  }

  /**
   * 检查点是否在笔刷路径上
   */
  isInPath(x: number, y: number): boolean {
    const lineWidth = (this.shapeStyle.lineWidth || 2) + 5 // 添加缓冲区域
    const threshold = lineWidth / 2

    /** 检查是否在任何线段附近 */
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i]
      const p2 = this.points[i + 1]

      const distance = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y)
      if (distance <= threshold) {
        return true
      }
    }

    return false
  }

  /**
   * 计算点到线段的距离
   */
  private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1
    const dy = y2 - y1
    const lenSq = dx * dx + dy * dy

    if (lenSq === 0) {
      /** 线段退化为点 */
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
    }

    /** 计算投影参数 */
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq))

    /** 投影点 */
    const projX = x1 + t * dx
    const projY = y1 + t * dy

    /** 返回距离 */
    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
  }
}
