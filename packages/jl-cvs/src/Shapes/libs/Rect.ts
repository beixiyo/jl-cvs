import type { BaseShapeOpts } from '../BaseShape'
import { BaseShape } from '../BaseShape'

/**
 * 绘制矩形
 */
export class Rect extends BaseShape {
  constructor(opts: BaseShapeOpts) {
    super(opts)
  }

  /**
   * 绘制矩形
   * @param ctx - 可选的 Canvas 渲染上下文
   */
  draw(ctx = this.ctx) {
    if (!ctx) {
      throw new Error('Canvas context is required')
    }
    this.ctx = ctx
    ctx.lineCap = 'square'

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
      x > this.minX
      && x < this.maxX
      && y > this.minY
      && y < this.maxY
    ) {
      return true
    }

    return false
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
