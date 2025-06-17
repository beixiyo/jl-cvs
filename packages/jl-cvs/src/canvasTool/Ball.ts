import { getColor } from './color'

export class Ball {
  /** 留给外部使用，用于记录绘制次数 */
  count = 0

  x: number
  y: number
  r: number
  color: string
  ctx: CanvasRenderingContext2D
  opacity: number

  /**
   * 在 canvas 上下文绘制一个球
   * @param x x 坐标
   * @param y y 坐标
   * @param r 半径
   * @param color 默认随机颜色
   * @param ctx 上下文
   * @param opacity 透明度
   */
  constructor(opts: BallOpts) {
    const {
      x,
      y,
      r,
      color = getColor(),
      opacity = 1,
      ctx,
    } = opts

    this.x = x
    this.y = y
    this.r = r
    this.color = color
    this.opacity = opacity ?? 1
    this.ctx = ctx

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

export type BallOpts = {
  x: number
  y: number
  r: number
  color?: string
  opacity?: number
  ctx: CanvasRenderingContext2D
}
