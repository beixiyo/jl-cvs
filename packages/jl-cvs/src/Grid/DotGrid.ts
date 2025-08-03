import type { ILifecycleManager } from '../types'
import { debounce, getWinHeight, getWinWidth, throttle } from '@jl-org/tool'

export class DotGrid implements ILifecycleManager {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width: number
  private height: number
  private rows: number = 0
  private cols: number = 0
  private rect: DOMRect | null = null

  private mouseX: number = -1
  private mouseY: number = -1
  private highlightedDots: Set<string> = new Set()
  private dotStates: Map<string, { highlighted: boolean, progress: number }> = new Map()

  private animationFrameId: number | null = null
  private options: Required<DotGridOptions>
  private declare onResizeDebounce: (width: number, height: number) => void

  // ======================
  // * Handlers
  // ======================
  private mouseMoveHandler: (event: MouseEvent) => void
  private mouseLeaveHandler: () => void

  constructor(canvas: HTMLCanvasElement, options: DotGridOptions = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    /** 设置默认配置 */
    const defaultOptions: Required<DotGridOptions> = {
      width: getWinWidth(),
      height: getWinHeight(),
      resizeDebounceTime: 40,
      mouseMoveThrottleTime: 8,
      dotSpacingX: 20,
      dotSpacingY: 20,
      dotRadius: 1,
      dotColor: '#333',
      backgroundColor: '#000',
      highlightGradientColors: ['#fff4', 'transparent'],
      highlightRange: 2,
      transitionTime: 50,
      glowIntensity: 10,
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.width = this.options.width
    this.height = this.options.height

    // ======================
    // * 绑定事件处理器
    // ======================
    this.setDebounceEvent()

    this.mouseMoveHandler = throttle((event: MouseEvent) => {
      if (!this.rect)
        return

      const rect = this.rect
      /** 计算Canvas的缩放比例 */
      const scaleX = this.canvas.width / rect.width
      const scaleY = this.canvas.height / rect.height

      /** 根据缩放比例调整鼠标坐标 */
      this.mouseX = (event.clientX - rect.left) * scaleX
      this.mouseY = (event.clientY - rect.top) * scaleY
      this.updateHighlightedDots()
    }, this.options.mouseMoveThrottleTime)

    this.mouseLeaveHandler = () => {
      this.mouseX = -1
      this.mouseY = -1
      this.highlightedDots.clear()
      this.updateDotStates()
    }

    this.initializeGrid()
    this.bindEvent()
    this.animate()
  }

  /**
   * 调整大小
   * @param width - 宽度
   * @param height - 高度
   */
  onResize(width: number, height: number): void {
    this.onResizeDebounce(width, height)
  }

  /** 绑定事件 */
  bindEvent(): void {
    this.canvas.addEventListener('mousemove', this.mouseMoveHandler)
    this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler)
  }

  /** 解绑所有事件 */
  rmEvent(): void {
    this.canvas.removeEventListener('mousemove', this.mouseMoveHandler)
    this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler)
  }

  /** 销毁实例 */
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.rmEvent()
  }

  /** 更新配置 */
  updateOptions(newOptions: Partial<DotGridOptions>) {
    this.options = { ...this.options, ...newOptions }
    this.initializeGrid()
    this.setDebounceEvent()
  }

  private setDebounceEvent() {
    this.onResizeDebounce = debounce(
      (newWidth, newHeight) => {
        this.width = newWidth
        this.height = newHeight
        this.initializeGrid()
        this.updateHighlightedDots()
      },
      this.options.resizeDebounceTime,
    )
  }

  private initializeGrid() {
    this.rect = this.canvas.getBoundingClientRect()
    this.rows = Math.floor(this.height / this.options.dotSpacingY) + 1
    this.cols = Math.floor(this.width / this.options.dotSpacingX) + 1

    /** 设置 Canvas 尺寸 */
    this.canvas.width = this.width
    this.canvas.height = this.height

    this.dotStates.clear()
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.dotStates.set(`${r},${c}`, { highlighted: false, progress: 0 })
      }
    }
  }

  private updateHighlightedDots() {
    if (this.mouseX < 0 || this.mouseY < 0)
      return

    const dotRow = Math.floor(this.mouseY / this.options.dotSpacingY)
    const dotCol = Math.floor(this.mouseX / this.options.dotSpacingX)

    this.highlightedDots.clear()

    for (
      let r = Math.max(0, dotRow - this.options.highlightRange);
      r <= Math.min(this.rows - 1, dotRow + this.options.highlightRange);
      r++
    ) {
      for (
        let c = Math.max(0, dotCol - this.options.highlightRange);
        c <= Math.min(this.cols - 1, dotCol + this.options.highlightRange);
        c++
      ) {
        const distance = Math.sqrt((dotRow - r) ** 2 + (dotCol - c) ** 2)
        if (distance <= this.options.highlightRange) {
          this.highlightedDots.add(`${r},${c}`)
        }
      }
    }

    this.updateDotStates()
  }

  private updateDotStates() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const key = `${r},${c}`
        const shouldHighlight = this.highlightedDots.has(key)
        const currentState = this.dotStates.get(key)!

        if (shouldHighlight && !currentState.highlighted) {
          currentState.highlighted = true
          currentState.progress = 0
        }
        else if (!shouldHighlight && currentState.highlighted) {
          currentState.highlighted = false
          currentState.progress = 1
        }
      }
    }
  }

  private animate() {
    const deltaTime = 16
    for (const [key, state] of this.dotStates) {
      if (state.highlighted && state.progress < 1) {
        state.progress += deltaTime / this.options.transitionTime
        if (state.progress > 1)
          state.progress = 1
      }
      else if (!state.highlighted && state.progress > 0) {
        state.progress -= deltaTime / this.options.transitionTime
        if (state.progress < 0)
          state.progress = 0
      }
    }

    this.drawWithAnimation()
    this.animationFrameId = requestAnimationFrame(() => this.animate())
  }

  private drawWithAnimation() {
    this.drawDots()

    const originalCompositeOperation = this.ctx.globalCompositeOperation
    const originalShadowBlur = this.ctx.shadowBlur
    const originalShadowColor = this.ctx.shadowColor

    this.ctx.globalCompositeOperation = 'lighter'
    this.ctx.shadowBlur = this.options.glowIntensity
    this.ctx.shadowColor = this.options.highlightGradientColors[0]

    for (const [key, state] of this.dotStates) {
      if (state.progress > 0) {
        const [row, col] = key.split(',').map(Number)
        const x = col * this.options.dotSpacingX
        const y = row * this.options.dotSpacingY

        const maxRadius = this.options.dotRadius * 3
        const currentRadius = this.options.dotRadius + (maxRadius - this.options.dotRadius) * state.progress

        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, currentRadius)
        gradient.addColorStop(0, this.options.highlightGradientColors[0])
        gradient.addColorStop(1, this.options.highlightGradientColors[1])

        this.ctx.globalAlpha = state.progress
        this.ctx.fillStyle = gradient

        this.ctx.beginPath()
        this.ctx.arc(x, y, currentRadius, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }

    this.ctx.globalCompositeOperation = originalCompositeOperation
    this.ctx.shadowBlur = originalShadowBlur
    this.ctx.shadowColor = originalShadowColor
    this.ctx.globalAlpha = 1
  }

  private drawDots() {
    this.ctx.fillStyle = this.options.backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.fillStyle = this.options.dotColor
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.options.dotSpacingX
        const y = row * this.options.dotSpacingY
        this.ctx.beginPath()
        this.ctx.arc(x, y, this.options.dotRadius, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }
  }
}

export interface DotGridOptions {
  /**
   * Canvas 的宽度（像素），决定整个网格区域的宽度
   * @default 视口宽度 (window.innerWidth)
   */
  width?: number

  /**
   * Canvas 的高度（像素），决定整个网格区域的高度
   * @default 视口高度 (window.innerHeight)
   */
  height?: number

  /**
   * 水平方向上点之间的间距（像素）
   * @default 20
   */
  dotSpacingX?: number

  /**
   * 垂直方向上点之间的间距（像素）
   * @default 20
   */
  dotSpacingY?: number

  /**
   * 每个点的半径（像素）
   * @default 1
   */
  dotRadius?: number

  /**
   * 点的颜色
   * @default '#333'
   */
  dotColor?: string

  /**
   * 网格背景颜色
   * @default '#000'
   */
  backgroundColor?: string

  /**
   * 高亮点的渐变颜色，从中心到边缘
   * @default ['#fff4', 'transparent']
   */
  highlightGradientColors?: [string, string]

  /**
   * 高亮影响的范围（周围多少个点），以鼠标为中心计算距离
   * @default 2
   */
  highlightRange?: number

  /**
   * 高亮显示/消失的过渡时间（毫秒）
   * @default 50
   */
  transitionTime?: number

  /**
   * 高亮点的发光强度（阴影模糊半径）
   * @default 10
   */
  glowIntensity?: number

  /**
   * 改变大小时的防抖时间（毫秒）
   * @default 80
   */
  resizeDebounceTime?: number

  /**
   * 鼠标移动时的节流时间（毫秒）
   * @default 16
   */
  mouseMoveThrottleTime?: number
}
