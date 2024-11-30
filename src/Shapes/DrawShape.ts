import { clearAllCvs } from '@/canvasTool'
import { Rect } from './libs/Rect'
import type { ShapeAttrs } from './type'
import type { BaseShape } from './BaseShape'
import { DRAW_MAP } from '@/NoteBoard'
import { UnRedoLinkedList } from '@/utils'


const ShapeMap = {
  rect: Rect
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
  shape: ShapeType = 'rect'
  shapeHistory = new UnRedoLinkedList<BaseShape[]>()

  /**
   * 当前拖动的矩形
   */
  curDragShape: BaseShape | null = null
  shapeAttrs: ShapeAttrs = {}

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
   * 撤销
   */
  drawShapeUndo(needClear = true): UnRedoReturn {
    const shape = this.shapeHistory.undo()
    if (shape) {
      this.drawShapes(needClear)
    }
    return { shape: this.lastShape, shapes: [...this.shapes] }
  }

  /**
   * 重做
   */
  drawShapeRedo(needClear = true): UnRedoReturn {
    const shape = this.shapeHistory.redo()
    if (shape) {
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

    /**
     * 重画代表废弃撤销里的图形
     */
    this.shapeHistory.cleanUnusedNodes()
    this.drawShapeIsDrawing = true

    const { offsetX, offsetY } = e
    const shape = this.getShape(offsetX, offsetY)

    // 拖动
    if (shape) {
      this.drawShapeDragX = offsetX
      this.drawShapeDragY = offsetY
      this.curDragShape = shape
      return
    }

    const Cls = ShapeMap[this.shape]
    const rect = new Cls({
      startX: offsetX,
      startY: offsetY,
      ctx: this.drawShapeContext,
    })

    rect.setShapeAttrs(this.shapeAttrs)

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