import type { CanvasAppOptions, CursorMode, DrawModeOptions, Point } from '../types'
import type { BaseShape } from '@/Shapes/libs/BaseShape'
import type { BoundRect } from '@/Shapes/type'
import { EventBus } from '@jl-org/tool'
import { InteractionManager } from '../interaction/InteractionManager'
import { CanvasManager } from './CanvasManager'
import { RenderEngine } from './RenderEngine'
import { Scene } from './Scene'
import { Viewport } from './Viewport'

/** 应用事件映射 */
export interface CanvasAppEventMap {
  /** 视口变化 */
  viewportChange: ReturnType<Viewport['getState']>
  /** 画布尺寸或 dpr 变化 */
  resize: { width: number, height: number, dpr: number }
  /** 形状新增 */
  shapeAdded: BaseShape
  /** 形状移除 */
  shapeRemoved: string
  /** 形状拖拽开始 */
  shapeDragStart: BaseShape
  /** 形状拖拽中 */
  shapeDrag: BaseShape
  /** 形状拖拽结束 */
  shapeDragEnd: BaseShape
  /** 鼠标点击事件 */
  click: Point
  /** 绘制开始 */
  drawStart: BaseShape
  /** 绘制中 */
  drawing: BaseShape
  /** 绘制结束 */
  drawEnd: BaseShape
}

/**
 * 画布应用（门面）
 * - 负责聚合管理器、视口、场景与渲染引擎，提供对外 API
 */
export class CanvasApp extends EventBus<CanvasAppEventMap> {
  private readonly engine: RenderEngine
  private readonly manager: CanvasManager
  private readonly viewport: Viewport
  private readonly scene: Scene
  private interaction: InteractionManager
  private lastClickPosition: Point = { x: 0, y: 0 }

  /** 创建应用实例 */
  constructor(options: CanvasAppOptions) {
    super()
    const opts: CanvasAppOptions = {
      pan: { x: 0, y: 0 },
      zoom: 1,
      minZoom: 0.05,
      maxZoom: 16,
      ...options,
    }

    this.manager = new CanvasManager({
      el: opts.el,
      background: opts.background,
      onResize: (size, dpr) => {
        this.engine.requestRender()
        this.emit('resize', { width: size.width, height: size.height, dpr })
      },
    })

    this.viewport = new Viewport({
      minZoom: opts.minZoom,
      maxZoom: opts.maxZoom,
      zoom: opts.zoom,
      pan: opts.pan,
      onViewportChange: (state) => {
        this.emit('viewportChange', state)
        this.engine.requestRender()
      },
    })

    this.scene = new Scene()

    this.engine = new RenderEngine(this.manager, this.viewport, this.scene, {
      background: opts.background,
      useBuffer: false,
    })

    const canvas = this.manager.getCanvasElement()
    const defaultCursor = canvas.style.cursor
    this.interaction = new InteractionManager(canvas, this.viewport, this.scene, {
      enablePan: true,
      enableWheelZoom: true,
      enableShapeDrag: true,
      cursorMode: 'pan',
      drawOptions: {
        onDrawStart: (shape) => {
          this.emit('drawStart', shape)
          this.engine.requestRender()
        },
        onDrawing: (shape) => {
          this.emit('drawing', shape)
          this.engine.requestRender()
        },
        onDrawEnd: (shape) => {
          this.emit('drawEnd', shape)
          this.engine.requestRender()
        },
      },
      onShapeDragStart: (shape) => {
        canvas.style.cursor = 'grabbing'
        this.scene.sortZIndex(shape)
        this.emit('shapeDragStart', shape)
      },
      onShapeDrag: (shape) => {
        this.emit('shapeDrag', shape)
        this.engine.requestRender()
      },
      onShapeDragEnd: (shape) => {
        canvas.style.cursor = defaultCursor
        this.emit('shapeDragEnd', shape)
        this.engine.requestRender()
      },
      onClick: (canvasPoint, worldPoint) => {
        this.lastClickPosition = worldPoint
        this.emit('click', worldPoint)
      },
    })

    this.enableBasicInteraction(true)
    this.engine.start()
    this.engine.requestRender()
  }

  /** 启用或关闭内置基础交互（平移 + 滚轮缩放） */
  enableBasicInteraction(enabled: boolean) {
    if (enabled) {
      this.interaction.bindEvent()
    }
    else {
      this.interaction.rmEvent()
    }
  }

  /** 获取视口对象 */
  getViewport(): Viewport {
    return this.viewport
  }

  /** 获取场景对象 */
  getScene(): Scene {
    return this.scene
  }

  /** 添加形状 */
  add(shape: BaseShape): void {
    this.scene.add(shape)
    this.emit('shapeAdded', shape)
    this.engine.requestRender()
  }

  /** 根据 id 移除形状 */
  remove(id: string): void {
    this.scene.remove(id)
    this.emit('shapeRemoved', id)
    this.engine.requestRender()
  }

  /** 清空场景 */
  clear(): void {
    this.scene.clear()
    this.engine.requestRender()
  }

  /** 世界坐标到屏幕坐标 */
  worldToScreen(pt: Point): Point {
    return this.viewport.worldToScreen(pt)
  }

  /** 屏幕坐标到世界坐标 */
  screenToWorld(pt: Point): Point {
    return this.viewport.screenToWorld(pt)
  }

  /** 设置缩放（可指定世界坐标锚点） */
  setZoom(zoom: number, anchor?: Point): void {
    if (anchor)
      this.viewport.setZoom(zoom, anchor)
    else this.viewport.setZoom(zoom)
  }

  /** 平移视口 */
  panBy(dx: number, dy: number): void {
    this.viewport.panBy(dx, dy)
  }

  /**
   * 适配内容到可视区域
   * @param bounds 内容世界坐标包围盒
   * @param padding 内边距
   */
  fitToScreen(bounds?: BoundRect, padding = 16): void {
    const size = this.manager.getSize()
    if (!bounds)
      return
    const scaleX = (size.width - padding * 2) / bounds.width
    const scaleY = (size.height - padding * 2) / bounds.height
    const zoom = Math.max(0.01, Math.min(scaleX, scaleY))

    this.viewport.setZoom(zoom, {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    })

    this.viewport.setState({
      pan: {
        x: bounds.x + bounds.width / 2 - size.width / (2 * zoom),
        y: bounds.y + bounds.height / 2 - size.height / (2 * zoom),
      },
    })
  }

  /** 设置交互期连续重绘 */
  setContinuousRendering(enabled: boolean) {
    this.engine.setContinuousRendering(enabled)
  }

  /**
   * 设置光标模式
   */
  setCursorMode(mode: CursorMode) {
    this.interaction.setCursorMode(mode)

    /** 根据模式设置画布光标样式 */
    const canvas = this.manager.getCanvasElement()
    switch (mode) {
      case 'pan':
        canvas.style.cursor = 'default'
        break
      case 'draw':
        canvas.style.cursor = 'crosshair'
        break
      case 'rect':
      case 'circle':
      case 'arrow':
        canvas.style.cursor = 'crosshair'
        break
      default:
        canvas.style.cursor = 'default'
    }
  }

  /**
   * 获取当前光标模式
   */
  getCursorMode(): CursorMode {
    return this.interaction.getCursorMode()
  }

  /**
   * 设置绘制选项
   */
  setDrawOptions(options: DrawModeOptions) {
    this.interaction.setDrawOptions(options)
  }

  /** 导出图片（dataURL） */
  async exportAsImage(type: 'image/png' | 'image/jpeg' = 'image/png', quality?: number): Promise<string> {
    const el = this.manager.getCanvasElement()
    return el.toDataURL(type, quality)
  }

  /**
   * 获取最后点击的位置
   */
  getLastClickPosition(): Point | null {
    return this.lastClickPosition
  }

  /** 释放资源 */
  dispose(): void {
    this.off()
    this.engine.stop()
    this.manager.dispose()
    this.interaction?.dispose()
  }
}
