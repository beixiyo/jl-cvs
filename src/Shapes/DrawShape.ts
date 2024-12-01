import { clearAllCvs } from '@/canvasTool'
import { Rect } from './libs/Rect'
import type { ShapeStyle } from './type'
import type { BaseShape } from './BaseShape'
import { DRAW_MAP } from '@/NoteBoard'
import { UnRedoLinkedList } from '@/utils'
import { Circle } from './libs/Circle'


const ShapeMap = {
  rect: Rect,
  circle: Circle
}

/**
 * 绘制图形与拖拽，目前支持
 * - 矩形
 */
export class DrawShape {

  drawShapeDiable = false

  /**
   * 当前绘制的图形类型
   */
  shapeType: ShapeType = 'rect'
  shapeHistory = new UnRedoLinkedList<BaseShape[]>()

  /**
   * 当前拖动的矩形
   */
  curDragShape: BaseShape | null = null
  private shapeStyle: ShapeStyle = {}

  declare drawShapeCanvas: HTMLCanvasElement
  declare drawShapeContext: CanvasRenderingContext2D
  /** 是否在绘制 */
  drawShapeIsDrawing = false

  /**
   * 上次的坐标，用于拖动等
   */
  drawShapeDragX = 0
  drawShapeDragY = 0

  initial(drawShapeOpts: DrawShapeOpts) {
    this.drawShapeCanvas = drawShapeOpts.canvas
    this.drawShapeContext = drawShapeOpts.context
    this.drawShapeBindEvent()
  }

  drawShapes(needClear = true, shapes?: BaseShape[]) {
    needClear && clearAllCvs(this.drawShapeContext, this.drawShapeCanvas);
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
  drawShapeUndo(needClear = true): UnRedoReturn {
    const shapes = this.shapeHistory.undo()
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
  drawShapeRedo(needClear = true): UnRedoReturn {
    const shapes = this.shapeHistory.redo()
    if (shapes) {
      this.drawShapes(needClear)
    }
    return { shape: this.lastShape, shapes: [...this.shapes] }
  }

  get shapes() {
    return this.shapeHistory.curValue || []
  }

  get lastShape() {
    const shapes = this.shapes
    return shapes[shapes.length - 1]
  }

  drawShapeBindEvent() {
    this.drawShapeCanvas.addEventListener('mousedown', this.onDrawShapeMousedown)
    this.drawShapeCanvas.addEventListener('mousemove', this.onDrawShapeMousemove)
    this.drawShapeCanvas.addEventListener('mouseup', this.onDrawShapeMouseup)
    this.drawShapeCanvas.addEventListener('mouseleave', this.onDrawShapeMouseLeave)
  }

  drawShapeRmEvent() {
    this.drawShapeCanvas.removeEventListener('mousedown', this.onDrawShapeMousedown)
    this.drawShapeCanvas.removeEventListener('mousemove', this.onDrawShapeMousemove)
    this.drawShapeCanvas.removeEventListener('mouseup', this.onDrawShapeMouseup)
    this.drawShapeCanvas.removeEventListener('mouseleave', this.onDrawShapeMouseLeave)
  }

  /***************************************************
   *                    private
   ***************************************************/

  private onDrawShapeMousedown = (e: MouseEvent) => {
    if (this.drawShapeDiable) return
    this.drawShapeIsDrawing = true

    /**
     * 重画代表废弃撤销里的图形
     */
    this.shapeHistory.cleanUnusedNodes((isCleanAll) => {
      isCleanAll && this.drawMap?.cleanShapeRecord()
    })

    const { offsetX, offsetY } = e
    const shape = this.getShape(offsetX, offsetY)

    // 拖动
    if (shape) {
      this.drawShapeDragX = offsetX
      this.drawShapeDragY = offsetY
      this.curDragShape = shape

      // 不记录矩形位移的历史记录
      const history = this.drawMap?.getHistory()
      if (!history) return
      history.undo()
      history.cleanUnusedNodes()

      return
    }

    const Cls = ShapeMap[this.shapeType]
    const rect = new Cls({
      startX: offsetX,
      startY: offsetY,
      ctx: this.drawShapeContext,
    })

    rect.setShapeStyle(this.shapeStyle)

    const lastRecord = (this.shapeHistory.curValue || []) as BaseShape[]
    this.shapeHistory.add([...lastRecord, rect])
  }

  private onDrawShapeMousemove = (e: MouseEvent) => {
    if (!this.drawShapeIsDrawing) return

    const { curDragShape } = this
    /**
     * 拖动
     */
    if (curDragShape) {
      const { startX, startY, endX, endY } = curDragShape
      const disX = e.offsetX - this.drawShapeDragX
      const disY = e.offsetY - this.drawShapeDragY

      curDragShape.startX = startX + disX
      curDragShape.startY = startY + disY
      curDragShape.endX = endX + disX
      curDragShape.endY = endY + disY

      this.drawShapeDragX = e.offsetX
      this.drawShapeDragY = e.offsetY

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
    if (!shape) return

    shape.endX = e.offsetX
    shape.endY = e.offsetY

    const drawMap = this.drawMap
    if (drawMap) {
      drawMap.draw()
    }
    else {
      this.drawShapes()
    }
  }

  private onDrawShapeMouseup = (e: MouseEvent) => {
    this.drawShapeIsDrawing = false
    this.curDragShape = null
  }

  private onDrawShapeMouseLeave = (e: MouseEvent) => {
    this.drawShapeIsDrawing = false
    this.curDragShape = null
  }

  protected get drawMap() {
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