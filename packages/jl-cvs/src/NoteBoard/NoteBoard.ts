import type { DisposeOpts, Mode, NoteBoardEvent, NoteBoardOptions, RecordPath } from './type'
import type { BaseShape } from '@/Shapes/libs/BaseShape'
import { type Brush, DrawShape } from '@/Shapes'
import { UnRedoLinkedList } from '@/utils'
import { NoteBoardEvents } from './core/NoteBoardEvents'
import { NoteBoardInteraction } from './core/NoteBoardInteraction'
import { NoteBoardRenderer } from './core/NoteBoardRenderer'
import { NoteBoardBase } from './NoteBoardBase'

/**
 * 画板，提供如下功能
 * - 签名涂抹
 * - 绘制矩形
 * - 绘制圆形
 *
 * - 分层自适应绘图
 *
 * - 擦除（仅针对 brushCanvas 画板）
 * - 撤销（仅针对 brushCanvas 画板）
 * - 重做（仅针对 brushCanvas 画板）
 *
 * - 缩放
 * - 拖拽
 *
 * - 截图
 */
export class NoteBoard extends NoteBoardBase<NoteBoardEvent> {
  mode: Mode = 'draw'
  drawShape: DrawShape

  /**
   * 右键拖拽状态
   */
  rightMouseDragging = false

  /**
   * 统一的历史记录 - 包含笔刷和图形
   */
  history = new UnRedoLinkedList<RecordPath[]>()

  /**
   * 当前正在绘制的笔刷（用于 draw/erase 模式）
   */
  currentBrush: Brush | null = null

  /** 模块化组件 */
  events: NoteBoardEvents
  renderer: NoteBoardRenderer
  interaction: NoteBoardInteraction

  constructor(opts: NoteBoardOptions) {
    super(opts)

    this.drawShape = new DrawShape()
    this.drawShape.init({
      canvas: this.canvas,
      context: this.ctx,
    })

    // ======================
    // * 初始化模块
    // ======================
    this.events = new NoteBoardEvents(this)
    this.renderer = new NoteBoardRenderer(this)
    this.interaction = new NoteBoardInteraction(this)

    this.interaction.setupDrawShapeEvents()
    this.events.bindEvent()
    this.setMode(this.mode)
  }

  /**
   * 设置绘制模式
   */
  setMode(mode: Mode) {
    const { drawShape } = this
    this.mode = mode
    this.ctx.globalCompositeOperation = this.noteBoardOpts.globalCompositeOperation
    this.renderer.setCursorForCurrentMode()

    switch (mode) {
      case 'draw':
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
  dispose(opts: DisposeOpts = {}) {
    super.dispose(opts)
    /** 清理历史记录 */
    this.history.cleanAll()
    this.currentBrush = null
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
}
