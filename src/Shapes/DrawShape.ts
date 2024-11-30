import { clearAllCvs } from '@/canvasTool'
import { Rect } from './libs/Rect'
import type { ShapeAttrs } from './type'
import type { BaseShape } from './BaseShape'
import { DRAW_MAP } from '@/NoteBoard'


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
   * 当前绘制的图形
   */
  shape: ShapeType = 'rect'
  shapes: BaseShape[] = []
  /**
   * 撤销的图形
   */
  undoShapes: BaseShape[] = []
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
  /**
   * 当前拖动的矩形
   */
  curShape?: BaseShape

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
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i]
      if (shape.isInPath(x, y)) {
        return shape
      }
    }
  }

  /**
   * 撤销
   */
  drawShapeUndo(needClear = true): UnRedoReturn {
    const shape = this.shapes.pop()
    if (shape) {
      this.undoShapes.push(shape)
      this.drawShapes(needClear)
    }
    return { shape, shapes: [...this.shapes] }
  }

  /**
   * 重做
   */
  drawShapeRedo(needClear = true): UnRedoReturn {
    const shape = this.undoShapes.pop()
    if (shape) {
      this.shapes.push(shape)
      this.drawShapes(needClear)
    }
    return { shape, shapes: [...this.shapes] }
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
    this.undoShapes = []
    this.drawShapeIsDrawing = true

    const { offsetX, offsetY } = e
    const shape = this.getShape(offsetX, offsetY)

    // 拖动
    if (shape) {
      this.drawShapeDragX = offsetX
      this.drawShapeDragY = offsetY
      this.curShape = shape
      return
    }

    const Cls = ShapeMap[this.shape]
    const rect = new Cls({
      startX: offsetX,
      startY: offsetY,
      ctx: this.drawShapeContext,
    })

    rect.setShapeAttrs(this.shapeAttrs)
    this.shapes.push(rect)
  }

  private onDrawShapeMousemove = (e: MouseEvent) => {
    if (!this.drawShapeIsDrawing) return

    const { curShape } = this
    /**
     * 拖动
     */
    if (curShape) {
      const { startX, startY, endX, endY } = curShape
      const disX = e.offsetX - this.drawShapeDragX
      const disY = e.offsetY - this.drawShapeDragY

      curShape.startX = startX + disX
      curShape.startY = startY + disY
      curShape.endX = endX + disX
      curShape.endY = endY + disY

      this.drawShapeDragX = e.offsetX
      this.drawShapeDragY = e.offsetY

      const drawFn = this.drawFn
      if (drawFn) {
        drawFn.draw()
      }
      else {
        this.drawShapes()
      }
      return
    }

    /**
     * 初次绘制
     */
    const shape = this.shapes[this.shapes.length - 1]
    if (!shape) return

    shape.endX = e.offsetX
    shape.endY = e.offsetY

    const fn = this.drawFn
    if (fn) {
      fn.draw()
    }
    else {
      this.drawShapes()
    }
  }

  private onDrawShapeMouseup = (e: MouseEvent) => {
    this.drawShapeIsDrawing = false
    this.curShape = undefined
  }

  private onDrawShapeMouseLeave = (e: MouseEvent) => {
    this.drawShapeIsDrawing = false
    this.curShape = undefined
  }

  protected get drawFn() {
    return DRAW_MAP.get(this)
  }
}


export type ShapeType = keyof typeof ShapeMap

export type UnRedoReturn = {
  shape?: BaseShape
  shapes: BaseShape[]
}

export type DrawShapeOpts = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}