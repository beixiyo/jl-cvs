import { useEffect, useState } from 'react'
import { useLatestRef } from '../ref'

/**
 * 鼠标位置监听
 * @param options 配置选项
 * @example
 * ```tsx
 * const { x, y } = useMouse()
 * console.log(x, y)
 *
 * const { x, y } = useMouse({
 *   getXY: (e) => ({ x: e.clientX, y: e.clientY }),
 *   target: document.body,
 *   event: 'mousemove',
 *   enabled: true,
 * })
 * console.log(x, y)
 * ```
 */
export function useMouse(options: UseMouseOptions = {}) {
  const {
    getXY,
    target,
    event = 'mousemove',
    enabled = true,
  } = options

  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const latestGetXY = useLatestRef(getXY)

  useEffect(() => {
    const eventTarget = target ?? (typeof window !== 'undefined'
      ? window
      : undefined)
    if (!enabled || !eventTarget) return

    const handleMouseMove = (e: Event) => {
      const event = e as MouseEvent
      setMouse(
        latestGetXY?.current
          ? latestGetXY.current(event)
          : { x: event.clientX, y: event.clientY },
      )
    }

    eventTarget.addEventListener(event, handleMouseMove)
    return () => {
      eventTarget.removeEventListener(event, handleMouseMove)
    }
  }, [enabled, target, event, latestGetXY])

  return mouse
}

export type UseMouseOptions = {
  getXY?: (e: MouseEvent) => { x: number; y: number }
  /**
   * 事件绑定目标，@default window
   */
  target?: Window | Document | HTMLElement | null
  /**
   * 事件类型，@default 'mousemove'
   */
  event?: 'mousemove' | 'mouseenter' | 'mouseleave' | 'mouseover' | 'mouseout' | 'mouseup' | 'mousedown' | 'contextmenu'
  /**
   * 是否启用监听，@default true
   */
  enabled?: boolean
}
