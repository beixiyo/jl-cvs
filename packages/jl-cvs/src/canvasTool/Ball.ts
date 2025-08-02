import { getColor } from './color'

/**
 * 在 canvas 上下文绘制一个粒子
 */
export class Ball<Context extends object = any> {
  /** 留给外部使用记录任意内容的上下文，比如记录绘制次数 */
  extraContext: Context = {} as any

  x: number
  y: number
  r: number
  color: string
  ctx: CanvasRenderingContext2D
  opacity: number

  constructor(opts: BallOpts) {
    const {
      x,
      y,
      r,
      color = getColor(),
      opacity = 1,
      ctx,
      extraContext = {},
    } = opts

    this.x = x
    this.y = y
    this.r = r
    this.color = color
    this.opacity = opacity ?? 1
    this.ctx = ctx
    this.extraContext = extraContext

    if (this.opacity !== 1) {
      ctx.globalAlpha = this.opacity
    }
  }

  /**
   * @param ctx 指定上下文绘制，默认当前类的上下文
   */
  draw(ctx: CanvasRenderingContext2D = this.ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export type BallOpts<Context = any> = {
  x: number
  y: number
  r: number
  color?: string
  opacity?: number
  /** 留给外部使用记录任意内容的上下文，比如记录绘制次数 */
  extraContext?: Context
  ctx: CanvasRenderingContext2D
}
