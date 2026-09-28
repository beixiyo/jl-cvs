import { Ball } from '@/canvasTool'
import { getRandomNum } from '@/utils'

/**
 * 烟花尾迹
 */
export class Debris {
  /** 颜色 */
  color: string
  /** 透明度 */
  opacity: number
  /** 存在时间 */
  duration: number

  /** 创建的时间 */
  startTime = 0
  private lastUpdateTime = 0

  /** 半径 */
  radius: number
  /** 重力，px/s2 */
  g: number
  /** 位置 */
  x: number
  y: number
  ctx: CanvasRenderingContext2D

  constructor(opts: DebrisOpts) {
    this.color = opts.color ?? '#fff'
    this.radius = opts.radius ?? 1
    this.opacity = opts.opacity ?? getRandomNum(0.1, 0.5, true)
    this.duration = opts.duration ?? getRandomNum(0.5, 1, true)

    this.g = opts.g ?? 0.98
    this.x = opts.x
    this.y = opts.y
    this.ctx = opts.ctx
  }

  start() {
    this.startTime = Date.now()
    this.lastUpdateTime = this.startTime
  }

  update() {
    const now = Date.now()
    const duration = (now - this.startTime) / 1000
    const frameScale = Math.min(3, (now - this.lastUpdateTime) / (1000 / 60))
    this.lastUpdateTime = now
    this.y -= this.g * duration * frameScale
    new Ball({
      x: this.x,
      y: this.y,
      r: this.radius,
      color: this.color,
      opacity: this.opacity,
      ctx: this.ctx,
    }).draw()

    return {
      x: this.x,
      y: this.y,
      isEnd: duration > this.duration,
    }
  }
}

export type DebrisOpts = {
  color?: string
  radius?: number

  g?: number
  x: number
  y: number

  duration?: number
  opacity?: number
  ctx: CanvasRenderingContext2D
  dpr?: number
}
