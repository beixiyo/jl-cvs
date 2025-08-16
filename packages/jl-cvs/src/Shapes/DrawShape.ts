import type { BaseShape } from './libs/BaseShape'
import type { ShapeType } from './libs/type'
import type { ShapeStyle } from './type'
import { EventBus } from '@jl-org/tool'
import { clearAllCvs } from '@/canvasTool'
import { ShapeMap } from './libs/constants'

/**
 * 绘制图形与拖拽，支持
 * - 矩形
 * - 圆形
 * - 箭头
 */
export class DrawShape extends EventBus<DrawShapeEvent> {
  /**
   * 当前绘制的图形类型
   */
  shapeType: ShapeType = 'rect'

  /**
   * 当前拖动的图形
   */
  curDragShape: BaseShape | null = null

  /**
   * 当前正在绘制的图形
   */
  private currentShape: BaseShape | null = null

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
  }

  /**
   * 绘制指定的图形数组
   */
  drawShapes(shapes: BaseShape[], needClear = true) {
    needClear && clearAllCvs(this.ctx, this.canvas)
    shapes.forEach(shape => shape.draw(this.ctx))
  }

  /**
   * 根据坐标获取图形
   */
  getShape(x: number, y: number, shapes: BaseShape[]): BaseShape | null {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i]
      if (shape.isInPath(x, y)) {
        return shape
      }
    }
    return null
  }

  /**
   * 设置图形样式
   */
  setShapeStyle(style: ShapeStyle) {
    Object.assign(this.shapeStyle, style)
  }

  /***************************************************
   *                    Public Event Handlers
   ***************************************************/

  /**
   * 处理鼠标按下事件
   */
  handleMouseDown(e: MouseEvent) {
    this.isDrawing = true

    const { offsetX, offsetY } = e

    // @TODO 检查是否点击在现有图形上（用于拖拽）
    const currentShapes: BaseShape[] = []
    const clickedShape = this.getShape(offsetX, offsetY, currentShapes)

    /** 拖动现有图形 */
    if (clickedShape) {
      this.dragX = offsetX
      this.dragY = offsetY
      this.curDragShape = clickedShape

      /** 通知外部开始拖拽 */
      this.emit('shapeDragStart', clickedShape)
      return
    }

    /** 创建新图形 */
    const Cls = ShapeMap[this.shapeType]
    const newShape = new Cls({
      startX: offsetX,
      startY: offsetY,
      ctx: this.ctx,
    })

    newShape.setShapeStyle(this.shapeStyle)
    this.currentShape = newShape

    /** 通知外部创建了新图形 */
    this.emit('shapeCreated', newShape)
  }

  /**
   * 处理鼠标移动事件
   */
  handleMouseMove(e: MouseEvent) {
    /**
     * 鼠标悬停检测 - 改变光标样式
     */
    if (!this.isDrawing) {
      // @TODO 检查是否悬停在现有图形上（用于拖拽）
      const currentShapes: BaseShape[] = []
      const hoveredShape = this.getShape(e.offsetX, e.offsetY, currentShapes)
      this.emit('cursorChange', hoveredShape
        ? 'grab'
        : 'crosshair')
      return
    }

    const { curDragShape } = this
    /**
     * 拖动现有图形
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

      /** 通知外部图形已更新，需要重绘 */
      this.emit('shapeUpdated', undefined)
      return
    }

    /**
     * 绘制新图形
     */
    if (!this.currentShape)
      return

    /** 更新当前图形的结束坐标 */
    this.currentShape.endX = e.offsetX
    this.currentShape.endY = e.offsetY

    /** 通知外部图形已更新，需要重绘 */
    this.emit('shapeUpdated', undefined)
  }

  /**
   * 处理鼠标抬起事件
   */
  handleMouseUp() {
    this.isDrawing = false
    this.currentShape = null

    if (this.curDragShape) {
      this.emit('shapeDragEnd', undefined)
      this.curDragShape = null
    }
  }

  /**
   * 处理鼠标离开事件
   */
  handleMouseLeave() {
    this.isDrawing = false
    this.currentShape = null

    if (this.curDragShape) {
      this.emit('shapeDragEnd', undefined)
      this.curDragShape = null
    }
  }
}

export type DrawShapeOpts = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}

type DrawShapeEvent = {
  shapeCreated: BaseShape
  shapeUpdated: undefined
  shapeDragStart: BaseShape
  shapeDragEnd: undefined
  cursorChange: string
}
