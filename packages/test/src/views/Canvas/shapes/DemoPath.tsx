import type { IShape, Point, Rect, RenderContext, ShapeId, ShapeStyle } from '@jl-org/cvs'

export interface DemoPathOptions {
  id: ShapeId
  points?: Point[]
  zIndex?: number
  visible?: boolean
  color?: string
  lineWidth?: number
  style?: ShapeStyle
}

export class DemoPath implements IShape {
  readonly id: ShapeId
  points: Point[]
  zIndex: number
  visible: boolean
  style: ShapeStyle

  constructor(options: DemoPathOptions) {
    this.id = options.id
    this.points = options.points
      ? [...options.points]
      : []
    this.zIndex = options.zIndex ?? 0
    this.visible = options.visible ?? true
    this.style = options.style ?? { stroke: options.color ?? '#0f172a', lineWidth: options.lineWidth ?? 2 }
  }

  setStyle(color?: string, lineWidth?: number) {
    if (color)
      this.style.stroke = color
    if (lineWidth != null)
      this.style.lineWidth = lineWidth
  }

  addPoint(p: Point) {
    this.points.push(p)
  }

  getBounds(): Rect {
    if (this.points.length === 0)
      return { x: 0, y: 0, width: 0, height: 0 }
    let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity
    for (const p of this.points) {
      if (p.x < minX)
        minX = p.x
      if (p.y < minY)
        minY = p.y
      if (p.x > maxX)
        maxX = p.x
      if (p.y > maxY)
        maxY = p.y
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }

  draw(rc: RenderContext): void {
    const { ctx } = rc
    if (this.points.length < 2)
      return
    ctx.save()
    if (this.style.opacity != null)
      ctx.globalAlpha = this.style.opacity
    if (this.style.stroke)
      ctx.strokeStyle = this.style.stroke as any
    if (this.style.lineWidth != null)
      ctx.lineWidth = this.style.lineWidth
    if (this.style.lineDash)
      ctx.setLineDash(this.style.lineDash)

    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)
    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i]
      ctx.lineTo(p.x, p.y)
    }
    ctx.stroke()
    ctx.restore()
  }

  containsPoint(worldPt: Point, tolerance: number = 4): boolean {
    for (let i = 1; i < this.points.length; i++) {
      const a = this.points[i - 1]
      const b = this.points[i]
      const d = pointToSegmentDistance(worldPt, a, b)
      if (d <= tolerance)
        return true
    }
    return false
  }

  markDirty(): void {}
}

function pointToSegmentDistance(p: Point, a: Point, b: Point): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const apx = p.x - a.x
  const apy = p.y - a.y
  const ab2 = abx * abx + aby * aby
  if (ab2 === 0)
    return Math.hypot(apx, apy)
  let t = (apx * abx + apy * aby) / ab2
  t = Math.max(0, Math.min(1, t))
  const cx = a.x + t * abx
  const cy = a.y + t * aby
  return Math.hypot(p.x - cx, p.y - cy)
}
