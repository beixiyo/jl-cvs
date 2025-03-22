import { debounce } from '@jl-org/tool'


export class StarField {

  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private stars: IStar[]
  private time: number = 0
  private config: Required<StarFieldConfig>

  private onResizeDebounce: (width: number, height: number) => void

  /**
   * 构造函数
   * @param canvas HTMLCanvasElement 画布元素
   * @param options StarFieldConfig 配置项（可选）
   * @example
   * ```ts
   * const canvas = document.createElement('canvas')
   * document.body.appendChild(canvas)
   * new StarField(canvas)
   * ```
   */
  constructor(canvas: HTMLCanvasElement, options: StarFieldConfig = {}) {
    this.canvas = canvas
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.stars = []

    /** 默认配置 */
    const defaultConfig: Required<StarFieldConfig> = {
      starCount: 300,
      sizeRange: [0.5, 2],
      speedRange: 0.05,
      colors: ['#ffffff', '#ffe9c4', '#d4fbff'],
      backgroundColor: '#001122',
      flickerSpeed: 0.01,
      width: window.innerWidth,
      height: window.innerHeight,
      debounceTime: 80
    }

    /** 合并用户配置和默认配置 */
    this.config = { ...defaultConfig, ...options }

    /** 设置画布尺寸 */
    this.canvas.width = this.config.width
    this.canvas.height = this.config.height

    this.onResizeDebounce = debounce(this._onResize.bind(this), this.config.debounceTime)

    /** 初始化星星 */
    this.initStars()

    /** 开始动画 */
    this.animate()
  }

  /**
   * 处理窗口大小变化
   */
  private _onResize(width: number, height: number): void {
    this.canvas.width = width
    this.canvas.height = height
    this.initStars()
  }

  onResize(width: number, height: number): void {
    this.onResizeDebounce(width, height)
  }

  /**
   * 初始化星星
   * - 根据配置生成星星的初始属性
   */
  private initStars(): void {
    this.stars = []
    for (let i = 0; i < this.config.starCount; i++) {
      const star: IStar = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: this.config.sizeRange[0] + Math.random() * (this.config.sizeRange[1] - this.config.sizeRange[0]),
        baseColor: this.getStarColor(),
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
   * - 如果配置的是数组，随机选择一个颜色
   * - 如果配置的是函数，调用函数获取颜色
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
   * 更新星星状态
   * - 更新位置和透明度（闪烁效果）
   */
  private update(): void {
    this.time += this.config.flickerSpeed
    for (const star of this.stars) {
      star.x += star.dx
      star.y += star.dy

      /** 边缘环绕 */
      star.x = ((star.x % this.canvas.width) + this.canvas.width) % this.canvas.width
      star.y = ((star.y % this.canvas.height) + this.canvas.height) % this.canvas.height

      /** 正弦波调整透明度，实现平滑闪烁 */
      star.alpha = 0.5 + 0.5 * Math.sin(this.time + star.phase)
    }
  }

  /**
   * 绘制星星
   * - 使用径向渐变实现光晕和闪烁效果
   */
  private draw(): void {
    /** 绘制背景 */
    this.context.fillStyle = this.config.backgroundColor
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    for (const star of this.stars) {
      /**
       * createRadialGradient(x0, y0, r0, x1, y1, r1)
       * 创建一个从 (x0, y0) 到 (x1, y1) 的径向渐变
       *
       * 在这里，起点和终点都设为星星的中心 (star.x, star.y)
       * 但半径从 0 到 star.radius * 2，形成从中心向外扩散的渐变
       */
      const gradient = this.context.createRadialGradient(
        star.x,
        star.y,
        0,
        star.x,
        star.y,
        star.radius * 2,
      )

      /**
       * 渐变色配置：
       * - 中心：白色高亮，透明度随 alpha 变化
       * - 中间：使用 star.baseColor，透明度略低
       * - 边缘：完全透明
       */
      gradient.addColorStop(0, `hsla(0, 100%, 100%, ${star.alpha})`)

      /**
       * 使用 star.baseColor（从 colors 获取）
       * 并通过 alpha * 0.8 计算透明度，转换为十六进制附加到颜色后
       * 例如，若 baseColor 是 #ff0000，透明度为 0.8，则结果为 #ff0000cc
       * 边缘：保持完全透明
       */
      gradient.addColorStop(
        0.3,
        `${star.baseColor}${Math.round(star.alpha * 0.8 * 255).toString(16).padStart(2, '0')}`
      )
      gradient.addColorStop(1, 'transparent')

      this.context.beginPath()
      this.context.fillStyle = gradient
      this.context.arc(star.x, star.y, star.radius, 0, Math.PI * 2, true)
      this.context.fill()
      this.context.closePath()
    }
  }

  /**
   * 动画循环
   * - 持续调用 update 和 draw
   */
  private animate(): void {
    this.update()
    this.draw()
    requestAnimationFrame(() => this.animate())
  }
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
   * @default  0.05
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
  debounceTime?: number

  width?: number
  height?: number
}

export interface IStar {
  x: number
  y: number
  radius: number
  /** 用于渐变中间色 */
  baseColor: string
  alpha: number
  dx: number
  dy: number
  phase: number
}