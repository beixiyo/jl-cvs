import type { Scene } from '../core/Scene'
import type { Viewport } from '../core/Viewport'
import type { BaseShape } from '@/Shapes/BaseShape'
import type { ILifecycleManager } from '@/types'
import { InputController, type PointerEvt, type WheelEvt } from './InputController'

export interface InteractionOptions {
  enablePan?: boolean
  enableWheelZoom?: boolean
  enableShapeDrag?: boolean
  wheelZoomSpeed?: number
  panButton?: 0 | 1 | 2
  /** 形状拖拽开始回调 */
  onShapeDragStart?: (shape: BaseShape) => void
  /** 形状拖拽中回调 */
  onShapeDrag?: (shape: BaseShape) => void
  /** 形状拖拽结束回调 */
  onShapeDragEnd?: (shape: BaseShape) => void
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
  private readonly options: Required<Omit<InteractionOptions, 'onShapeDragStart' | 'onShapeDrag' | 'onShapeDragEnd'>> & Pick<InteractionOptions, 'onShapeDragStart' | 'onShapeDrag' | 'onShapeDragEnd'>

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
      onShapeDragStart: options.onShapeDragStart,
      onShapeDrag: options.onShapeDrag,
      onShapeDragEnd: options.onShapeDragEnd,
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
      /** 首先检查是否点击了形状 */
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

      /** 如果没有点击形状且启用了画布拖拽，则开始画布拖拽 */
      if (this.options.enablePan) {
        this.dragging = true
        this.lastClientX = e.clientX
        this.lastClientY = e.clientY
      }
      return
    }

    if (e.type === 'move') {
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
      /** 如果正在拖拽形状，触发拖拽结束回调 */
      if (this.shapeDragging && this.draggedShape) {
        this.options.onShapeDragEnd?.(this.draggedShape)
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
