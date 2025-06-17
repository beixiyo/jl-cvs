import type { BaseShape } from '../BaseShape'
import type { ShapeStyle } from '../type'

/**
 * 绘制圆形
 */
export class Circle implements BaseShape {
  ctx: CanvasRenderingContext2D

  startX: number
  startY: number
  endX: number
  endY: number

  shapeStyle: ShapeStyle = {}

  constructor(opts: CircleOpts) {
    this.ctx = opts.ctx
    this.ctx.lineCap = 'round'

    this.startX = opts.startX
    this.startY = opts.startY
    this.endX = opts.startX
    this.endY = opts.startY

    this.shapeStyle = opts.shapeStyle || {}
    this.setShapeStyle(opts.shapeStyle)
  }

  draw() {
    const { ctx } = this

    ctx.beginPath()
    ctx.arc(
      this.startX,
      this.startY,
      this.radius,
      0,
      2 * Math.PI,
    )

    /**
     * 绘制边框
     */
    if (this.shapeStyle.lineWidth && this.shapeStyle.strokeStyle) {
      ctx.strokeStyle = this.shapeStyle.strokeStyle
      ctx.lineWidth = this.shapeStyle.lineWidth
      ctx.stroke()
    }

    if (this.shapeStyle.fillStyle) {
      ctx.fillStyle = this.shapeStyle.fillStyle
    }

    ctx.fill()
  }

  isInPath(x: number, y: number): boolean {
    const dx = x - this.startX
    const dy = y - this.startY
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance <= this.radius
  }

  /**
   * 设置样式
   */
  setShapeStyle(shapeStyle: ShapeStyle = {}) {
    Object.assign(this.shapeStyle, shapeStyle)
  }

  get radius() {
    const dx = this.endX - this.startX
    const dy = this.endY - this.startY
    return Math.sqrt(dx * dx + dy * dy)
  }
}

export type CircleOpts = {
  startX: number
  startY: number
  ctx: CanvasRenderingContext2D
  shapeStyle?: ShapeStyle
}
