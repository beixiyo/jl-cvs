import type { CanvasManager } from './CanvasManager'
import type { Scene } from './Scene'
import type { Viewport } from './Viewport'
import type { Rect } from '@/Shapes/type'
import { Scheduler } from './Scheduler'

/** 渲染器初始化选项 */
export interface RenderEngineOptions {
  /** 背景颜色（若不为空则填充） */
  background?: string
  /** 是否使用离屏缓冲（OffscreenCanvas / Canvas） */
  useBuffer?: boolean // 使用离屏缓冲（OffscreenCanvas 或普通 Canvas）
}

/**
 * 渲染引擎
 * - 负责清屏、变换设置、视口裁剪候选、逐图形绘制
 * - 支持交互期连续重绘与可选双缓冲
 */
export class RenderEngine {
  private readonly manager: CanvasManager
  private readonly viewport: Viewport
  private readonly scene: Scene
  private readonly scheduler: Scheduler
  private needsRender = true
  private continuous = false
  private background: string | undefined

  private bufferCanvas: OffscreenCanvas | HTMLCanvasElement | null = null
  private bufferCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null = null
  private useBuffer = false

  constructor(manager: CanvasManager, viewport: Viewport, scene: Scene, options?: RenderEngineOptions) {
    this.manager = manager
    this.viewport = viewport
    this.scene = scene
    this.background = options?.background
    this.useBuffer = !!options?.useBuffer

    this.scheduler = new Scheduler(() => this.render())
  }

  /** 设置连续重绘（交互期间开启，结束关闭） */
  setContinuousRendering(enabled: boolean) {
    this.continuous = enabled
    if (enabled)
      this.requestRender()
  }

  /** 请求下一帧重绘 */
  requestRender() {
    this.needsRender = true
  }

  /** 启动渲染循环 */
  start() {
    if (!this.scheduler.isRunning()) {
      this.scheduler.start()
    }
  }

  /** 停止渲染循环 */
  stop() {
    this.scheduler.stop()
  }

  /**
   * 确保离屏缓冲尺寸与像素尺寸一致
   */
  private ensureBuffer(sizePixelW: number, sizePixelH: number) {
    if (!this.useBuffer)
      return
    const needInit = !this.bufferCanvas
    if (needInit) {
      if (typeof OffscreenCanvas !== 'undefined') {
        this.bufferCanvas = new OffscreenCanvas(sizePixelW, sizePixelH)
      }
      else {
        const c = document.createElement('canvas')
        c.width = sizePixelW
        c.height = sizePixelH
        this.bufferCanvas = c
      }
    }
    if (!this.bufferCanvas)
      return

    // Resize if needed
    if ((this.bufferCanvas as any).width !== sizePixelW || (this.bufferCanvas as any).height !== sizePixelH) {
      ;(this.bufferCanvas as any).width = sizePixelW
      ;(this.bufferCanvas as any).height = sizePixelH
    }

    if (!this.bufferCtx) {
      this.bufferCtx = (this.bufferCanvas as any).getContext('2d', { alpha: true, desynchronized: true })
    }
  }

  /**
   * 清理目标绘制对象并按需填充背景
   * - 使用 dpr 基础 transform 以 CSS 像素为单位清屏
   */
  private clearTarget(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, pixelW: number, pixelH: number, dpr: number) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (this.background) {
      ctx.fillStyle = this.background
      ctx.fillRect(0, 0, pixelW / dpr, pixelH / dpr)
    }
    else {
      ctx.clearRect(0, 0, pixelW / dpr, pixelH / dpr)
    }
  }

  /** 获取可见世界矩形 */
  private getVisibleWorldRect(): Rect {
    const size = this.manager.getSize()
    return this.viewport.getWorldVisibleRect(size)
  }

  /** 渲染一帧 */
  private render() {
    if (!this.continuous && !this.needsRender)
      return
    this.needsRender = false

    const size = this.manager.getSize()
    const dpr = this.manager.getDpr()
    const pixelW = Math.floor(size.width * dpr)
    const pixelH = Math.floor(size.height * dpr)
    const state = this.viewport.getState()

    if (this.useBuffer) {
      this.ensureBuffer(pixelW, pixelH)
      if (!this.bufferCtx || !this.bufferCanvas)
        return

      /** 清理并设置背景（在缓冲上） */
      this.clearTarget(this.bufferCtx as any, pixelW, pixelH, dpr)

      /** 合成矩阵: Screen = (World - pan) * zoom * dpr */
      this.bufferCtx.setTransform(
        dpr * state.zoom,
        0,
        0,
        dpr * state.zoom,
        -state.panX * dpr * state.zoom,
        -state.panY * dpr * state.zoom,
      )

      const visibleWorldRect = this.getVisibleWorldRect()
      const candidates = this.scene.queryByRect(visibleWorldRect)
      for (let i = 0; i < candidates.length; i++) {
        const shape = candidates[i]
        if (!shape.meta.visible)
          continue

        shape.draw(this.bufferCtx)
      }

      /** 将缓冲绘制到显示画布 */
      const vctx = this.manager.getContext()
      vctx.setTransform(1, 0, 0, 1, 0, 0)
      vctx.clearRect(0, 0, pixelW, pixelH)
      vctx.drawImage(this.bufferCanvas as any, 0, 0)
      /** 复原 dpr 基础状态 */
      vctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      return
    }

    /** 直接在可见画布绘制 */
    const vctx = this.manager.getContext()
    /** 清理并设置背景 */
    this.clearTarget(vctx, pixelW, pixelH, dpr)

    /** 合成矩阵: Screen = (World - pan) * zoom * dpr */
    vctx.setTransform(
      dpr * state.zoom,
      0,
      0,
      dpr * state.zoom,
      -state.panX * dpr * state.zoom,
      -state.panY * dpr * state.zoom,
    )

    const visibleWorldRect = this.getVisibleWorldRect()
    const candidates = this.scene.queryByRect(visibleWorldRect)
    for (let i = 0; i < candidates.length; i++) {
      const shape = candidates[i]
      if (!shape.meta.visible)
        continue

      shape.draw(vctx)
    }

    /** 复原 dpr 基础状态 */
    vctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
}
