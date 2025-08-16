import type { PartRequired } from '@jl-org/ts-tool'
import type { Scene } from '../core/Scene'
import type { Viewport } from '../core/Viewport'
import type { CursorMode, DrawModeOptions } from '../types'
import type { BaseShape } from '@/Shapes/libs/BaseShape'
import type { ILifecycleManager } from '@/types'
import { Arrow } from '@/Shapes/libs/Arrow'
import { Brush } from '@/Shapes/libs/Brush'
import { Circle } from '@/Shapes/libs/Circle'
import { Rect } from '@/Shapes/libs/Rect'
import { InputController, type PointerEvt, type WheelEvt } from './InputController'

export interface InteractionOptions {
  enablePan?: boolean
  enableWheelZoom?: boolean
  enableShapeDrag?: boolean
  wheelZoomSpeed?: number
  panButton?: 0 | 1 | 2
  /** 当前光标模式 */
  cursorMode?: CursorMode
  /** 绘制模式选项 */
  drawOptions?: DrawModeOptions
  /** 形状拖拽开始回调 */
  onShapeDragStart?: (shape: BaseShape) => void
  /** 形状拖拽中回调 */
  onShapeDrag?: (shape: BaseShape) => void
  /** 形状拖拽结束回调 */
  onShapeDragEnd?: (shape: BaseShape) => void
  /** 点击事件回调 */
  onClick?: (canvasPoint: { x: number, y: number }, worldPoint: { x: number, y: number }) => void
}

/**
 * 交互管理器
 * - 管理平移与缩放交互
 * - 管理形状拖拽交互
 */
export class InteractionManager implements ILifecycleManager {
  private readonly viewport: Viewport
  private readonly scene: Scene
  private readonly input: InputController
  private readonly options: PartRequired<
    InteractionOptions,
    'enablePan'
    | 'enableWheelZoom'
    | 'enableShapeDrag'
    | 'wheelZoomSpeed'
    | 'panButton'
    | 'cursorMode'
  >

  /** 画布拖拽相关 */
  private dragging = false
  private lastClientX = 0
  private lastClientY = 0

  /** 形状拖拽相关 */
  private shapeDragging = false
  private draggedShape: BaseShape | null = null
  private dragStartX = 0
  private dragStartY = 0
  private shapeStartX = 0
  private shapeStartY = 0
  private shapeEndX = 0
  private shapeEndY = 0

  /** 点击检测相关 */
  private clickStartX = 0
  private clickStartY = 0
  private clickStartTime = 0
  /** 像素阈值，超过此距离不算点击 */
  private readonly clickThreshold = 5
  /** 时间阈值，超过此时间不算点击 */
  private readonly clickTimeThreshold = 300

  /** 绘制模式相关 */
  private isDrawing = false
  private currentDrawingShape: BaseShape | null = null

  constructor(targetEl: HTMLElement, viewport: Viewport, scene: Scene, options: InteractionOptions = {}) {
    this.viewport = viewport
    this.scene = scene
    this.input = new InputController(targetEl, { passiveWheel: false })
    this.options = {
      enablePan: options.enablePan ?? true,
      enableWheelZoom: options.enableWheelZoom ?? true,
      enableShapeDrag: options.enableShapeDrag ?? true,
      wheelZoomSpeed: options.wheelZoomSpeed ?? 1.1,
      panButton: options.panButton ?? 0,
      cursorMode: options.cursorMode ?? 'pan',

      onShapeDragStart: options.onShapeDragStart,
      onShapeDrag: options.onShapeDrag,
      onShapeDragEnd: options.onShapeDragEnd,
      onClick: options.onClick,
      drawOptions: options.drawOptions,
    }
  }

  bindEvent() {
    this.input.bindEvent(this.handlePointer, this.handleWheel)
  }

  rmEvent() {
    this.input.rmEvent()
  }

  dispose() {
    this.rmEvent()
  }

  /**
   * 设置光标模式
   */
  setCursorMode(mode: CursorMode) {
    this.options.cursorMode = mode
  }

  /**
   * 设置绘制选项
   */
  setDrawOptions(options: DrawModeOptions) {
    this.options.drawOptions = {
      ...this.options.drawOptions,
      ...options,
    }
  }

  /**
   * 获取当前光标模式
   */
  getCursorMode(): CursorMode {
    return this.options.cursorMode
  }

  /**
   * 根据当前模式创建形状
   */
  private createShapeByMode(startX: number, startY: number): BaseShape | null {
    const mode = this.options.cursorMode
    const shapeStyle = this.options.drawOptions?.shapeStyle || {}

    switch (mode) {
      case 'rect':
        return new Rect({
          startX,
          startY,
          shapeStyle,
        })
      case 'circle':
        return new Circle({
          startX,
          startY,
          shapeStyle,
        })
      case 'arrow':
        return new Arrow({
          startX,
          startY,
          shapeStyle,
        })
      case 'brush':
        return new Brush({
          startX,
          startY,
          shapeStyle,
        })
      default:
        return null
    }
  }

  /**
   * 根据屏幕坐标获取点击的形状
   * @param canvasX Canvas相对X坐标
   * @param canvasY Canvas相对Y坐标
   * @returns 点击的形状或null
   */
  private getShapeAtPoint(canvasX: number, canvasY: number): BaseShape | null {
    /** 将canvas坐标转换为世界坐标 */
    const worldPoint = this.viewport.screenToWorld({ x: canvasX, y: canvasY })

    /** 从上层开始检测（zIndex高的优先） */
    const shapes = this.scene.getAll().slice().reverse()
    for (const shape of shapes) {
      if (shape.meta.visible && shape.isInPath(worldPoint.x, worldPoint.y)) {
        return shape
      }
    }
    return null
  }

  private handlePointer = (e: PointerEvt) => {
    if (e.type === 'down' && e.button === this.options.panButton) {
      /** 初始化点击检测 */
      this.clickStartX = e.x
      this.clickStartY = e.y
      this.clickStartTime = Date.now()

      /** 首先检查是否点击了形状 - 形状拖拽在任何模式下都有最高优先级 */
      if (this.options.enableShapeDrag) {
        const shape = this.getShapeAtPoint(e.x, e.y)

        if (shape) {
          /** 开始形状拖拽 */
          this.shapeDragging = true
          this.draggedShape = shape
          this.dragStartX = e.x
          this.dragStartY = e.y
          this.shapeStartX = shape.startX
          this.shapeStartY = shape.startY
          this.shapeEndX = shape.endX
          this.shapeEndY = shape.endY

          /** 触发拖拽开始回调 */
          this.options.onShapeDragStart?.(shape)
          return
        }
      }

      /** 如果没有点击到形状，检查是否为绘制模式 */
      if (this.options.cursorMode !== 'pan') {
        const worldPoint = this.viewport.screenToWorld({ x: e.x, y: e.y })
        const shape = this.createShapeByMode(worldPoint.x, worldPoint.y)

        if (shape) {
          /** 开始绘制 */
          this.isDrawing = true
          this.currentDrawingShape = shape

          /** 添加到场景 */
          this.scene.add(shape)

          /** 触发绘制开始回调 */
          this.options.drawOptions?.onDrawStart?.(shape)
          return
        }
      }

      /** 如果没有点击形状且启用了画布拖拽，则开始画布拖拽 */
      if (this.options.enablePan && this.options.cursorMode === 'pan') {
        this.dragging = true
        this.lastClientX = e.clientX
        this.lastClientY = e.clientY
      }
      return
    }

    if (e.type === 'move') {
      /** 处理绘制过程 */
      if (this.isDrawing && this.currentDrawingShape) {
        const worldPoint = this.viewport.screenToWorld({ x: e.x, y: e.y })

        if (this.options.cursorMode === 'brush') {
          /** 笔刷模式：添加路径点 */
          const brush = this.currentDrawingShape as Brush
          brush.addPoint(worldPoint.x, worldPoint.y)
        }
        else {
          /** 其他形状模式：更新结束点 */
          this.currentDrawingShape.endX = worldPoint.x
          this.currentDrawingShape.endY = worldPoint.y
        }

        /** 触发绘制中回调 */
        this.options.drawOptions?.onDrawing?.(this.currentDrawingShape)
        return
      }

      /** 处理形状拖拽 */
      if (this.shapeDragging && this.draggedShape) {
        const dx = e.x - this.dragStartX
        const dy = e.y - this.dragStartY

        /** 将canvas坐标差值转换为世界坐标差值 */
        const worldDx = dx / this.viewport.getState().zoom
        const worldDy = dy / this.viewport.getState().zoom

        /** 更新形状位置 */
        const shape = this.draggedShape
        const deltaX = worldDx
        const deltaY = worldDy

        shape.startX = this.shapeStartX + deltaX
        shape.startY = this.shapeStartY + deltaY
        shape.endX = this.shapeEndX + deltaX
        shape.endY = this.shapeEndY + deltaY

        /** 触发拖拽中回调 */
        this.options.onShapeDrag?.(shape)
        return
      }

      /** 处理画布拖拽 */
      if (this.dragging && this.options.enablePan) {
        const v = this.viewport.getState().zoom
        const dx = (e.clientX - this.lastClientX) / v
        const dy = (e.clientY - this.lastClientY) / v
        this.viewport.panBy(-dx, -dy)
        this.lastClientX = e.clientX
        this.lastClientY = e.clientY
      }
      return
    }

    if (e.type === 'up') {
      /** 处理绘制结束 */
      if (this.isDrawing && this.currentDrawingShape) {
        /** 触发绘制结束回调 */
        this.options.drawOptions?.onDrawEnd?.(this.currentDrawingShape)

        /** 重置绘制状态 */
        this.isDrawing = false
        this.currentDrawingShape = null
        return
      }

      /** 如果正在拖拽形状，触发拖拽结束回调 */
      if (this.shapeDragging && this.draggedShape) {
        this.options.onShapeDragEnd?.(this.draggedShape)
      }
      else {
        /** 检测是否为点击事件 */
        const dx = e.x - this.clickStartX
        const dy = e.y - this.clickStartY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const duration = Date.now() - this.clickStartTime

        if (distance <= this.clickThreshold && duration <= this.clickTimeThreshold) {
          /** 触发点击事件 */
          const canvasPoint = { x: e.x, y: e.y }
          const worldPoint = this.viewport.screenToWorld(canvasPoint)
          this.options.onClick?.(canvasPoint, worldPoint)
        }
      }

      this.dragging = false
      this.shapeDragging = false
      this.draggedShape = null
      return
    }
  }

  private handleWheel = (e: WheelEvt) => {
    if (!this.options.enableWheelZoom)
      return

    e.originalEvent.preventDefault()
    const factor = e.deltaY < 0
      ? this.options.wheelZoomSpeed
      : 1 / this.options.wheelZoomSpeed
    const anchorWorld = this.viewport.screenToWorld({ x: e.x, y: e.y })
    this.viewport.setZoom(this.viewport.getState().zoom * factor, anchorWorld)
  }
}
