import type { Size } from '../utils/types'
import { getDPR } from '@/canvasTool'

/**
 * Canvas 管理器初始化选项
 */
export interface CanvasManagerOptions {
  /** 作为画布父容器的元素 */
  container: HTMLElement
  /** 背景颜色（CSS 颜色值） */
  background?: string
  /** 尺寸/DPR 变化回调 */
  onResize?: (size: Size, dpr: number) => void
}

/**
 * Canvas 管理器
 * - 负责创建与维护 `<canvas>` 节点
 * - 处理容器尺寸变化与 DPR 变化
 * - 提供 2D 上下文与尺寸查询
 */
export class CanvasManager {
  private readonly container: HTMLElement
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private resizeObserver?: ResizeObserver
  private dpr: number = 1
  private size: Size = { width: 0, height: 0 }

  /**
   * 创建管理器并挂载 `<canvas>` 到容器
   */
  constructor(options: CanvasManagerOptions) {
    this.container = options.container
    this.canvas = document.createElement('canvas')
    this.canvas.style.display = 'block'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.touchAction = 'none'
    if (options.background) {
      this.canvas.style.background = options.background
    }
    this.container.appendChild(this.canvas)

    const ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx)
      throw new Error('Failed to get 2D context')
    this.ctx = ctx

    this.updateDpr()
    this.resizeToContainer()

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeToContainer()
      options.onResize?.(this.getSize(), this.dpr)
    })
    this.resizeObserver.observe(this.container)

    /** 监听 DPR 变化（媒体查询方式，兼容性一般，尽力而为） */
    const mq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    /** 一些浏览器不支持 addEventListener */
    if (mq.addEventListener) {
      mq.addEventListener('change', () => {
        this.updateDpr()
        this.resizeToContainer()
        options.onResize?.(this.getSize(), this.dpr)
      })
    }
  }

  /** 更新 DPR */
  private updateDpr() {
    this.dpr = getDPR()
  }

  /**
   * 根据容器尺寸重置 `<canvas>` 的像素尺寸与基础缩放
   * - 设置 `setTransform(dpr, 0, 0, dpr, 0, 0)` 以做到 1 单位 == 1 CSS 像素
   */
  private resizeToContainer() {
    const rect = this.container.getBoundingClientRect()
    const cssWidth = Math.max(1, Math.floor(rect.width))
    const cssHeight = Math.max(1, Math.floor(rect.height))
    const pixelWidth = Math.floor(cssWidth * this.dpr)
    const pixelHeight = Math.floor(cssHeight * this.dpr)

    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth
      this.canvas.height = pixelHeight
      this.size = { width: cssWidth, height: cssHeight }

      /** 设置基础 transform，确保 1 单位 == 1 CSS 像素 */
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      this.ctx.imageSmoothingEnabled = true
      this.ctx.imageSmoothingQuality = 'high'
    }
  }

  /** 获取 `<canvas>` 元素 */
  getCanvasElement(): HTMLCanvasElement {
    return this.canvas
  }

  /** 获取 2D 上下文 */
  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }

  /** 获取当前 DPR */
  getDpr(): number {
    return this.dpr
  }

  /** 获取 CSS 尺寸（单位：CSS 像素） */
  getSize(): Size {
    return { ...this.size }
  }

  /** 设置背景颜色 */
  setBackground(color: string) {
    this.canvas.style.background = color
  }

  /** 释放资源并从容器移除 `<canvas>` */
  dispose() {
    this.resizeObserver?.disconnect()
    if (this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas)
    }
  }
}
