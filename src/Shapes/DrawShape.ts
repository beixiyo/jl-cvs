import { clearAllCvs } from '@/canvasTool'
import { Rect } from './libs/Rect'
import type { ShapeAttrs } from './type'


/**
 * 绘制图形与拖拽，目前支持
 * - 矩形
 */
export class DrawShape {

  shapes: Rect[] = []
  shapeAttrs: ShapeAttrs = {}

  /** 
   * 统一事件，方便解绑
   */
  private onMousedown = this._onMousedown.bind(this)
  private onMousemove = this._onMousemove.bind(this)
  private onMouseup = this._onMouseup.bind(this)
  private onMouseLeave = this._onMouseLeave.bind(this)

  private fps = this._fps.bind(this)

  isDrawing = false

  /**
   * 上次的坐标，用于拖动等
   */
  dragX = 0
  dragY = 0
  /**
   * 当前拖动的矩形
   */
  curShape: Rect

  constructor(
    public canvas: HTMLCanvasElement,
    public context: CanvasRenderingContext2D
  ) {
    this.addEvent()
    // this.fps()
  }

  draw(needClear = true) {
    needClear && clearAllCvs(this.context, this.canvas)
    this.shapes.forEach(shape => shape.draw())
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

  addEvent() {
    this.canvas.addEventListener('mousedown', this.onMousedown)
    this.canvas.addEventListener('mousemove', this.onMousemove)
    this.canvas.addEventListener('mouseup', this.onMouseup)
    this.canvas.addEventListener('mouseleave', this.onMouseLeave)
  }

  rmEvent() {
    this.canvas.removeEventListener('mousedown', this.onMousedown)
    this.canvas.removeEventListener('mousemove', this.onMousemove)
    this.canvas.removeEventListener('mouseup', this.onMouseup)
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave)
  }

  private _fps() {
    this.draw()
    requestAnimationFrame(this.fps)
  }

  private _onMousedown(e: MouseEvent) {
    this.isDrawing = true

    const { offsetX, offsetY } = e
    const shape = this.getShape(offsetX, offsetY)

    // 拖动
    if (shape) {
      this.dragX = offsetX
      this.dragY = offsetY
      this.curShape = shape
      return
    }

    const rect = new Rect({
      startX: offsetX,
      startY: offsetY,
      ctx: this.context,
    })

    rect.setShapeAttrs(this.shapeAttrs)
    this.shapes.push(rect)
  }

  private _onMousemove(e: MouseEvent) {
    if (!this.isDrawing) return

    const { curShape } = this
    /**
     * 拖动
     */
    if (curShape) {
      const { startX, startY, endX, endY } = curShape
      const disX = e.offsetX - this.dragX
      const disY = e.offsetY - this.dragY

      curShape.startX = startX + disX
      curShape.startY = startY + disY
      curShape.endX = endX + disX
      curShape.endY = endY + disY

      this.dragX = e.offsetX
      this.dragY = e.offsetY

      this.draw()
      return
    }

    /**
     * 初次绘制
     */
    const rect = this.shapes[this.shapes.length - 1]
    if (!rect) return

    rect.endX = e.offsetX
    rect.endY = e.offsetY
    this.draw()
  }

  private _onMouseup(e: MouseEvent) {
    this.isDrawing = false
    this.curShape = undefined
  }

  private _onMouseLeave(e: MouseEvent) {
    this.isDrawing = false
    this.curShape = undefined
  }
}