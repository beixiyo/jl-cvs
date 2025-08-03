import type { ILifecycleManager } from '../types'
import { colorAddOpacity, debounce, getWinHeight, getWinWidth } from '@jl-org/tool'
import { getDPR } from '@/canvasTool'

export class HalftoneWave implements ILifecycleManager {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width: number
  private height: number
  private rows: number = 0
  private cols: number = 0
  private time: number = 0

  private animationFrameId: number | null = null
  private dpr = getDPR()
  private options: Required<HalftoneWaveOptions>
  private declare onResizeDebounce: (width: number, height: number) => void

  constructor(canvas: HTMLCanvasElement, options: HalftoneWaveOptions = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    /** 设置默认配置 */
    const defaultOptions: Required<HalftoneWaveOptions> = {
      width: getWinWidth(),
      height: getWinHeight(),
      resizeDebounceTime: 40,
      gridSize: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      waveColor: 'rgba(255, 255, 255, 0.5)',
      waveSpeed: 0.05,
      waveAmplitude: 0.8,
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
    this.initializeGrid()
    this.bindEvent()
    this.animate()
  }

  /** 绑定事件 */
  bindEvent(): void {
    // HalftoneWave 目前不需要交互事件，保持空实现以符合接口
  }

  /** 解绑所有事件 */
  rmEvent(): void {
    // HalftoneWave 目前不需要交互事件，保持空实现以符合接口
  }

  /** 销毁实例 */
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.rmEvent()
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
  updateOptions(newOptions: Partial<HalftoneWaveOptions>) {
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
      },
      this.options.resizeDebounceTime,
    )
  }

  private initializeGrid() {
    /** 设置 Canvas 尺寸，支持 dpr */
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.ctx.scale(this.dpr, this.dpr)

    this.rows = Math.ceil(this.height / this.options.gridSize)
    this.cols = Math.ceil(this.width / this.options.gridSize)
  }

  private drawHalftoneWave() {
    this.ctx.fillStyle = this.options.backgroundColor
    this.ctx.fillRect(0, 0, this.width, this.height)

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const centerX = x * this.options.gridSize
        const centerY = y * this.options.gridSize
        const distanceFromCenter = Math.sqrt(
          (centerX - this.width / 2) ** 2 + (centerY - this.height / 2) ** 2,
        )
        const maxDistance = Math.sqrt(
          (this.width / 2) ** 2 + (this.height / 2) ** 2,
        )
        const normalizedDistance = distanceFromCenter / maxDistance

        const waveOffset = Math.sin(normalizedDistance * 10 - this.time) * 0.5 + 0.5
        const size = this.options.gridSize * this.options.waveAmplitude * waveOffset

        this.ctx.beginPath()
        this.ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2)
        this.ctx.fillStyle = colorAddOpacity(this.options.waveColor, waveOffset * 0.5)
        this.ctx.fill()
      }
    }
  }

  private animate() {
    this.drawHalftoneWave()
    this.time += this.options.waveSpeed
    this.animationFrameId = requestAnimationFrame(() => this.animate())
  }
}

export interface HalftoneWaveOptions {
  /**
   * Canvas 的宽度（像素）
   * @default 视口宽度
   */
  width?: number

  /**
   * Canvas 的高度（像素）
   * @default 视口高度
   */
  height?: number

  /**
   * 改变大小时的防抖时间（毫秒）
   * @default 40
   */
  resizeDebounceTime?: number

  /**
   * 网格大小（像素）
   * @default 20
   */
  gridSize?: number

  /**
   * 背景颜色
   * @default 'rgba(0, 0, 0, 0.1)'
   */
  backgroundColor?: string

  /**
   * 波浪颜色
   * @default 'rgba(255, 255, 255, 0.5)'
   */
  waveColor?: string

  /**
   * 波浪速度
   * @default 0.05
   */
  waveSpeed?: number

  /**
   * 波浪振幅
   * @default 0.8
   */
  waveAmplitude?: number
}
