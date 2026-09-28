import { debounce } from '@jl-org/tool'
import { applyHiDPI } from '../utils/dpr'

export class StarField {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private stars: IStar[]
  private time: number = 0
  private config: Required<StarFieldConfig>
  private animationFrameId: number | null = null

  /** 逻辑坐标系的画布尺寸（CSS 像素，与 dpr 无关） */
  private width: number
  private height: number

  /** 颜色 → 预渲染发光 sprite，整个生命周期只创建一次径向渐变 */
  private spriteCache: Map<string, HTMLCanvasElement>

  private onResizeDebounce: (width: number, height: number) => void

  /**
   * 构造函数
   * @param canvas HTMLCanvasElement 画布元素
   * @param options StarFieldConfig 配置项（可选）
   * @example
   * ```ts
   * const canvas = document.createElement('canvas')
   * document.body.appendChild(canvas)
   * const starField = new StarField(canvas)
   * // 不再使用时停止动画释放资源
   * starField.dispose()
   * ```
   */
  constructor(canvas: HTMLCanvasElement, options: StarFieldConfig = {}) {
    this.canvas = canvas
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.stars = []
    this.spriteCache = new Map()

    /** 默认配置 */
    const defaultConfig: Required<StarFieldConfig> = {
      starCount: 300,
      sizeRange: [0.5, 2],
      speedRange: 0.1,
      colors: ['#ffffff', '#ffe9c4', '#d4fbff'],
      backgroundColor: '#001122',
      flickerSpeed: 0.01,
      width: window.innerWidth,
      height: window.innerHeight,
      resizeDebounceTime: 40,
    }

    /** 合并用户配置和默认配置 */
    this.config = { ...defaultConfig, ...options }
    this.width = this.config.width
    this.height = this.config.height

    /** 设置画布尺寸（dpr 边界统一入口） */
    applyHiDPI(this.canvas, this.context, this.width, this.height)

    this.onResizeDebounce = debounce(
      (newWidth, newHeight) => {
        this.width = newWidth
        this.height = newHeight
        applyHiDPI(this.canvas, this.context, newWidth, newHeight)
        this.initStars()
      },
      this.config.resizeDebounceTime,
    )

    /** 初始化星星 */
    this.initStars()

    /** 开始动画 */
    this.start()
  }

  onResize(width: number, height: number): void {
    this.onResizeDebounce(width, height)
  }

  /** 开始动画 */
  start() {
    if (this.animationFrameId !== null) return

    this.animate()
  }

  /** 停止动画 */
  stop() {
    if (this.animationFrameId === null) return

    cancelAnimationFrame(this.animationFrameId)
    this.animationFrameId = null
  }

  /** 销毁实例 */
  dispose() {
    this.stop()
    this.spriteCache.clear()
  }

  /**
   * 初始化星星
   * - 根据配置生成星星的初始属性
   * - 位置基于逻辑尺寸，与绘制坐标系一致
   */
  private initStars(): void {
    this.stars = []
    for (let i = 0; i < this.config.starCount; i++) {
      const baseColor = this.getStarColor()
      const star: IStar = {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: this.config.sizeRange[0] + Math.random() * (this.config.sizeRange[1] - this.config.sizeRange[0]),
        baseColor,
        sprite: this.getSprite(baseColor),
        alpha: 0.5,
        dx: (Math.random() - 0.5) * 2 * this.config.speedRange,
        dy: (Math.random() - 0.5) * 2 * this.config.speedRange,
        phase: Math.random() * Math.PI * 2,
      }
      this.stars.push(star)
    }
  }

  /**
   * 获取星星的颜色
   * - 如果配置的是函数，随机选择一个颜色
   * - 如果配置的是数组，随机选择一个颜色
   * @returns string 星星的颜色
   */
  private getStarColor(): string {
    if (typeof this.config.colors === 'function') {
      return this.config.colors()
    }
    else {
      const colors = this.config.colors as string[]
      return colors[Math.floor(Math.random() * colors.length)]
    }
  }

  /**
   * 预渲染单色发光 sprite
   *
   * 径向渐变只在这里创建一次：中心白色高亮、0.3 处主题色（80% 透明度）、边缘全透明，
   * 每帧通过 globalAlpha 缩放得到与逐帧渐变一致的亮度曲线
   */
  private getSprite(color: string): HTMLCanvasElement {
    const cached = this.spriteCache.get(color)
    if (cached) {
      return cached
    }

    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const center = size / 2

    const gradient = ctx.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      center,
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, withAlpha(color, 0.8))
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    this.spriteCache.set(color, canvas)
    return canvas
  }

  /**
   * 更新星星状态
   * - 更新位置和透明度（闪烁效果）
   */
  private update(): void {
    this.time += this.config.flickerSpeed
    for (const star of this.stars) {
      star.x += star.dx
      star.y += star.dy

      /** 边缘环绕（逻辑坐标系） */
      star.x = ((star.x % this.width) + this.width) % this.width
      star.y = ((star.y % this.height) + this.height) % this.height

      /** 正弦波调整透明度，实现平滑闪烁 */
      star.alpha = 0.5 + 0.5 * Math.sin(this.time + star.phase)
    }
  }

  /**
   * 绘制星星
   * - 每帧仅 drawImage 预渲染 sprite，零对象分配
   */
  private draw(): void {
    this.context.clearRect(0, 0, this.width, this.height)

    if (this.config.backgroundColor !== 'transparent') {
      this.context.fillStyle = this.config.backgroundColor
      this.context.fillRect(0, 0, this.width, this.height)
    }

    for (const star of this.stars) {
      /** 光晕直径 = 半径 × 2（渐变全径） */
      const glowRadius = star.radius * 2
      this.context.globalAlpha = star.alpha
      this.context.drawImage(
        star.sprite,
        star.x - glowRadius,
        star.y - glowRadius,
        glowRadius * 2,
        glowRadius * 2,
      )
    }
    this.context.globalAlpha = 1
  }

  /**
   * 动画循环
   * - 持续调用 update 和 draw
   */
  private animate(): void {
    this.update()
    this.draw()
    this.animationFrameId = requestAnimationFrame(() => this.animate())
  }
}

/** 十六进制颜色附加透明度；非 #rrggbb 输入原样返回 */
function withAlpha(color: string, alpha: number): string {
  const match = color.match(/^#([0-9a-fA-F]{6})$/)
  if (!match) {
    return color
  }
  const value = Number.parseInt(match[1], 16)
  const r = (value >> 16) & 0xFF
  const g = (value >> 8) & 0xFF
  const b = value & 0xFF
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export interface StarFieldConfig {
  /**
   * 星星数量
   * @default  300
   */
  starCount?: number

  /**
   * 星星大小范围
   * @default  [0.5, 2]
   */
  sizeRange?: [number, number]

  /**
   * 速度范围，
   * 星星速度在 [-speedRange, speedRange]
   * @default  0.1
   */
  speedRange?: number

  /**
   * 颜色配置：颜色数组或颜色生成函数
   * @default  ['#ffffff', '#ffe9c4', '#d4fbff']
   */
  colors?: string[] | (() => string)

  /**
   * 背景颜色
   * @default  '#001122'
   */
  backgroundColor?: string

  /**
   * 闪烁速度，
   * 控制正弦波频率
   * @default  0.01
   */
  flickerSpeed?: number

  /**
   * 改变大小时的防抖时间
   * @default  80
   */
  resizeDebounceTime?: number

  width?: number
  height?: number
}

export interface IStar {
  x: number
  y: number
  radius: number
  /** 用于渐变中间色 */
  baseColor: string
  /** 预渲染的发光 sprite（与 baseColor 一一对应） */
  sprite: HTMLCanvasElement
  alpha: number
  dx: number
  dy: number
  phase: number
}
