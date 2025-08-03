import type { ILifecycleManager } from '../types'
import { colorAddOpacity, debounce } from '@jl-org/tool'

export class HalftoneWave implements ILifecycleManager {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width: number
  private height: number
  private resizeDebounceTime: number

  private rows: number = 0
  private cols: number = 0
  private gridSize: number
  private time: number = 0

  private backgroundColor: string
  private waveColor: string
  private waveSpeed: number
  private waveAmplitude: number

  private animationFrameId: number | null = null
  private onResizeDebounce: (width: number, height: number) => void

  constructor(canvas: HTMLCanvasElement, options: HalftoneWaveOptions = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.width = options.width || window.innerWidth
    this.height = options.height || window.innerHeight
    this.resizeDebounceTime = options.resizeDebounceTime || 40

    this.gridSize = options.gridSize || 20
    this.backgroundColor = options.backgroundColor || 'rgba(0, 0, 0, 0.1)'
    this.waveColor = options.waveColor || 'rgba(255, 255, 255, 0.5)'
    this.waveSpeed = options.waveSpeed || 0.05
    this.waveAmplitude = options.waveAmplitude || 0.8

    this.onResizeDebounce = debounce(
      (newWidth, newHeight) => {
        this.width = newWidth
        this.height = newHeight
        this.initializeGrid()
      },
      this.resizeDebounceTime,
    )

    this.initializeGrid()
    this.bindEvent()
    this.animate()
  }

  /** 绑定事件 */
  bindEvent(): void { }

  /** 解绑所有事件 */
  rmEvent(): void { }

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

  private initializeGrid() {
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.rows = Math.ceil(this.height / this.gridSize)
    this.cols = Math.ceil(this.width / this.gridSize)
  }

  private drawHalftoneWave() {
    this.ctx.fillStyle = this.backgroundColor
    this.ctx.fillRect(0, 0, this.width, this.height)

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const centerX = x * this.gridSize
        const centerY = y * this.gridSize
        const distanceFromCenter = Math.sqrt(
          (centerX - this.width / 2) ** 2 + (centerY - this.height / 2) ** 2,
        )
        const maxDistance = Math.sqrt(
          (this.width / 2) ** 2 + (this.height / 2) ** 2,
        )
        const normalizedDistance = distanceFromCenter / maxDistance

        const waveOffset = Math.sin(normalizedDistance * 10 - this.time) * 0.5 + 0.5
        const size = this.gridSize * this.waveAmplitude * waveOffset

        this.ctx.beginPath()
        this.ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2)
        this.ctx.fillStyle = colorAddOpacity(this.waveColor, waveOffset * 0.5)
        this.ctx.fill()
      }
    }
  }

  private animate() {
    this.drawHalftoneWave()
    this.time += this.waveSpeed
    this.animationFrameId = requestAnimationFrame(() => this.animate())
  }
}

export interface HalftoneWaveOptions {
  width?: number
  height?: number
  resizeDebounceTime?: number
  gridSize?: number
  backgroundColor?: string
  waveColor?: string
  waveSpeed?: number
  waveAmplitude?: number
}
