import type { BaseShape } from './BaseShape'
import type { ShapeStyle } from './type'
import { clearAllCvs } from '@/canvasTool'
import { DRAW_MAP } from '@/NoteBoard'
import { UnRedoLinkedList } from '@/utils'
import { Arrow } from './libs/Arrow'
import { Circle } from './libs/Circle'
import { Rect } from './libs/Rect'

const ShapeMap = {
  rect: Rect,
  circle: Circle,
  arrow: Arrow,
}

/**
 * 绘制图形与拖拽，支持
 * - 矩形
 * - 圆形
 * - 箭头
 */
export class DrawShape {
  disable = false

  /**
   * 当前绘制的图形类型
   */
  shapeType: ShapeType = 'rect'
  history = new UnRedoLinkedList<BaseShape[]>()

  /**
   * 当前拖动的矩形
   */
  curDragShape: BaseShape | null = null
  private shapeStyle: ShapeStyle = {}

  declare canvas: HTMLCanvasElement
  declare ctx: CanvasRenderingContext2D
  /** 是否在绘制 */
  isDrawing = false

  /**
   * 上次的坐标，用于拖动等
   */
  dragX = 0
  dragY = 0

  init(drawShapeOpts: DrawShapeOpts) {
    this.canvas = drawShapeOpts.canvas
    this.ctx = drawShapeOpts.context
    this.bindEvent()
  }

  drawShapes(needClear = true, shapes?: BaseShape[]) {
    needClear && clearAllCvs(this.ctx, this.canvas);
    (shapes || this.shapes).forEach(shape => shape.draw())
  }

  /**
   * 根据坐标获取图形
   */
  getShape(x: number, y: number) {
    const shapes = this.shapes
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i]
      if (shape.isInPath(x, y)) {
        return shape
      }
    }
  }

  /**
   * 设置图形样式
   */
  setShapeStyle(style: ShapeStyle) {
    Object.assign(this.shapeStyle, style)
  }

  /**
   * 撤销
   */
  undo(needClear = true): UnRedoReturn {
    const shapes = this.history.undo()
    if (shapes) {
      this.drawShapes(needClear)
    }
    else {
      this.drawShapes(true, [])
    }

    return { shape: this.lastShape, shapes: [...this.shapes] }
  }

  /**
   * 重做
   */
  redo(needClear = true): UnRedoReturn {
    const shapes = this.history.redo()
    if (shapes) {
      this.drawShapes(needClear)
    }
    return { shape: this.lastShape, shapes: [...this.shapes] }
  }

  get shapes() {
    return this.history.curValue || []
  }

  get lastShape() {
    const shapes = this.shapes
    return shapes[shapes.length - 1]
  }

  bindEvent() {
    this.canvas.addEventListener('mousedown', this.onMouseDown)
    this.canvas.addEventListener('mousemove', this.onMouseMove)
    this.canvas.addEventListener('mouseup', this.onMouseUp)
    this.canvas.addEventListener('mouseleave', this.onMouseLeave)
  }

  rmEvent() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown)
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave)
  }

  /***************************************************
   *                    private
   ***************************************************/

  private onMouseDown = (e: MouseEvent) => {
    if (this.disable)
      return
    this.isDrawing = true

    /**
     * 重画代表废弃撤销里的图形
     */
    this.history.cleanUnusedNodes((isCleanAll) => {
      isCleanAll && this.drawMap?.cleanShapeRecord()
    })

    const { offsetX, offsetY } = e
    const shape = this.getShape(offsetX, offsetY)

    /** 拖动 */
    if (shape) {
      this.dragX = offsetX
      this.dragY = offsetY
      this.curDragShape = shape

      /** 不记录矩形位移的历史记录 */
      const history = this.drawMap?.getHistory()
      if (!history)
        return
      history.undo()
      history.cleanUnusedNodes()

      return
    }

    const Cls = ShapeMap[this.shapeType]
    const dyShape = new Cls({
      startX: offsetX,
      startY: offsetY,
      ctx: this.ctx,
    })

    dyShape.setShapeStyle(this.shapeStyle)

    const lastRecord = (this.history.curValue || []) as BaseShape[]
    this.history.add([...lastRecord, dyShape])
  }

  private onMouseMove = (e: MouseEvent) => {
    /**
     * 鼠标是否在图形上检测
     */
    if (this.drawMap?.isShapeMode()) {
      const dragShape = this.getShape(e.offsetX, e.offsetY)
      dragShape
        ? this.drawMap?.setCursor('grab')
        : this.drawMap?.setCursor('crosshair')
    }

    if (!this.isDrawing)
      return

    const { curDragShape } = this
    /**
     * 拖动
     */
    if (curDragShape) {
      const { startX, startY, endX, endY } = curDragShape
      const disX = e.offsetX - this.dragX
      const disY = e.offsetY - this.dragY

      curDragShape.startX = startX + disX
      curDragShape.startY = startY + disY
      curDragShape.endX = endX + disX
      curDragShape.endY = endY + disY

      this.dragX = e.offsetX
      this.dragY = e.offsetY

      const drawFn = this.drawMap
      if (drawFn) {
        drawFn.draw()
      }
      else {
        this.drawShapes()
      }

      return
    }

    const shape = this.lastShape
    if (!shape)
      return

    shape.endX = e.offsetX
    shape.endY = e.offsetY
    // this.drawMap?.setCursor('crosshair')

    const drawMap = this.drawMap
    if (drawMap) {
      drawMap.draw()
    }
    else {
      this.drawShapes()
    }
  }

  private onMouseUp = (e: MouseEvent) => {
    this.isDrawing = false
    this.curDragShape = null
  }

  private onMouseLeave = (e: MouseEvent) => {
    this.isDrawing = false
    this.curDragShape = null
  }

  get drawMap() {
    return DRAW_MAP.get(this)
  }
}

export type ShapeType = keyof typeof ShapeMap

export type UnRedoReturn = {
  shape: BaseShape | null
  shapes: BaseShape[]
}

export type DrawShapeOpts = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}
