import type { Mode, RecordPath, NoteBoardOptions, DrawMapVal } from './type'
import { excludeKeys, UnRedoLinkedList } from '@/utils'
import { DrawShape } from '@/Shapes'
import { NoteBoardBase } from './NoteBoardBase'


/**
 * 统一绘图函数
 */
export const DRAW_MAP = new WeakMap<
  DrawShape,
  DrawMapVal
>()

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
export class NoteBoard extends NoteBoardBase {

  mode: Mode = 'draw'
  drawShape: DrawShape

  /**
   * 历史记录
   */
  history = new UnRedoLinkedList<RecordPath[]>()

  constructor(opts: NoteBoardOptions) {
    super(opts)

    this.drawShape = new DrawShape()
    this.drawShape.init({
      canvas: this.canvas,
      context: this.ctx,
    })
    
    this.initDrawMap()
    this.bindEvent()
    this.setMode(this.mode)
  }

  /**
   * 设置绘制模式
   */
  setMode(mode: Mode) {
    const { drawShape } = this
    this.mode = mode
    drawShape.drawShapeDiable = true
    this.ctx.globalCompositeOperation = this.opts.globalCompositeOperation

    switch (mode) {
      case 'draw':
        this.setCursor()
        break

      case 'erase':
        this.setCursor()
        this.ctx.globalCompositeOperation = 'destination-out'
        break

      case 'none':
        this.canvas.style.cursor = 'unset'
        break

      case 'drag':
        this.canvas.style.cursor = 'grab'
        break

      case 'rect':
        drawShape.shapeType = 'rect'
        drawShape.drawShapeDiable = false
        this.canvas.style.cursor = 'crosshair'
        break

      case 'circle':
        drawShape.shapeType = 'circle'
        drawShape.drawShapeDiable = false
        this.canvas.style.cursor = 'crosshair'
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
      // 清理图形里不要的记录
      this.drawShape.drawShapeUndo()

      return
    }

    const drawFn = this.drawShape.drawMap?.unRedo
    if (!drawFn) return
    const data = drawFn({ type: 'undo' })

    this.opts.onUndo?.({
      mode: this.mode,
      ...data,
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

    const drawFn = this.drawShape.drawMap?.unRedo
    if (!drawFn) return

    const data = drawFn({ type: 'redo' })
    this.opts.onRedo?.({
      mode: this.mode,
      ...data,
    })
  }

  /** 
   * 移除所有事件
   */
  rmEvent() {
    this.drawShape.drawShapeRmEvent()
    const { canvas } = this

    canvas.removeEventListener('mousedown', this.onMousedown)
    canvas.removeEventListener('mousemove', this.onMousemove)
    canvas.removeEventListener('mouseup', this.onMouseup)
    canvas.removeEventListener('mouseleave', this.onMouseLeave)
    canvas.removeEventListener('wheel', this.onWheel)
  }

  /***************************************************
   *                    Private
   ***************************************************/

  /**
   * 能否添加记录
   */
  private get canAddRecord() {
    return this.canDraw || this.isShapeMode()
  }

  /**
   * 是图形模式
   */
  private isShapeMode(mode?: Mode) {
    return ['rect', 'circle'].includes(mode ?? this.mode)
  }

  bindEvent() {
    const { canvas } = this

    canvas.addEventListener('mousedown', this.onMousedown)
    canvas.addEventListener('mousemove', this.onMousemove)
    canvas.addEventListener('mouseup', this.onMouseup)
    canvas.addEventListener('mouseleave', this.onMouseLeave)
    canvas.addEventListener('wheel', this.onWheel)
  }

  onMousedown = (e: MouseEvent) => {
    this.opts.onMouseDown?.(e)

    // 拖拽模式
    if (this.mode === 'drag') {
      this.isDragging = true
      this.dragStart = { x: e.offsetX, y: e.offsetY }
      return
    }

    /**
     * 添加记录
     */
    if (this.canAddRecord) {
      this.history.cleanUnusedNodes()
      this.addHistory()
      this.drawShape.drawMap?.syncShapeRecord()
    }

    if (!this.canDraw) return

    // 画笔模式
    this.isDrawing = true
    this.ctx.beginPath()

    this.drawStart = {
      x: e.offsetX,
      y: e.offsetY,
    }
  }

  onMousemove = (e: MouseEvent) => {
    this.opts.onMouseMove?.(e)

    /**
     * 拖拽
     */
    if (this.isDragging) {
      const dx = e.offsetX - this.dragStart.x
      const dy = e.offsetY - this.dragStart.y

      this.translateX = this.translateX + dx
      this.translateY = this.translateY + dy

      this.setTransform()
      this.opts.onDrag?.({
        translateX: this.translateX,
        translateY: this.translateY,
        transformOriginX: this.dragStart.x,
        transformOriginY: this.dragStart.y,
        e
      })

      return
    }

    /**
     * 画笔
     */
    if (!this.canDraw || !this.isDrawing) return

    const { offsetX, offsetY } = e
    const { ctx, drawStart } = this
    const lastRecord = this.history.curValue

    ctx.moveTo(drawStart.x, drawStart.y)
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()

    this.drawStart = {
      x: offsetX,
      y: offsetY,
    }

    if (!lastRecord) return
    lastRecord[lastRecord.length - 1].path.push({
      moveTo: [drawStart.x, drawStart.y],
      lineTo: [offsetX, offsetY]
    })
  }

  onMouseup = (e: MouseEvent) => {
    this.opts.onMouseUp?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
      this.translateX += e.offsetX - this.dragStart.x
      this.translateY += e.offsetY - this.dragStart.y
      return
    }

    if (!this.canDraw) return
    this.isDrawing = false
  }

  onMouseLeave = (e: MouseEvent) => {
    this.opts.onMouseLeave?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
      return
    }

    if (!this.canDraw) return
    this.isDrawing = false
  }

  onWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (!this.isEnableZoom) return

    this.mousePoint = {
      x: e.offsetX,
      y: e.offsetY
    }

    this.scale = e.deltaY > 0
      ? this.scale / 1.1
      : this.scale * 1.1

    this.scale = Math.min(Math.max(this.scale, this.opts.minScale), this.opts.maxScale)
    this.setTransform()

    this.opts.onWheel?.({
      scale: this.scale,
      e
    })
  }

  private addHistory() {
    const lastRecord = this.history.curValue
    this.history.add([
      ...(lastRecord || []),
      {
        canvasAttrs: excludeKeys(
          { ...this.opts },
          [
            'el',
            'minScale', 'maxScale',
            'onMouseDown', 'onMouseMove',
            'onMouseUp', 'onMouseLeave',
            'onWheel', 'onDrag',
            'onRedo', 'onUndo',
            'height', 'width',
          ]
        ),
        path: [],
        shapes: [],
        mode: this.mode,
      }
    ])
  }

  /**
   * 绘制笔画
   */
  private drawRecord() {
    const lastRecord = this.history.curValue
    if (!lastRecord) return
    const { ctx } = this
    const currentMode = this.mode

    for (const item of lastRecord) {
      this.setStyle(item.canvasAttrs, this.ctx)
      this.setMode(item.mode)
      ctx.beginPath()

      for (const point of item.path) {
        ctx.moveTo(...point.moveTo)
        ctx.lineTo(...point.lineTo)
        ctx.stroke()
      }
    }

    this.setMode(currentMode)
  }

  private initDrawMap() {
    const draw = () => {
      this.clear(false)

      /**
       * 绘制图形
       */
      const lastRecord = this.history.curValue
      if (lastRecord) {
        this.ctx.globalCompositeOperation = this.opts.globalCompositeOperation
        lastRecord[lastRecord.length - 1].shapes.forEach(shape => {
          shape.draw()
        })
      }

      this.drawRecord()
    }

    const syncShapeRecord = () => {
      /**
       * 确保有记录后执行
       */
      setTimeout(() => {
        const lastRecord = this.history.curValue
        if (lastRecord?.[lastRecord!.length - 1]?.shapes) {
          lastRecord[lastRecord!.length - 1].shapes = [...this.drawShape.shapes]
        }
      })
    }

    const cleanShapeRecord = () => {
      const lastRecord = this.history.curValue
      lastRecord?.[lastRecord!.length - 1]?.shapes?.splice(0)
    }

    DRAW_MAP.set(this.drawShape, {
      draw,
      syncShapeRecord,
      cleanShapeRecord,

      getHistory: () => this.history,

      unRedo: ({ type }) => {
        const fnMap = {
          undo: 'drawShapeUndo' as const,
          redo: 'drawShapeRedo' as const,
        }

        const lastRecord = this.history.curNode?.next?.value
        if (this.isShapeMode(lastRecord?.[lastRecord.length - 1].mode)) {
          this.drawShape[fnMap[type]](false)
        }

        draw()
        syncShapeRecord()

        return {
          shape: this.drawShape.lastShape,
          shapes: this.drawShape.shapes,
        }
      },
    })
  }
}
