import type { Optional } from '@jl-org/ts-tool'
import type { Firework2 } from './Firework2'
import { Ball, getColor, timeFunc } from '@/canvasTool'
import { getRandomNum } from '@/utils'

/**
 * 发射烟花，以及添加烟花尾迹
 */
export class Launcher {
  /** 烟花实例 */
  firework: Firework2
  /** 颜色 */
  color: string
  /** 初始位置 */
  x: number
  y: number
  /** 目标位置 */
  ty: number
  /** 半径 */
  radius: number
  /** 发射的持续时间 */
  duration: number
  /** 发射时的时间 */
  startTime = 0

  constructor(opts: Optional<LauncherOpts, 'y'>) {
    const {
      firework,
      color,
      width,
      height,
      y = 0,
      x = width * getRandomNum(0.2, 0.8, true),
      radius = getRandomNum(2, 5),
      duration = getRandomNum(2000, 3500),
    } = opts

    this.firework = firework
    this.color = color || getColor()
    this.x = x
    this.y = y
    this.ty = height * getRandomNum(0.6, 0.8, true)

    this.radius = radius
    this.duration = duration
  }

  /**
   * 记录开始时间
   */
  start() {
    this.startTime = Date.now()
  }

  update() {
    const { x, ty, duration, startTime, firework } = this

    const progress = timeFunc.linear(
      (Date.now() - startTime) / duration,
    )
    let y = this.y + ty * progress
    y = Math.min(y, ty)

    /** 透明度变小 */
    let opacity = 1 - (y / ty)
    if (opacity < 0)
      opacity = 0
    this.draw(x, y, opacity)

    /** 添加烟花尾迹 */
    if (Math.random() > 0.7 && opacity >= 0.1) {
      firework.addDebris({
        x: x + getRandomNum(-2, 2, true),
        y,
        ctx: firework.ctx,
      })
    }

    return {
      x,
      y,
      isEnd: y >= ty,
    }
  }

  draw(x: number, y: number, opacity: number) {
    /** 外圆，烟花的颜色 */
    new Ball({
      opacity,
      x,
      y,
      r: this.radius,
      color: this.color,
      ctx: this.firework.ctx,
    }).draw()

    /** 内圆，白色 */
    new Ball({
      opacity,
      x,
      y,
      r: this.radius / 2,
      color: '#fff',
      ctx: this.firework.ctx,
    }).draw()
  }
}

export type LauncherOpts = {
  /** 烟花实例 */
  firework: Firework2
  /** 颜色 */
  color?: string
  /** 初始位置 */
  x?: number
  y: number
  /** 画布大小 */
  width: number
  height: number
  /** 半径 */
  radius?: number
  /** 发射的持续时间 */
  duration?: number
}
