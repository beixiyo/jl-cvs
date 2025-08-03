import type { Firework2 } from './Firework2'
import { Ball, getColor, getDPR } from '@/canvasTool'
import { getRandomNum } from '@/utils'

/**
 * 爆炸烟花尾迹
 */
export class ExplosiveDebris {
  firework: Firework2

  x: number
  y: number
  radius: number
  color: string
  angle: number

  speed: number
  vx: number
  vy: number
  g: number

  startTime = 0
  duration = getRandomNum(0.5, 1, true)

  /** 痕迹碎片数量 */
  debrisNum: number
  /** 是否要二次爆炸 */
  needSecondBurst: boolean
  dpr: number

  constructor(opts: ExplosiveDebrisOpts) {
    this.firework = opts.firework
    this.x = opts.x
    this.y = opts.y
    this.dpr = opts.dpr ?? getDPR()

    this.color = Math.random() > 0.2
      ? opts.color || getColor()
      : '#fff'
    this.radius = (opts.radius ?? 2) * this.dpr
    this.angle = getRandomNum(0, 2 * Math.PI, true)

    this.speed = (opts.speed ?? getRandomNum(0.1, 4, true)) * this.dpr
    this.vx = Math.cos(this.angle) * this.speed
    this.vy = Math.sin(this.angle) * this.speed
    this.g = (opts.g ?? 0.98) * this.dpr

    this.debrisNum = opts.debrisNum ?? 3
    this.needSecondBurst = opts.needSecondBurst ?? false
  }

  start() {
    this.startTime = Date.now()
  }

  update() {
    const duration = (Date.now() - this.startTime) / 1000
    const vy = this.vy - this.g * duration
    this.x += this.vx
    this.y += vy

    const progress = duration / this.duration
    let opacity = progress > 0.7
      ? 1 - progress
      : 1
    if (opacity < 0)
      opacity = 0

    new Ball({
      x: this.x,
      y: this.y,
      color: this.color,
      r: this.radius,
      opacity,
      ctx: this.firework.ctx,
    }).draw()

    /** 添加痕迹碎片 */
    if (this.debrisNum > 0 && Math.random() > 0.8) {
      this.debrisNum--
      this.firework.addDebris({
        x: this.x + getRandomNum(-2, 2, true) * this.dpr,
        y: this.y + getRandomNum(-2, 2, true) * this.dpr,
        color: this.color,
        radius: 0.5 * this.dpr,
        g: 0.1 * this.dpr,
        ctx: this.firework.ctx,
      })
    }

    return {
      x: this.x,
      y: this.y,
      isEnd: progress >= 1,
    }
  }
}

export type ExplosiveDebrisOpts = {
  firework: Firework2
  x: number
  y: number
  color?: string

  radius?: number
  angle?: number
  speed?: number
  g?: number

  debrisNum?: number
  needSecondBurst?: boolean
  dpr?: number
}
