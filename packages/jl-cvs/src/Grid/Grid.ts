import type { ILifecycleManager } from '../types'
import { debounce, getWinHeight, getWinWidth, throttle } from '@jl-org/tool'

export class Grid implements ILifecycleManager {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width: number
  private height: number
  private rows: number = 0
  private cols: number = 0
  private rect: DOMRect | null = null

  private mouseX: number = -1
  private mouseY: number = -1
  private highlightedCells: Set<string> = new Set()
  private cellStates: Map<string, { highlighted: boolean, progress: number }> = new Map()

  private animationFrameId: number | null = null
  private options: Required<GridOptions>
  private declare onResizeDebounce: (width: number, height: number) => void

  // ======================
  // * Handlers
  // ======================
  private mouseMoveHandler: (event: MouseEvent) => void
  private mouseLeaveHandler: () => void

  /**
   * @example
   * const canvas = document.createElement('canvas')
   * document.body.appendChild(canvas)
   * Object.assign(document.body.style, {
   *   overflow: 'hidden',
   *   margin: 0,
   *   padding: 0,
   * })
   *
   * new Grid(canvas)
   */
  constructor(canvas: HTMLCanvasElement, options: GridOptions = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    /** 设置默认配置 */
    const defaultOptions: Required<GridOptions> = {
      width: getWinWidth(),
      height: getWinHeight(),
      resizeDebounceTime: 40,
      mouseMoveThrottleTime: 8,
      cellWidth: 35,
      cellHeight: 35,
      dashedLines: false,
      dashPattern: [2, 2],
      backgroundColor: '#1a1a1a',
      borderColor: '#666',
      borderWidth: 0.3,
      highlightGradientColors: ['#fefefe55', 'transparent'],
      highlightRange: 1,
      transitionTime: 200,
      glowIntensity: 10,
      highlightBorderWidth: 0.5,
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
      this.updateHighlightedCells()
    }, this.options.mouseMoveThrottleTime)

    this.mouseLeaveHandler = () => {
      this.mouseX = -1
      this.mouseY = -1
      this.highlightedCells.clear()
      this.updateCellStates()
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

  /** 更新配置 */
  updateOptions(newOptions: Partial<GridOptions>) {
    this.options = { ...this.options, ...newOptions }
    this.initializeGrid()
    this.setDebounceEvent()
  }

  private setDebounceEvent() {
    this.onResizeDebounce = debounce(
      (newWidth, newHeight) => {
        this.width = newWidth
        this.height = newHeight

        /** 重新初始化网格 */
        this.initializeGrid()

        /** 重新计算高亮单元格（如果鼠标仍在 Canvas 上） */
        this.updateHighlightedCells()
      },
      this.options.resizeDebounceTime,
    )
  }

  /**
   * 初始化网格，计算行数和列数，设置 Canvas 尺寸，并初始化单元格状态。
   */
  private initializeGrid() {
    this.rect = this.canvas.getBoundingClientRect()
    /** 计算网格的行数和列数 */
    this.rows = Math.floor(this.height / this.options.cellHeight)
    this.cols = Math.floor(this.width / this.options.cellWidth)

    /** 设置 Canvas 尺寸 */
    this.canvas.width = this.width
    this.canvas.height = this.height

    /** 初始化单元格状态 */
    this.cellStates.clear()
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cellStates.set(`${r},${c}`, { highlighted: false, progress: 0 })
      }
    }
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

  private updateHighlightedCells() {
    if (this.mouseX < 0 || this.mouseY < 0)
      return

    const cellRow = Math.floor(this.mouseY / this.options.cellHeight)
    const cellCol = Math.floor(this.mouseX / this.options.cellWidth)

    this.highlightedCells.clear()

    for (
      let r = Math.max(0, cellRow - this.options.highlightRange);
      r <= Math.min(this.rows - 1, cellRow + this.options.highlightRange);
      r++
    ) {
      for (
        let c = Math.max(0, cellCol - this.options.highlightRange);
        c <= Math.min(this.cols - 1, cellCol + this.options.highlightRange);
        c++
      ) {
        this.highlightedCells.add(`${r},${c}`)
      }
    }

    this.updateCellStates()
  }

  private updateCellStates() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const key = `${r},${c}`
        const shouldHighlight = this.highlightedCells.has(key)
        const currentState = this.cellStates.get(key)!

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
    for (const [key, state] of this.cellStates) {
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
    this.drawGrid()

    const originalCompositeOperation = this.ctx.globalCompositeOperation
    const originalShadowBlur = this.ctx.shadowBlur
    const originalShadowColor = this.ctx.shadowColor

    this.ctx.globalCompositeOperation = 'lighter'
    this.ctx.shadowBlur = this.options.glowIntensity
    this.ctx.shadowColor = this.options.highlightGradientColors[0]

    for (const [key, state] of this.cellStates) {
      if (state.progress > 0) {
        const [row, col] = key.split(',').map(Number)
        const x = col * this.options.cellWidth
        const y = row * this.options.cellHeight

        /** 创建线性渐变，从左到右 */
        const gradient = this.ctx.createLinearGradient(
          x,
          y,
          x + this.options.cellWidth,
          y + this.options.cellHeight,
        )
        gradient.addColorStop(0, this.options.highlightGradientColors[0])
        gradient.addColorStop(1, this.options.highlightGradientColors[1])

        this.ctx.globalAlpha = state.progress
        this.ctx.strokeStyle = gradient
        this.ctx.lineWidth = this.options.highlightBorderWidth

        /** 绘制高亮边框 */
        this.ctx.strokeRect(x, y, this.options.cellWidth, this.options.cellHeight)
      }
    }

    this.ctx.globalCompositeOperation = originalCompositeOperation
    this.ctx.shadowBlur = originalShadowBlur
    this.ctx.shadowColor = originalShadowColor
    this.ctx.globalAlpha = 1
  }

  private drawGrid() {
    this.ctx.fillStyle = this.options.backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.strokeStyle = this.options.borderColor
    this.ctx.lineWidth = this.options.borderWidth

    /** 添加虚线样式控制 */
    if (this.options.dashedLines) {
      this.ctx.setLineDash(this.options.dashPattern)
    }
    else {
      this.ctx.setLineDash([])
    }

    for (let row = 0; row <= this.rows; row++) {
      const y = row * this.options.cellHeight
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.stroke()
    }

    for (let col = 0; col <= this.cols; col++) {
      const x = col * this.options.cellWidth
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.stroke()
    }
  }
}

export interface GridOptions {
  /**
   * Canvas 的宽度（像素），决定整个网格区域的宽度
   * @default 视口宽度
   */
  width?: number

  /**
   * Canvas 的高度（像素），决定整个网格区域的高度
   * @default 视口高度
   */
  height?: number

  /**
   * 是否使用虚线绘制网格线
   * @default false
   */
  dashedLines?: boolean
  /**
   * 虚线样式，例如 [5, 5] 表示 5像素实线和5像素空白
   * @default [2, 2]
   */
  dashPattern?: number[]

  /**
   * 每个单元格的宽度（像素）
   * @default 35
   */
  cellWidth?: number

  /**
   * 每个单元格的高度（像素）
   * @default 35
   */
  cellHeight?: number

  /**
   * 网格背景颜色
   * @default '#1a1a1a'
   */
  backgroundColor?: string

  /**
   * 网格边框颜色
   * @default '#666'
   */
  borderColor?: string

  /**
   * 网格边框宽度（像素）
   * @default 0.3
   */
  borderWidth?: number

  /**
   * 高亮边框的渐变颜色，从内到外
   * @default ['#fefefe55', 'transparent']
   */
  highlightGradientColors?: [string, string]

  /**
   * 高亮影响的范围（周围多少个单元格）
   * @default 1
   */
  highlightRange?: number

  /**
   * 高亮显示/消失的过渡时间（毫秒）
   * @default 200
   */
  transitionTime?: number

  /**
   * 高亮边框的发光强度（阴影模糊半径）
   * @default 10
   */
  glowIntensity?: number

  /**
   * 高亮边框的宽度（像素）
   * @default 0.5
   */
  highlightBorderWidth?: number

  /**
   * 改变大小时的防抖时间
   * @default  80
   */
  resizeDebounceTime?: number

  /**
   * 鼠标移动时的节流时间
   * @default 16
   */
  mouseMoveThrottleTime?: number
}
