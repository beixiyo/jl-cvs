import type { ILifecycleManager } from '../types'
import type { MouseState, Point } from './types'
import { Noise } from './Noise'

/**
 * 波浪线动画类
 *
 * 使用 noise 算法生成波浪效果，并根据鼠标交互产生形变。
 * 通过 `WavyLinesConfig` 可自定义线条间距、颜色、背景色、鼠标影响范围等参数。
 */
export class WavyLines implements ILifecycleManager {
  private ctx: CanvasRenderingContext2D
  private mouse: MouseState
  private lines: Point[][] = []
  private noise: Noise
  private bounding: DOMRect
  private config: Required<WavyLinesConfig>

  // ======================
  // * Hanlders
  // ======================
  private resizeHandler: () => void
  private mouseMoveHandler: (e: MouseEvent) => void
  private touchMoveHandler: (e: TouchEvent) => void

  constructor(config: WavyLinesConfig) {
    const ctx = config.canvas.getContext('2d')
    if (!ctx)
      throw new Error('无法获取canvas上下文')

    this.ctx = ctx
    this.config = {
      canvas: config.canvas,
      xGap: config.xGap ?? 10,
      yGap: config.yGap ?? 32,
      extraWidth: config.extraWidth ?? 200,
      extraHeight: config.extraHeight ?? 30,
      mouseEffectRange: config.mouseEffectRange ?? 175,
      strokeStyle: config.strokeStyle ?? 'black',
      fillStyle: config.fillStyle ?? 'transparent',
    }

    this.mouse = {
      x: -10,
      y: 0,
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      v: 0,
      vs: 0,
      a: 0,
      set: false,
    }

    this.noise = new Noise(Math.random())
    this.bounding = config.canvas.getBoundingClientRect()

    /** 绑定事件处理器 */
    this.resizeHandler = this.onResize.bind(this)
    this.mouseMoveHandler = this.onMouseMove.bind(this)
    this.touchMoveHandler = this.onTouchMove.bind(this)

    this.init()
  }

  private init(): void {
    this.setSize()
    this.setLines()
    this.bindEvent()
    requestAnimationFrame(this.tick.bind(this))
  }

  /** 绑定事件 */
  bindEvent(): void {
    window.addEventListener('resize', this.resizeHandler)
    window.addEventListener('mousemove', this.mouseMoveHandler)
    this.config.canvas.addEventListener('touchmove', this.touchMoveHandler)
  }

  /** 解绑所有事件 */
  rmEvent(): void {
    window.removeEventListener('resize', this.resizeHandler)
    window.removeEventListener('mousemove', this.mouseMoveHandler)
    this.config.canvas.removeEventListener('touchmove', this.touchMoveHandler)
  }

  /**
   * 销毁实例，移除事件监听
   */
  dispose(): void {
    this.rmEvent()
  }

  private onResize(): void {
    this.setSize()
    this.setLines()
  }

  private onMouseMove(e: MouseEvent): void {
    this.updateMousePosition(e.pageX, e.pageY)
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault()
    const touch = e.touches[0]
    this.updateMousePosition(touch.clientX, touch.clientY)
  }

  private updateMousePosition(x: number, y: number): void {
    this.mouse.x = x - this.bounding.left
    this.mouse.y = y - this.bounding.top + window.scrollY

    if (!this.mouse.set) {
      this.mouse.sx = this.mouse.x
      this.mouse.sy = this.mouse.y
      this.mouse.lx = this.mouse.x
      this.mouse.ly = this.mouse.y
      this.mouse.set = true
    }
  }

  private setSize(): void {
    this.bounding = this.config.canvas.getBoundingClientRect()
    this.config.canvas.width = this.bounding.width
    this.config.canvas.height = this.bounding.height
  }

  private setLines(): void {
    const { width, height } = this.bounding
    const { xGap, yGap, extraWidth, extraHeight } = this.config

    this.lines = []

    const oWidth = width + extraWidth
    const oHeight = height + extraHeight

    const totalLines = Math.ceil(oWidth / xGap)
    const totalPoints = Math.ceil(oHeight / yGap)

    const xStart = (width - xGap * totalLines) / 2
    const yStart = (height - yGap * totalPoints) / 2

    for (let i = 0; i <= totalLines; i++) {
      const points: Point[] = []

      for (let j = 0; j <= totalPoints; j++) {
        points.push({
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        })
      }

      this.lines.push(points)
    }
  }

  private movePoints(time: number): void {
    this.lines.forEach((points) => {
      points.forEach((p) => {
        // Wave movement
        const move = this.noise.perlin2(
          (p.x + time * 0.0125) * 0.002,
          (p.y + time * 0.005) * 0.0015,
        ) * 12

        p.wave.x = Math.cos(move) * 32
        p.wave.y = Math.sin(move) * 16

        // Mouse effect
        const dx = p.x - this.mouse.sx
        const dy = p.y - this.mouse.sy
        const d = Math.hypot(dx, dy)
        const l = Math.max(this.config.mouseEffectRange, this.mouse.vs)

        if (d < l) {
          const s = 1 - d / l
          const f = Math.cos(d * 0.001) * s

          p.cursor.vx += Math.cos(this.mouse.a) * f * l * this.mouse.vs * 0.00065
          p.cursor.vy += Math.sin(this.mouse.a) * f * l * this.mouse.vs * 0.00065
        }

        p.cursor.vx += (0 - p.cursor.x) * 0.005 // String tension
        p.cursor.vy += (0 - p.cursor.y) * 0.005

        p.cursor.vx *= 0.925 // Friction/duration
        p.cursor.vy *= 0.925

        p.cursor.x += p.cursor.vx * 2 // Strength
        p.cursor.y += p.cursor.vy * 2

        p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x)) // Clamp movement
        p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y))
      })
    })
  }

  private moved(point: Point, withCursorForce = true): { x: number, y: number } {
    const coords = {
      x: point.x + point.wave.x + (withCursorForce
        ? point.cursor.x
        : 0),
      y: point.y + point.wave.y + (withCursorForce
        ? point.cursor.y
        : 0),
    }

    coords.x = Math.round(coords.x * 10) / 10
    coords.y = Math.round(coords.y * 10) / 10

    return coords
  }

  private drawLines(): void {
    const { width, height } = this.bounding

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.fillStyle = this.config.fillStyle
    this.ctx.fillRect(0, 0, width, height)
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.config.strokeStyle

    this.lines.forEach((points) => {
      let p1 = this.moved(points[0], false)
      this.ctx.moveTo(p1.x, p1.y)

      points.forEach((point, index) => {
        const isLast = index === points.length - 1
        p1 = this.moved(point, !isLast)
        this.ctx.lineTo(p1.x, p1.y)
      })
    })

    this.ctx.stroke()
  }

  private tick(time: number): void {
    // Smooth mouse movement
    this.mouse.sx += (this.mouse.x - this.mouse.sx) * 0.1
    this.mouse.sy += (this.mouse.y - this.mouse.sy) * 0.1

    // Mouse velocity
    const dx = this.mouse.x - this.mouse.lx
    const dy = this.mouse.y - this.mouse.ly
    const d = Math.hypot(dx, dy)

    this.mouse.v = d
    this.mouse.vs += (d - this.mouse.vs) * 0.1
    this.mouse.vs = Math.min(100, this.mouse.vs)

    // Mouse last position
    this.mouse.lx = this.mouse.x
    this.mouse.ly = this.mouse.y

    // Mouse angle
    this.mouse.a = Math.atan2(dy, dx)

    this.movePoints(time)
    this.drawLines()

    requestAnimationFrame(this.tick.bind(this))
  }
}

/**
 * 波浪动画配置项
 */
export interface WavyLinesConfig {
  /**
   * Canvas元素
   */
  canvas: HTMLCanvasElement

  /**
   * 水平间距
   * @default 10
   */
  xGap?: number

  /**
   * 垂直间距
   * @default 32
   */
  yGap?: number

  /**
   * 额外宽度
   * @default 200
   */
  extraWidth?: number

  /**
   * 额外高度
   * @default 30
   */
  extraHeight?: number

  /**
   * 鼠标效果范围
   * @default 175
   */
  mouseEffectRange?: number

  /**
   * 线条颜色
   * @default 'black'
   */
  strokeStyle?: string

  /**
   * 背景色
   * @default 'transparent'
   */
  fillStyle?: string
}
