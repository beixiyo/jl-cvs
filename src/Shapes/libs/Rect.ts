import { BaseShape } from '../BaseShape'
import type { ShapeStyle } from '../type'

/**
 * 绘制矩形
 */
export class Rect implements BaseShape {

  ctx: CanvasRenderingContext2D

  startX: number
  startY: number
  endX: number
  endY: number

  shapeStyle: ShapeStyle = {}

  constructor(opts: RectOpts) {
    this.ctx = opts.ctx
    this.ctx.lineCap = 'square'

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

    ctx.moveTo(this.minX, this.minY)
    ctx.lineTo(this.maxX, this.minY)
    ctx.lineTo(this.maxX, this.maxY)
    ctx.lineTo(this.minX, this.maxY)
    ctx.lineTo(this.minX, this.minY)

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
    if (
      x > this.minX &&
      x < this.maxX &&
      y > this.minY &&
      y < this.maxY
    ) {
      return true
    }

    return false
  }

  /**
   * 设置样式
   */
  setShapeStyle(shapeStyle: ShapeStyle = {}) {
    Object.assign(this.shapeStyle, shapeStyle)
  }

  get minX() {
    return Math.min(this.startX, this.endX)
  }

  get minY() {
    return Math.min(this.startY, this.endY)
  }

  get maxX() {
    return Math.max(this.startX, this.endX)
  }

  get maxY() {
    return Math.max(this.startY, this.endY)
  }

}


export type RectOpts = {
  startX: number
  startY: number
  ctx: CanvasRenderingContext2D
  shapeStyle?: ShapeStyle
}