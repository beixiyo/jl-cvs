import type {
  DisposeOpts,
  NoteBoardEvent,
  NoteBoardMode,
  NoteBoardOptions,
  Point,
  RecordPath,
} from './type'
import type { BaseShape } from '@/Shapes/libs/BaseShape'
import { type Brush, DrawShape, ImageShape } from '@/Shapes'
import { UnRedoLinkedList } from '@/utils'
import { NoteBoardEvents } from './core/NoteBoardEvents'
import { NoteBoardInteraction } from './core/NoteBoardInteraction'
import { NoteBoardRenderer } from './core/NoteBoardRenderer'
import { Viewport } from './core/Viewport'
import { NoteBoardBase } from './NoteBoardBase'

/**
 * 无限画布，提供如下功能
 * - 笔刷涂抹（支持橡皮擦）
 * - 绘制矩形、圆形、箭头
 * - 分层自适应绘图
 *
 * - 擦除（仅针对 brushCanvas 画板）
 * - 撤销（仅针对 brushCanvas 画板）
 * - 重做（仅针对 brushCanvas 画板）
 *
 * - 缩放
 * - 拖拽
 * - 截图
 */
export class NoteBoard extends NoteBoardBase<NoteBoardEvent> {
  mode: NoteBoardMode = 'brush'
  /** 绘制形状管理器 */
  drawShape: DrawShape

  /** 右键拖拽状态 */
  rightMouseDragging = false

  /** 统一的历史记录 - 包含笔刷和图形 */
  history = new UnRedoLinkedList<RecordPath[]>()

  /** 当前正在绘制的笔刷（用于 draw/erase 模式） */
  currentBrush: Brush | null = null

  /** 事件管理器 */
  readonly events: NoteBoardEvents = new NoteBoardEvents(this)
  /** 渲染器 */
  readonly renderer: NoteBoardRenderer = new NoteBoardRenderer(this)
  /** 交互管理器 */
  readonly interaction: NoteBoardInteraction = new NoteBoardInteraction(this)
  /** 无限画布视口管理器 */
  readonly viewport: Viewport

  constructor(opts: NoteBoardOptions) {
    super(opts)

    this.drawShape = new DrawShape()
    this.drawShape.init({
      canvas: this.canvas,
      context: this.ctx,
    })

    this.interaction.setupDrawShapeEvents()
    this.events.bindEvent()
    this.setMode(this.mode)

    this.viewport = new Viewport({
      pan: { x: 0, y: 0 },
      zoom: 1,
      minZoom: opts.minScale || 0.1,
      maxZoom: opts.maxScale || 10,
      onViewportChange: () => {
        this.renderer.redrawAll()
        if (this.interaction.isBrushMode()) {
          this.setCursor()
        }
      },
    })
  }

  /**
   * 设置绘制模式
   */
  setMode(mode: NoteBoardMode) {
    const { drawShape } = this
    this.mode = mode
    this.ctx.globalCompositeOperation = this.noteBoardOpts.globalCompositeOperation
    this.renderer.setCursorForCurrentMode()

    switch (mode) {
      case 'brush':
        this.ctx.globalCompositeOperation = this.noteBoardOpts.drawGlobalCompositeOperation
        break

      case 'erase':
        this.ctx.globalCompositeOperation = 'destination-out'
        break

      case 'rect':
        drawShape.shapeType = 'rect'
        this.ctx.globalCompositeOperation = this.noteBoardOpts.shapeGlobalCompositeOperation
        break

      case 'circle':
        drawShape.shapeType = 'circle'
        this.ctx.globalCompositeOperation = this.noteBoardOpts.shapeGlobalCompositeOperation
        break

      case 'arrow':
        drawShape.shapeType = 'arrow'
        this.ctx.globalCompositeOperation = this.noteBoardOpts.shapeGlobalCompositeOperation
        break

      default:
        break
    }

    if (this.interaction.isBrushMode()) {
      this.setCursor()
    }
  }

  /**
   * 撤销
   */
  undo() {
    const recordPath = this.history.undo()
    if (!recordPath?.value) {
      this.clear(false)
      this.emit('undo', {
        mode: this.mode,
        shapes: [],
      })
      return
    }

    /** 重绘所有内容 */
    this.renderer.redrawAll()

    this.emit('undo', {
      mode: this.mode,
      shapes: this.interaction.getAllShapes(),
    })
  }

  /**
   * 重做
   */
  redo() {
    const recordPath = this.history.redo()
    if (!recordPath?.value) {
      return
    }

    /** 重绘所有内容 */
    this.renderer.redrawAll()

    this.emit('redo', {
      mode: this.mode,
      shapes: this.interaction.getAllShapes(),
    })
  }

  /**
   * 是否可以执行撤销
   */
  canUndo(): boolean {
    return this.history.canUndo
  }

  /**
   * 是否可以执行重做
   */
  canRedo(): boolean {
    return this.history.canRedo
  }

  rmEvent(): void {
    this.events.rmEvent()
  }

  bindEvent(): void {
    this.events.bindEvent()
  }

  /**
   * 清理并释放所有资源
   */
  override dispose(opts: DisposeOpts = {}) {
    super.dispose(opts)
    /** 清理历史记录 */
    this.history.cleanAll()
    this.events.rmEvent()
    this.currentBrush = null
  }

  /**
   * 重置画布变换状态
   */
  async resetSize(): Promise<void> {
    /** 重置所有画布的变换矩阵 */
    this.canvasList.forEach((item) => {
      this.viewport.resetTransform(item.ctx, this.dpr)
    })
    this.setPan({ x: 0, y: 0 })
    this.setZoom(1)
  }

  /**
   * 添加一个形状到画板
   * @param shape - 要添加的形状实例
   */
  addShape(shape: BaseShape) {
    /** 设置画布上下文 */
    if (!shape.ctx) {
      shape.ctx = this.ctx
    }

    /** 如果是 ImageShape，需要特殊处理 */
    if (shape.name === 'imageShape' && shape instanceof ImageShape) {
      /** 如果图片还没有开始加载，启动加载 */
      if (!shape.loadPromise) {
        shape.load()
      }
    }

    /** 添加到历史记录 */
    this.interaction.addShapesToHistory([shape], shape.name)

    /** 重绘画板以显示新形状 */
    this.renderer.redrawAll()

    /** 触发事件 */
    this.emit('shapeAdded', {
      shape,
      mode: shape.name ?? this.mode,
    })
  }

  /**
   * 屏幕坐标转世界坐标
   * @param screenPoint 屏幕坐标点
   * @returns 世界坐标点
   */
  screenToWorld(screenPoint: Point): Point {
    return this.viewport.screenToWorld(screenPoint)
  }

  /**
   * 世界坐标转屏幕坐标
   * @param worldPoint 世界坐标点
   * @returns 屏幕坐标点
   */
  worldToScreen(worldPoint: Point): Point {
    return this.viewport.worldToScreen(worldPoint)
  }

  /**
   * 获取视口状态
   */
  getViewportState() {
    return this.viewport.getState()
  }

  /**
   * 设置视口状态
   * @param state 新的视口状态
   */
  setViewportState(state: Partial<{ pan: Point, zoom: number }>) {
    this.viewport.setState(state)
  }

  /**
   * 设置缩放级别（支持锚点缩放）
   * @param zoom 新的缩放级别
   * @param anchorScreenPoint 可选的屏幕坐标锚点
   */
  setZoom(zoom: number, anchorScreenPoint?: Point) {
    let anchorWorldPoint: Point | undefined
    if (anchorScreenPoint) {
      /** 将屏幕坐标锚点转换为世界坐标 */
      anchorWorldPoint = this.viewport.screenToWorld(anchorScreenPoint)
    }

    this.viewport.setZoom(zoom, anchorWorldPoint)
  }

  /**
   * 设置平移偏移
   * @param pan 新的平移偏移
   */
  setPan(pan: Point) {
    this.viewport.setPan(pan)
  }

  /**
   * 增量平移
   * @param delta 平移增量
   */
  addPan(delta: Point) {
    this.viewport.addPan(delta)
  }

  /**
   * 获取可见的世界坐标区域
   */
  getVisibleWorldRect() {
    return this.viewport.getVisibleWorldRect({
      width: this.canvas.width / this.dpr,
      height: this.canvas.height / this.dpr,
    })
  }

  /**
   * 获取缩放范围
   */
  getZoomRange() {
    return this.viewport.getZoomRange()
  }

  /**
   * 重写 setCursor 方法以支持缩放同步
   * 在无限画布模式下，笔刷光标大小会根据当前缩放级别自动调整
   */
  override setCursor(lineWidth?: number, strokeStyle?: string) {
    if (!this.viewport) {
      return
    }

    /** 在无限画布模式下，根据缩放级别调整光标大小 */
    const currentZoom = this.viewport.getState().zoom
    const actualLineWidth = lineWidth || this.noteBoardOpts.lineWidth
    const actualStrokeStyle = strokeStyle || this.noteBoardOpts.strokeStyle

    /** 将世界坐标的线宽转换为屏幕坐标的光标大小 */
    const scaledCursorSize = actualLineWidth * currentZoom

    /** 调用父类方法，但使用缩放后的大小 */
    return super.setCursor(scaledCursorSize, actualStrokeStyle)
  }
}
