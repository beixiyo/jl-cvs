import { debounce, getWinHeight, getWinWidth, throttle } from '@jl-org/tool'

export class Grid {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width: number
  private height: number
  private resizeDebounceTime = 80
  private mouseMoveThrottleTime = 16

  declare private rows: number
  declare private cols: number
  declare private rect: DOMRect

  private cellWidth: number
  private cellHeight: number

  private backgroundColor: string
  private borderColor: string
  private borderWidth: number

  private highlightGradientColors: [string, string]
  private highlightRange: number

  private transitionTime: number
  private glowIntensity: number
  private highlightBorderWidth: number

  private mouseX: number = -1
  private mouseY: number = -1
  private highlightedCells: Set<string> = new Set()
  private cellStates: Map<string, { highlighted: boolean, progress: number }> = new Map()

  declare unBindEvents: () => void

  private onResizeDebounce: (width: number, height: number) => void

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
    this.width = options.width || getWinWidth()
    this.height = options.height || getWinHeight()

    this.resizeDebounceTime = options.resizeDebounceTime || 80
    this.mouseMoveThrottleTime = options.mouseMoveThrottleTime || 16
    this.onResizeDebounce = debounce(this._onResize.bind(this), this.resizeDebounceTime)

    this.cellWidth = options.cellWidth || 20
    this.cellHeight = options.cellHeight || 20
    this.backgroundColor = options.backgroundColor || '#1a1a1a'
    this.borderColor = options.borderColor || '#333'
    this.borderWidth = options.borderWidth || 0.3
    this.highlightGradientColors = options.highlightGradientColors || ['#fefefe22', 'transparent']
    this.highlightRange = options.highlightRange || 1
    this.transitionTime = options.transitionTime || 200
    this.glowIntensity = options.glowIntensity || 10
    this.highlightBorderWidth = options.highlightBorderWidth || 0.5

    this.initializeGrid()
    this.setupMouseEvents()
    this.animate()
  }

  onResize(width: number, height: number): void {
    this.onResizeDebounce(width, height)
  }

  /**
   * 调整 Canvas 尺寸并重新计算网格。
   * @param newWidth 新的宽度（像素）
   * @param newHeight 新的高度（像素）
   */
  private _onResize(newWidth: number, newHeight: number) {
    this.width = newWidth
    this.height = newHeight

    /** 重新初始化网格 */
    this.initializeGrid()

    /** 重新计算高亮单元格（如果鼠标仍在 Canvas 上） */
    this.updateHighlightedCells()
  }

  /**
   * 初始化网格，计算行数和列数，设置 Canvas 尺寸，并初始化单元格状态。
   */
  private initializeGrid() {
    this.rect = this.canvas.getBoundingClientRect()
    /** 计算网格的行数和列数 */
    this.rows = Math.floor(this.height / this.cellHeight)
    this.cols = Math.floor(this.width / this.cellWidth)

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

  private setupMouseEvents() {
    const mouseMove = throttle((event: MouseEvent) => {
      const rect = this.rect
      this.mouseX = event.clientX - rect.left
      this.mouseY = event.clientY - rect.top
      this.updateHighlightedCells()
    }, this.mouseMoveThrottleTime)

    const mouseLeave = () => {
      this.mouseX = -1
      this.mouseY = -1
      this.highlightedCells.clear()
      this.updateCellStates()
    }

    this.canvas.addEventListener('mousemove', mouseMove)
    this.canvas.addEventListener('mouseleave', mouseLeave)

    this.unBindEvents = () => {
      this.canvas.removeEventListener('mousemove', mouseMove)
      this.canvas.removeEventListener('mouseleave', mouseLeave)
    }
  }

  private updateHighlightedCells() {
    if (this.mouseX < 0 || this.mouseY < 0)
      return

    const cellRow = Math.floor(this.mouseY / this.cellHeight)
    const cellCol = Math.floor(this.mouseX / this.cellWidth)

    this.highlightedCells.clear()

    for (
      let r = Math.max(0, cellRow - this.highlightRange);
      r <= Math.min(this.rows - 1, cellRow + this.highlightRange);
      r++
    ) {
      for (
        let c = Math.max(0, cellCol - this.highlightRange);
        c <= Math.min(this.cols - 1, cellCol + this.highlightRange);
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
        state.progress += deltaTime / this.transitionTime
        if (state.progress > 1)
          state.progress = 1
      }
      else if (!state.highlighted && state.progress > 0) {
        state.progress -= deltaTime / this.transitionTime
        if (state.progress < 0)
          state.progress = 0
      }
    }

    this.drawWithAnimation()
    requestAnimationFrame(() => this.animate())
  }

  private drawWithAnimation() {
    this.drawGrid()

    const originalCompositeOperation = this.ctx.globalCompositeOperation
    const originalShadowBlur = this.ctx.shadowBlur
    const originalShadowColor = this.ctx.shadowColor

    this.ctx.globalCompositeOperation = 'lighter'
    this.ctx.shadowBlur = this.glowIntensity
    this.ctx.shadowColor = this.highlightGradientColors[0]

    for (const [key, state] of this.cellStates) {
      if (state.progress > 0) {
        const [row, col] = key.split(',').map(Number)
        const x = col * this.cellWidth
        const y = row * this.cellHeight

        /** 创建线性渐变，从左到右 */
        const gradient = this.ctx.createLinearGradient(
          x,
          y,
          x + this.cellWidth,
          y + this.cellHeight,
        )
        gradient.addColorStop(0, this.highlightGradientColors[0])
        gradient.addColorStop(1, this.highlightGradientColors[1])

        this.ctx.globalAlpha = state.progress
        this.ctx.strokeStyle = gradient
        this.ctx.lineWidth = this.highlightBorderWidth

        /** 绘制高亮边框 */
        this.ctx.strokeRect(x, y, this.cellWidth, this.cellHeight)
      }
    }

    this.ctx.globalCompositeOperation = originalCompositeOperation
    this.ctx.shadowBlur = originalShadowBlur
    this.ctx.shadowColor = originalShadowColor
    this.ctx.globalAlpha = 1
  }

  private drawGrid() {
    this.ctx.fillStyle = this.backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.strokeStyle = this.borderColor
    this.ctx.lineWidth = this.borderWidth

    for (let row = 0; row <= this.rows; row++) {
      const y = row * this.cellHeight
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.stroke()
    }

    for (let col = 0; col <= this.cols; col++) {
      const x = col * this.cellWidth
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
   * 每个单元格的宽度（像素）
   * @default 20
   */
  cellWidth?: number

  /**
   * 每个单元格的高度（像素）
   * @default 20
   */
  cellHeight?: number

  /**
   * 网格背景颜色
   * @default '#1a1a1a'
   */
  backgroundColor?: string

  /**
   * 网格边框颜色
   * @default '#333'
   */
  borderColor?: string

  /**
   * 网格边框宽度（像素）
   * @default 0.3
   */
  borderWidth?: number

  /**
   * 高亮边框的渐变颜色，从内到外
   * @default ['#fefefe22', 'transparent']
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
