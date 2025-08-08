import type { IShape, Rect, RenderContext, ShapeId, ShapeStyle } from '@jl-org/cvs'

export interface DemoImageOptions {
  id: ShapeId
  x: number
  y: number
  width: number
  height: number
  src: string
  zIndex?: number
  visible?: boolean
  style?: ShapeStyle
}

export class DemoImage implements IShape {
  readonly id: ShapeId
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  visible: boolean
  style: ShapeStyle
  private img: HTMLImageElement
  private loaded = false

  constructor(options: DemoImageOptions) {
    this.id = options.id
    this.x = options.x
    this.y = options.y
    this.width = options.width
    this.height = options.height
    this.zIndex = options.zIndex ?? 0
    this.visible = options.visible ?? true
    this.style = options.style ?? {}

    this.img = new Image()
    this.img.crossOrigin = 'anonymous'
    this.img.onload = () => {
      this.loaded = true
    }
    this.img.src = options.src
  }

  getBounds(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height }
  }

  draw(rc: RenderContext): void {
    if (!this.loaded)
      return
    const { ctx } = rc
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
  }

  containsPoint(worldPt: { x: number, y: number }, tolerance: number = 0): boolean {
    return (
      worldPt.x >= this.x - tolerance
      && worldPt.x <= this.x + this.width + tolerance
      && worldPt.y >= this.y - tolerance
      && worldPt.y <= this.y + this.height + tolerance
    )
  }

  markDirty(): void {}
}
