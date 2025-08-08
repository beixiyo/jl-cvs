import type { IShape, Rect, RenderContext, ShapeId, ShapeStyle } from '@jl-org/cvs'

export interface DemoRectOptions {
  id: ShapeId
  x: number
  y: number
  width: number
  height: number
  zIndex?: number
  visible?: boolean
  style?: ShapeStyle
}

export class DemoRect implements IShape {
  readonly id: ShapeId
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  visible: boolean
  style: ShapeStyle

  constructor(options: DemoRectOptions) {
    this.id = options.id
    this.x = options.x
    this.y = options.y
    this.width = options.width
    this.height = options.height
    this.zIndex = options.zIndex ?? 0
    this.visible = options.visible ?? true
    this.style = options.style ?? { fill: '#60a5fa', stroke: '#1e3a8a', lineWidth: 1 }
  }

  getBounds(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height }
  }

  draw(rc: RenderContext): void {
    const { ctx } = rc
    ctx.save()
    if (this.style.opacity != null)
      ctx.globalAlpha = this.style.opacity

    if (this.style.fill) {
      ctx.fillStyle = this.style.fill as any
    }
    if (this.style.stroke) {
      ctx.strokeStyle = this.style.stroke as any
    }
    if (this.style.lineWidth != null)
      ctx.lineWidth = this.style.lineWidth
    if (this.style.lineDash)
      ctx.setLineDash(this.style.lineDash)

    ctx.beginPath()
    ctx.rect(this.x, this.y, this.width, this.height)
    if (this.style.fill)
      ctx.fill()
    if (this.style.stroke)
      ctx.stroke()
    ctx.restore()
  }

  containsPoint(worldPt: { x: number, y: number }, tolerance: number = 0): boolean {
    const x1 = this.x - tolerance
    const y1 = this.y - tolerance
    const x2 = this.x + this.width + tolerance
    const y2 = this.y + this.height + tolerance
    return worldPt.x >= x1 && worldPt.x <= x2 && worldPt.y >= y1 && worldPt.y <= y2
  }

  markDirty(): void {
    /** 测试形状不维护外部脏区，在属性变更后由外部请求渲染 */
  }
}
