import type { RefObject, WheelEvent as ReactWheelEvent } from 'react'
import { useEffect } from 'react'
import { useLatestCallback } from '../memo'

type WheelDirectionEvent = ReactWheelEvent | WheelEvent
type WheelDirectionTarget = HTMLElement | RefObject<HTMLElement | null> | (() => HTMLElement | null)

/**
 * 通用的鼠标滚轮方向判断 hook
 *
 * 默认将原始 wheel 事件归一化为「向上 / 向下」，并阻止页面滚动与事件冒泡
 * 传入 `target` 时会以 `passive: false` 原生监听该元素，可可靠阻止浏览器默认滚动
 */
export function useWheelDirection<T extends WheelDirectionEvent = ReactWheelEvent>(
  handlers: WheelDirectionHandlers<T>,
  options: UseWheelDirectionOptions<T> = {},
) {
  const {
    onScrollUp,
    onScrollDown,
  } = handlers

  const {
    preventDefault = true,
    stopPropagation = true,
    threshold = 10,
    enable = true,
    when,
    target,
    scrollContainer,
    useClosestScrollableParent = false,
    boundaryContainerRef,
  } = options

  const handleWheel = useLatestCallback((event: T) => {
    if (!enable || !when?.(event)) return

    const { deltaY } = event

    /** 过滤掉极小的滚动值（例如某些触控板抖动） */
    if (Math.abs(deltaY) <= threshold) return

    const scrollParent = resolveWheelTarget(scrollContainer)
      ?? (useClosestScrollableParent
        ? findScrollableParent(event.target as HTMLElement | null, boundaryContainerRef?.current)
        : null)
    if (scrollParent) {
      const canScrollUp = scrollParent.scrollTop > 0
      const canScrollDown = scrollParent.scrollTop + scrollParent.clientHeight < scrollParent.scrollHeight - 1
      const canScroll = deltaY < 0
        ? canScrollUp
        : canScrollDown
      if (canScroll) return
    }

    if (preventDefault) event.preventDefault()

    if (stopPropagation) event.stopPropagation()

    if (deltaY < 0) onScrollUp?.(event)
    else if (deltaY > 0) onScrollDown?.(event)
  })

  useEffect(() => {
    const element = resolveWheelTarget(target)
    if (!element) return

    const handleNativeWheel = (event: WheelEvent) => handleWheel(event as T)
    element.addEventListener('wheel', handleNativeWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleNativeWheel)
  }, [handleWheel, target])

  return handleWheel
}

function resolveWheelTarget(target: WheelDirectionTarget | undefined) {
  if (!target) return null
  if (typeof target === 'function') return target()
  if ('current' in target) return target.current
  return target
}

function findScrollableParent(node: HTMLElement | null, boundary: HTMLElement | null | undefined) {
  if (typeof window === 'undefined') return null

  let current = node
  while (current && current !== boundary && current !== document.body) {
    const style = window.getComputedStyle(current)
    const hasScroll = /(auto|scroll|overlay)/.test(`${style.overflow}${style.overflowY}`)
    if (hasScroll && current.scrollHeight > current.clientHeight + 1) return current
    current = current.parentElement
  }
  return null
}

export interface WheelDirectionHandlers<T extends WheelDirectionEvent = ReactWheelEvent> {
  /** 向上滚动时触发（deltaY < 0） */
  onScrollUp?: (event: T) => void
  /** 向下滚动时触发（deltaY > 0） */
  onScrollDown?: (event: T) => void
}

export interface UseWheelDirectionOptions<T extends WheelDirectionEvent = ReactWheelEvent> {
  /** 是否阻止默认行为（如页面/容器滚动） @default true */
  preventDefault?: boolean
  /** 是否阻止事件冒泡 @default true */
  stopPropagation?: boolean
  /** 触发方向判断的最小绝对值阈值 @default 10 */
  threshold?: number
  /** 是否启用滚轮方向判断 @default true */
  enable?: boolean
  /** 额外的事件命中条件；不满足时不会阻止默认行为或触发回调 */
  when?: (event: T) => boolean
  /**
   * 原生绑定目标，支持元素、Ref 或 getter
   * 提供后会以 `passive: false` 监听，适用于需要阻止浏览器默认滚动的场景
   */
  target?: WheelDirectionTarget
  /**
   * 指定滚动容器；容器尚可滚动时不会触发方向回调
   * 支持传入元素、Ref 或 getter
   */
  scrollContainer?: WheelDirectionTarget
  /** 是否从事件目标向上查找可滚动父容器 @default false */
  useClosestScrollableParent?: boolean
  /** 向上查找时的边界容器 */
  boundaryContainerRef?: RefObject<HTMLElement | null>
}
