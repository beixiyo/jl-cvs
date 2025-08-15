import type { DisposeOpts, Mode, NoteBoardEvent, NoteBoardOptions, RecordPath } from './type'
import type { BaseShape } from '@/Shapes/BaseShape'
import { DrawShape } from '@/Shapes'
import { Brush } from '@/Shapes/libs/Brush'
import { excludeKeys, UnRedoLinkedList } from '@/utils'
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
  private rightMouseDragging = false

  /**
   * 统一的历史记录 - 包含笔刷和图形
   */
  history = new UnRedoLinkedList<RecordPath[]>()

  /**
   * 当前正在绘制的笔刷（用于 draw/erase 模式）
   */
  private currentBrush: Brush | null = null

  constructor(opts: NoteBoardOptions) {
    super(opts)

    this.drawShape = new DrawShape()
    this.drawShape.init({
      canvas: this.canvas,
      context: this.ctx,
    })

    this.setupDrawShapeCallbacks()
    this.bindEvent()
    this.setMode(this.mode)
  }

  /**
   * 设置绘制模式
   */
  setMode(mode: Mode) {
    const { drawShape } = this
    this.mode = mode
    this.ctx.globalCompositeOperation = this.noteBoardOpts.globalCompositeOperation
    this.setCursorForCurrentMode()

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
    this.redrawAll()

    this.emit('undo', {
      mode: this.mode,
      shapes: this.getAllShapes(),
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
    this.redrawAll()

    this.emit('redo', {
      mode: this.mode,
      shapes: this.getAllShapes(),
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

  /**
   * 获取当前所有图形（包括笔刷）
   */
  private getAllShapes(): BaseShape[] {
    const lastRecord = this.history.curValue
    if (!lastRecord || lastRecord.length === 0) {
      return []
    }
    return lastRecord[lastRecord.length - 1].shapes
  }

  /**
   * 重绘所有内容
   */
  private redrawAll() {
    this.clear(false)

    const lastRecord = this.history.curValue
    if (!lastRecord) {
      return
    }

    /** 按记录顺序绘制所有内容 */
    for (const record of lastRecord) {
      /** 设置绘制样式 */
      this.setStyle(record.canvasAttrs, this.ctx)

      /** 设置混合模式 */
      if (record.mode === 'erase') {
        this.ctx.globalCompositeOperation = 'destination-out'
      }
      else if (this.isShapeMode(record.mode)) {
        this.ctx.globalCompositeOperation = this.noteBoardOpts.shapeGlobalCompositeOperation
      }
      else {
        this.ctx.globalCompositeOperation = this.noteBoardOpts.drawGlobalCompositeOperation
      }

      /** 绘制所有图形 */
      for (const shape of record.shapes) {
        shape.draw(this.ctx)
      }
    }

    /** 恢复当前模式的样式 */
    this.setMode(this.mode)
  }

  /**
   * 设置 DrawShape 的回调函数
   */
  private setupDrawShapeCallbacks() {
    /** 当 DrawShape 创建新图形时的回调 */
    this.drawShape.on('shapeCreated', (shape: BaseShape) => {
      this.addShapesToHistory([shape])
    })

    /** 当 DrawShape 更新图形时的回调 */
    this.drawShape.on('shapeUpdated', () => {
      this.redrawAll()
    })

    /** 当 DrawShape 需要设置光标时的回调 */
    this.drawShape.on('cursorChange', (cursor: string) => {
      /** 如果正在进行拖拽（右键拖拽或拖拽模式），不更新光标样式 */
      if (this.rightMouseDragging || (this.mode === 'drag' && this.isDragging)) {
        return
      }
      this.canvas.style.cursor = cursor
    })

    /** 当 DrawShape 开始拖拽图形时的回调 */
    this.drawShape.on('shapeDragStart', (shape: BaseShape) => {
      /** 拖拽时需要撤销上一步操作，因为拖拽不应该创建新的历史记录 */
      this.history.undo()
      this.history.cleanUnusedNodes()
    })

    /** 当 DrawShape 结束拖拽时的回调 */
    this.drawShape.on('shapeDragEnd', () => {
      /** 拖拽结束后添加新的历史记录 */
      const shapes = this.getAllShapes()
      if (shapes.length > 0) {
        this.addShapesToHistory(shapes)
      }
    })
  }

  /**
   * 添加多个图形到历史记录（用于拖拽结束后）
   */
  private addShapesToHistory(shapes: BaseShape[]) {
    const lastRecord = this.history.curValue
    this.history.add([
      ...(lastRecord || []),
      {
        canvasAttrs: excludeKeys(
          { ...this.noteBoardOpts },
          [
            'el',
            'minScale',
            'maxScale',
            'height',
            'width',
          ],
        ),
        shapes: [...shapes], // 复制所有当前图形
        mode: this.mode,
      },
    ])
  }

  bindEvent() {
    const { canvas } = this

    canvas.addEventListener('mousedown', this.onMousedown)
    canvas.addEventListener('mousemove', this.onMousemove)
    canvas.addEventListener('mouseup', this.onMouseup)
    canvas.addEventListener('mouseleave', this.onMouseLeave)
    canvas.addEventListener('wheel', this.onWheel)
    canvas.addEventListener('contextmenu', this.onContextMenu)
  }

  /**
   * 移除所有事件
   */
  rmEvent() {
    const { canvas } = this

    canvas.removeEventListener('mousedown', this.onMousedown)
    canvas.removeEventListener('mousemove', this.onMousemove)
    canvas.removeEventListener('mouseup', this.onMouseup)
    canvas.removeEventListener('mouseleave', this.onMouseLeave)
    canvas.removeEventListener('wheel', this.onWheel)
    canvas.removeEventListener('contextmenu', this.onContextMenu)
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

  /***************************************************
   *                    Private
   ***************************************************/

  /**
   * 是图形模式
   */
  private isShapeMode(mode?: Mode) {
    return ['rect', 'circle', 'arrow'].includes(mode ?? this.mode)
  }

  /**
   * 是笔刷模式（draw/erase）
   */
  private isBrushMode(mode?: Mode) {
    return ['draw', 'erase'].includes(mode ?? this.mode)
  }

  /**
   * 恢复当前模式的光标样式
   */
  private setCursorForCurrentMode() {
    switch (this.mode) {
      case 'draw':
      case 'erase':
        this.setCursor()
        break

      case 'none':
        this.canvas.style.cursor = 'unset'
        break
      case 'drag':
        this.canvas.style.cursor = 'grab'
        break

      case 'rect':
      case 'circle':
      case 'arrow':
        this.canvas.style.cursor = 'crosshair'
        break
      default:
        this.canvas.style.cursor = 'default'
        break
    }
  }

  onMousedown = (e: MouseEvent) => {
    this.emit('mouseDown', e)
    this.setCursorForCurrentMode()

    /** 拖拽模式 */
    if (this.mode === 'drag') {
      this.isDragging = true
      this.dragStart = { x: e.offsetX, y: e.offsetY }
      return
    }

    /** 右键拖拽判断 */
    if (e.button === 2 && this.noteBoardOpts.enableRightDrag !== false) {
      e.preventDefault()
      this.isDragging = true
      this.rightMouseDragging = true
      this.dragStart = { x: e.offsetX, y: e.offsetY }
      this.canvas.style.cursor = 'grabbing'
      return
    }

    /** 笔刷模式 */
    if (this.isBrushMode()) {
      this.isDrawing = true

      /** 创建新的笔刷 */
      this.currentBrush = new Brush({
        startX: e.offsetX,
        startY: e.offsetY,
        ctx: this.ctx,
        shapeStyle: {
          strokeStyle: this.noteBoardOpts.strokeStyle,
          lineWidth: this.noteBoardOpts.lineWidth,
        },
      })

      this.drawStart = {
        x: e.offsetX,
        y: e.offsetY,
      }
      return
    }

    /** 图形模式由 DrawShape 处理 */
    if (this.isShapeMode()) {
      this.drawShape.handleMouseDown(e)
      return
    }
  }

  onMousemove = (e: MouseEvent) => {
    this.emit('mouseMove', e)

    /**
     * 拖拽
     */
    if (this.isDragging) {
      const dx = e.offsetX - this.dragStart.x
      const dy = e.offsetY - this.dragStart.y

      this.translateX = this.translateX + dx
      this.translateY = this.translateY + dy

      this.setTransform()
      this.emit('dragging', {
        translateX: this.translateX,
        translateY: this.translateY,
        transformOriginX: this.dragStart.x,
        transformOriginY: this.dragStart.y,
        e,
      })

      return
    }

    /**
     * 笔刷绘制
     */
    if (this.isBrushMode() && this.isDrawing && this.currentBrush) {
      const { offsetX, offsetY } = e

      /** 直接绘制从上一个点到当前点的线段 */
      this.drawCurrentSegment(this.drawStart.x, this.drawStart.y, offsetX, offsetY)

      /** 添加点到当前笔刷 */
      this.currentBrush.addPoint(offsetX, offsetY)

      this.drawStart = {
        x: offsetX,
        y: offsetY,
      }
      return
    }

    /** 图形模式的鼠标移动处理 */
    if (this.isShapeMode()) {
      this.drawShape.handleMouseMove(e)
      return
    }
  }

  onMouseup = (e: MouseEvent) => {
    this.emit('mouseUp', e)
    this.setCursorForCurrentMode()

    /** 右键拖拽结束 */
    if (this.rightMouseDragging) {
      this.isDragging = false
      this.rightMouseDragging = false
      this.translateX += e.offsetX - this.dragStart.x
      this.translateY += e.offsetY - this.dragStart.y
      return
    }

    if (this.mode === 'drag') {
      this.isDragging = false
      this.translateX += e.offsetX - this.dragStart.x
      this.translateY += e.offsetY - this.dragStart.y
      return
    }

    /** 笔刷绘制结束 */
    if (this.isBrushMode()) {
      this.isDrawing = false

      /** 在绘制结束时添加到历史记录 */
      if (this.currentBrush) {
        this.addShapesToHistory([this.currentBrush])
        this.currentBrush = null
      }
      return
    }

    /** 图形模式的鼠标抬起处理 */
    if (this.isShapeMode()) {
      this.drawShape.handleMouseUp(e)
      return
    }
  }

  onMouseLeave = (e: MouseEvent) => {
    this.emit('mouseLeave', e)
    this.setCursorForCurrentMode()

    if (this.rightMouseDragging) {
      this.isDragging = false
      this.rightMouseDragging = false
      return
    }

    if (this.mode === 'drag') {
      this.isDragging = false
      return
    }

    /** 笔刷绘制结束 */
    if (this.isBrushMode()) {
      this.isDrawing = false

      /** 在绘制结束时添加到历史记录 */
      if (this.currentBrush) {
        this.addShapesToHistory([this.currentBrush])
        this.currentBrush = null
      }
      return
    }

    /** 图形模式的鼠标离开处理 */
    if (this.isShapeMode()) {
      this.drawShape.handleMouseLeave(e)
      return
    }
  }

  onContextMenu = (e: MouseEvent) => {
    this.emit('contextMenu', e)
    if (this.noteBoardOpts.enableRightDrag !== false)
      e.preventDefault()
  }

  onWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (!this.isEnableZoom)
      return

    this.mousePoint = {
      x: e.offsetX,
      y: e.offsetY,
    }

    this.scale = e.deltaY > 0
      ? this.scale / 1.1
      : this.scale * 1.1

    this.scale = Math.min(Math.max(this.scale, this.noteBoardOpts.minScale), this.noteBoardOpts.maxScale)
    this.setTransform()

    this.emit('wheel', {
      scale: this.scale,
      e,
    })
  }

  /**
   * 添加一个形状到画板
   * @param shape - 要添加的形状实例
   */
  addShape(shape: BaseShape) {
    /** 设置画布上下文 */
    shape.ctx = this.ctx

    /** 添加到历史记录 */
    this.addShapesToHistory([shape])

    /** 重绘画板以显示新形状 */
    this.redrawAll()

    /** 触发事件 */
    this.emit('shapeAdded', {
      shape,
      mode: this.mode,
    })
  }

  /**
   * 绘制当前线段（实时绘制优化）
   */
  private drawCurrentSegment(fromX: number, fromY: number, toX: number, toY: number) {
    /** 设置当前笔刷的样式 */
    this.ctx.strokeStyle = this.noteBoardOpts.strokeStyle
    this.ctx.lineWidth = this.noteBoardOpts.lineWidth
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    /** 设置当前模式的混合模式 */
    if (this.mode === 'erase') {
      this.ctx.globalCompositeOperation = 'destination-out'
    }
    else {
      this.ctx.globalCompositeOperation = this.noteBoardOpts.drawGlobalCompositeOperation
    }

    /** 绘制线段 */
    this.ctx.beginPath()
    this.ctx.moveTo(fromX, fromY)
    this.ctx.lineTo(toX, toY)
    this.ctx.stroke()
  }
}
