import type { Optional } from '@jl-org/ts-tool'
import { applyAnimation, Clock, getWinHeight, getWinWidth, isFn } from '@jl-org/tool'

/**
 * 水波纹动画
 * @example
 * ```ts
 * const ripple = new WaterRipple({ ... })
 * ripple.canvas.style.position = 'fixed'
 * ripple.canvas.style.top = '0'
 * ripple.canvas.style.left = '0'
 * document.body.appendChild(ripple.canvas)
 * ```
 */
export class WaterRipple {
  private declare x: number
  private declare y: number
  private clock: Clock
  private opts: Optional<Required<RippleOpts>, 'strokeStyle'>
  private stopAnimation?: VoidFunction

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(opts: RippleOpts = {}) {
    this.opts = {
      width: getWinWidth(),
      height: getWinHeight(),
      yOffset: 180,
      xOffset: 0,
      canvas: opts.canvas || document.createElement('canvas'),
      lineWidth: 2,
      circleCount: 13,
      intensity: 1,
      strokeStyle: '#3336',
      onResize: () => { },
      ...opts,
    }

    this.canvas = this.opts.canvas
    this.ctx = this.canvas.getContext('2d')!
    this.clock = new Clock()

    this.initCanvas()
    this.startAnimation()
    window.addEventListener('resize', () => {
      this.opts.onResize()
      this.initCanvas()
    })
  }

  /**
   * 设置大小
   * @param width - 宽度
   * @param height - 高度
   */
  setSize(width: number, height: number) {
    this.opts.width = width
    this.opts.height = height
    this.initCanvas()
  }

  /**
   * 开始动画
   */
  startAnimation() {
    this.stopAnimation?.()
    this.stopAnimation = applyAnimation(() => {
      this.drawCircles()
    })
  }

  /**
   * 停止动画
   */
  stop() {
    this.stopAnimation?.()
    this.clock.stop()
  }

  private drawCircle(radius: number) {
    const { x, y, ctx } = this
    const { width, height, lineWidth, strokeStyle } = this.opts

    ctx.beginPath()
    if (strokeStyle) {
      ctx.strokeStyle = isFn(strokeStyle)
        ? strokeStyle(radius)
        : strokeStyle
    }
    else {
      const color = Math.round(255 * (1 - radius / Math.max(width, height)))
      ctx.strokeStyle = `rgba(${color}, ${color}, ${color}, 0.1)`
    }

    ctx.lineWidth = isFn(lineWidth)
      ? lineWidth(radius)
      : lineWidth
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  private drawCircles() {
    const { ctx } = this
    const { width, height, circleCount, intensity } = this.opts
    const maxDistance = Math.max(width, height)
    const perRadius = maxDistance / circleCount

    /** 使用基于时间的动画计算，确保在不同帧率下表现一致 */
    // intensity 控制波纹扩散速度（像素/秒）
    const timeBasedStep = (this.clock.elapsedMS * intensity * 0.1) % maxDistance

    ctx.clearRect(0, 0, width, height)
    for (let i = 0; i < circleCount; i++) {
      const radius = (perRadius * i + timeBasedStep) % maxDistance
      this.drawCircle(radius)
    }
  }

  private initCanvas() {
    const { width, height } = this.opts

    this.x = width / 2 + this.opts.xOffset
    this.y = height / 2 + this.opts.yOffset
    this.canvas.width = width
    this.canvas.height = height
  }
}

export type RippleOpts = {
  canvas?: HTMLCanvasElement
  /**
   * @default innerWidth
   */
  width?: number
  /**
   * @default innerHeight
   */
  height?: number
  /**
   * @default 0
   */
  xOffset?: number
  /**
   * @default 180
   */
  yOffset?: number
  /**
   * 波纹速度 **int**
   * @default 1
   */
  intensity?: number
  /**
   * 波纹圈数
   * @default 13
   */
  circleCount?: number
  lineWidth?: number | ((radius: number) => number)
  /**
   * 波纹颜色
   * @default '#3336'
   */
  strokeStyle?: string | ((radius: number) => string)
  onResize?: () => void
}
