import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useBindWinEvent } from '../event'
import { useLatestCallback, useStable } from '../memo'
import { useMutationObserver, useResizeObserver } from '../ob'

const EMPTY_BOUNDS = {
  height: 0,
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
}

/**
 * HTML元素的响应式边界框
 *
 * @param targetRef - 目标元素的ref
 * @param options - 配置选项
 */
export function useElBounding(
  targetRef: RefObject<HTMLElement | null>,
  options: UseElBoundingOptions = {},
) {
  const {
    reset = true,
    windowResize = true,
    windowScroll = true,
    immediate = true,
    updateTiming = 'sync',
  } = options

  const [bounds, setBounds] = useState(() => ({ ...EMPTY_BOUNDS }))
  const lastLayoutSize = useRef({ width: 0, height: 0 })

  const mutationOptions = useStable({
    immediate: false,
    attributes: true,
    attributeFilter: ['style', 'class'],
    childList: false,
    subtree: false,
    characterData: false,
  })

  const recalculate = useLatestCallback(() => {
    const el = targetRef.current

    if (!el) {
      if (reset) {
        setBounds({ ...EMPTY_BOUNDS })
      }
      return
    }

    const rect = el.getBoundingClientRect()

    setBounds({
      height: lastLayoutSize.current.height || el.offsetHeight || rect.height,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: lastLayoutSize.current.width || el.offsetWidth || rect.width,
      x: rect.x,
      y: rect.y,
    })
  })

  const update = useLatestCallback(() => {
    if (updateTiming === 'sync') {
      recalculate()
    }
    else {
      requestAnimationFrame(() => recalculate())
    }
  })

  useResizeObserver([targetRef], (entry) => {
    if (entry.borderBoxSize?.[0]) {
      lastLayoutSize.current = {
        width: entry.borderBoxSize[0].inlineSize,
        height: entry.borderBoxSize[0].blockSize,
      }
    }
    else {
      lastLayoutSize.current = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }
    }
    update()
  })

  useMutationObserver(targetRef, () => update(), mutationOptions)

  useEffect(() => {
    if (!immediate || !targetRef.current) return
    update()
  }, [immediate, targetRef.current, update])

  useBindWinEvent({
    eventName: 'scroll',
    listener: update,
    deps: [],
    options: { capture: true, passive: true },
    enabled: windowScroll,
  })
  useBindWinEvent({
    eventName: 'resize',
    listener: update,
    deps: [],
    options: { passive: true },
    enabled: windowResize,
  })

  return {
    ...bounds,
    update,
  }
}

export type UseElBoundingReturn = ReturnType<typeof useElBounding>

export interface UseElBoundingOptions {
  /**
   * 组件卸载时重置值为 0
   *
   * @default true
   */
  reset?: boolean

  /**
   * 监听窗口调整大小事件
   *
   * @default true
   */
  windowResize?: boolean

  /**
   * 监听窗口滚动事件
   *
   * @default true
   */
  windowScroll?: boolean

  /**
   * 组件挂载时立即调用更新
   *
   * @default true
   */
  immediate?: boolean

  /**
   * 重新计算边界框的时机
   *
   * 设置为`next-frame`在与类似useBreakpoints的功能一起使用时很有用
   * 因为布局(影响观察元素的边界框)不会在当前tick上更新
   *
   * @default 'sync'
   */
  updateTiming?: 'sync' | 'next-frame'
}
