import type { Viewport } from '../core/Viewport'
import { InputController, type PointerEvt, type WheelEvt } from './InputController'

export interface InteractionOptions {
  enablePan?: boolean
  enableWheelZoom?: boolean
  wheelZoomSpeed?: number
  panButton?: 0 | 1 | 2
}

/**
 * 交互管理器
 * - 管理平移与缩放交互（未来扩展选择/编辑）
 */
export class InteractionManager {
  private readonly viewport: Viewport
  private readonly input: InputController
  private readonly options: Required<InteractionOptions>
  private dragging = false
  private lastClientX = 0
  private lastClientY = 0

  constructor(targetEl: HTMLElement, viewport: Viewport, options: InteractionOptions = {}) {
    this.viewport = viewport
    this.input = new InputController(targetEl, { passiveWheel: false })
    this.options = {
      enablePan: options.enablePan ?? true,
      enableWheelZoom: options.enableWheelZoom ?? true,
      wheelZoomSpeed: options.wheelZoomSpeed ?? 1.1,
      panButton: options.panButton ?? 0,
    }
  }

  attach() {
    this.input.attach(this.handlePointer, this.handleWheel)
  }

  detach() {
    this.input.detach()
  }

  private handlePointer = (e: PointerEvt) => {
    if (!this.options.enablePan)
      return

    if (e.type === 'down' && e.button === this.options.panButton) {
      this.dragging = true
      this.lastClientX = e.clientX
      this.lastClientY = e.clientY
      return
    }

    if (e.type === 'move' && this.dragging) {
      const v = this.viewport.getState().zoom
      const dx = (e.clientX - this.lastClientX) / v
      const dy = (e.clientY - this.lastClientY) / v
      this.viewport.panBy(-dx, -dy)
      this.lastClientX = e.clientX
      this.lastClientY = e.clientY
      return
    }

    if (e.type === 'up') {
      this.dragging = false
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
