import { getDPR } from '@/canvasTool'
import { BaseShape } from '../BaseShape'
import type { ShapeAttrs } from '../type'

/**
 * 绘制矩形
 */
export class Rect implements BaseShape {

  ctx: CanvasRenderingContext2D

  startX: number
  startY: number
  endX: number
  endY: number

  shapeAttrs: ShapeAttrs = {}

  constructor(opts: RectOpts) {
    this.ctx = opts.ctx
    this.ctx.lineCap = 'square'

    this.startX = opts.startX
    this.startY = opts.startY
    this.endX = opts.startX
    this.endY = opts.startY

    this.shapeAttrs = opts.shapeAttrs || {}
    this.setShapeAttrs(opts.shapeAttrs)
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
    if (this.shapeAttrs.lineWidth && this.shapeAttrs.strokeStyle) {
      ctx.strokeStyle = this.shapeAttrs.strokeStyle
      ctx.lineWidth = this.shapeAttrs.lineWidth
      ctx.stroke()
    }
    
    if (this.shapeAttrs.fillStyle) {
      ctx.fillStyle = this.shapeAttrs.fillStyle
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

  setShapeAttrs(shapeAttrs: ShapeAttrs = {}) {
    for (const k in shapeAttrs) {
      // @ts-ignore
      this.shapeAttrs[k] = shapeAttrs[k]
    }
  }

  get minX() {
    return Math.min(this.startX, this.endX) * getDPR()
  }

  get minY() {
    return Math.min(this.startY, this.endY) * getDPR()
  }

  get maxX() {
    return Math.max(this.startX, this.endX) * getDPR()
  }

  get maxY() {
    return Math.max(this.startY, this.endY) * getDPR()
  }

}


export type RectOpts = {
  startX: number
  startY: number
  ctx: CanvasRenderingContext2D
}
  &
{
  shapeAttrs?: ShapeAttrs
}