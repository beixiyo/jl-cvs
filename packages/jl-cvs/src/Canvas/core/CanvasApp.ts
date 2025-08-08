import type { CanvasAppOptions, Point } from '../utils/types'
import type { BaseShape } from '@/Shapes/BaseShape'
import type { Rect } from '@/Shapes/type'
import { InteractionManager } from '../interaction/InteractionManager'
import { EventEmitter } from '../utils/EventEmitter'
import { CanvasManager } from './CanvasManager'
import { RenderEngine } from './RenderEngine'
import { Scene } from './Scene'
import { Viewport } from './Viewport'

/** 应用事件映射 */
export interface CanvasAppEventMap {
  /** 视口变化 */
  viewportchange: ReturnType<Viewport['getState']>
  /** 画布尺寸或 dpr 变化 */
  resize: { width: number, height: number, dpr: number }
  /** 形状新增 */
  shapeadded: BaseShape
  /** 形状移除 */
  shaperemoved: string
}

/**
 * 画布应用（门面）
 * - 负责聚合管理器、视口、场景与渲染引擎，提供对外 API
 */
export class CanvasApp extends EventEmitter<CanvasAppEventMap> {
  private readonly manager: CanvasManager
  private readonly viewport: Viewport
  private readonly scene: Scene
  private readonly engine: RenderEngine
  private interaction?: InteractionManager

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
      container: opts.container,
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
        this.emit('viewportchange', state)
        this.engine.requestRender()
      },
    })

    this.scene = new Scene()

    this.engine = new RenderEngine(this.manager, this.viewport, this.scene, {
      background: opts.background,
      useBuffer: false,
    })

    /** 默认启用基础交互（平移 + 滚轮缩放） */
    this.enableBasicInteraction(true)

    this.engine.start()
    this.engine.requestRender()
  }

  /** 启用或关闭内置基础交互（平移 + 滚轮缩放） */
  enableBasicInteraction(enabled: boolean) {
    const el = this.manager.getCanvasElement()
    if (enabled) {
      if (!this.interaction) {
        this.interaction = new InteractionManager(el, this.viewport, { enablePan: true, enableWheelZoom: true })
        this.interaction.attach()
      }
    }
    else {
      this.interaction?.detach()
      this.interaction = undefined
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
    this.emit('shapeadded', shape)
    this.engine.requestRender()
  }

  /** 根据 id 移除形状 */
  remove(id: string): void {
    this.scene.remove(id)
    this.emit('shaperemoved', id)
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
  fitToScreen(bounds?: Rect, padding = 16): void {
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

  /** 导出图片（dataURL） */
  async exportAsImage(type: 'image/png' | 'image/jpeg' = 'image/png', quality?: number): Promise<string> {
    const el = this.manager.getCanvasElement()
    return el.toDataURL(type, quality)
  }

  /** 释放资源 */
  dispose(): void {
    this.engine.stop()
    this.clearAll()
    this.manager.dispose()
  }
}
