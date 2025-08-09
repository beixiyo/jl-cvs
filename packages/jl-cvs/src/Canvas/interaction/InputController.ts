import type { ILifecycleManager } from '@/types'

export interface InputOptions {
  /** wheel 事件是否使用 passive */
  passiveWheel?: boolean
}

export type PointerButton = 0 | 1 | 2

export interface PointerEvt {
  /** down/move/up 三态 */
  type: 'down' | 'move' | 'up'
  /** 相对目标元素的坐标（CSS 像素） */
  x: number
  y: number
  /** 客户区坐标 */
  clientX: number
  clientY: number
  /** 按键：0/1/2 */
  button: PointerButton
  pointerId: number
  originalEvent: PointerEvent
}

export interface WheelEvt {
  x: number
  y: number
  deltaY: number
  originalEvent: WheelEvent
}

export type PointerHandler = (e: PointerEvt) => void
export type WheelHandler = (e: WheelEvt) => void

/**
 * 输入控制器：
 * - 绑定 Canvas 的 pointer/wheel 事件并转发给上层
 */
export class InputController implements ILifecycleManager {
  private el: HTMLElement
  private options: InputOptions
  private onPointer?: PointerHandler
  private onWheel?: WheelHandler

  constructor(el: HTMLElement, options: InputOptions = {}) {
    this.el = el
    this.options = options
  }

  bindEvent(onPointer: PointerHandler, onWheel?: WheelHandler) {
    this.onPointer = onPointer
    this.onWheel = onWheel
    this.el.addEventListener('pointerdown', this.handlePointerDown)
    this.el.addEventListener('pointermove', this.handlePointerMove)
    this.el.addEventListener('pointerup', this.handlePointerUp)
    this.el.addEventListener('pointercancel', this.handlePointerCancel)
    this.el.addEventListener('lostpointercapture', this.handleLostCapture as any)
    this.el.addEventListener('wheel', this.handleWheel, { passive: this.options.passiveWheel ?? false })
  }

  rmEvent() {
    this.el.removeEventListener('pointerdown', this.handlePointerDown as any)
    this.el.removeEventListener('pointermove', this.handlePointerMove as any)
    this.el.removeEventListener('pointerup', this.handlePointerUp as any)
    this.el.removeEventListener('pointercancel', this.handlePointerCancel as any)
    this.el.removeEventListener('lostpointercapture', this.handleLostCapture as any)
    this.el.removeEventListener('wheel', this.handleWheel as any)
    this.onPointer = undefined
    this.onWheel = undefined
  }

  dispose() {
    this.rmEvent()
  }

  private toLocalXY = (e: PointerEvent | WheelEvent) => {
    const rect = this.el.getBoundingClientRect()
    const x = (e as PointerEvent).clientX - rect.left
    const y = (e as PointerEvent).clientY - rect.top
    return { x, y }
  }

  private handlePointerDown = (e: PointerEvent) => {
    const { x, y } = this.toLocalXY(e)
    this.el.setPointerCapture?.(e.pointerId)
    this.onPointer?.({ type: 'down', x, y, clientX: e.clientX, clientY: e.clientY, button: e.button as any, pointerId: e.pointerId, originalEvent: e })
  }

  private handlePointerMove = (e: PointerEvent) => {
    const { x, y } = this.toLocalXY(e)
    this.onPointer?.({ type: 'move', x, y, clientX: e.clientX, clientY: e.clientY, button: e.button as any, pointerId: e.pointerId, originalEvent: e })
  }

  private handlePointerUp = (e: PointerEvent) => {
    const { x, y } = this.toLocalXY(e)
    this.el.releasePointerCapture?.(e.pointerId)
    this.onPointer?.({ type: 'up', x, y, clientX: e.clientX, clientY: e.clientY, button: e.button as any, pointerId: e.pointerId, originalEvent: e })
  }

  private handlePointerCancel = (e: PointerEvent) => {
    const { x, y } = this.toLocalXY(e)
    this.onPointer?.({ type: 'up', x, y, clientX: e.clientX, clientY: e.clientY, button: e.button as any, pointerId: e.pointerId, originalEvent: e })
  }

  private handleLostCapture = (e: PointerEvent) => {
    const { x, y } = this.toLocalXY(e)
    this.onPointer?.({ type: 'up', x, y, clientX: e.clientX, clientY: e.clientY, button: e.button as any, pointerId: e.pointerId, originalEvent: e })
  }

  private handleWheel = (e: WheelEvent) => {
    const { x, y } = this.toLocalXY(e)
    this.onWheel?.({ x, y, deltaY: e.deltaY, originalEvent: e })
  }
}
