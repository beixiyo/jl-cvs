import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * HTML元素的响应式边界框
 *
 * @param targetRef - 目标元素的ref
 * @param options - 配置选项
 */
export function useElBounding(
  targetRef: React.RefObject<HTMLElement>,
  options: UseElBoundingOptions = {},
) {
  const {
    reset = true,
    windowResize = true,
    windowScroll = true,
    immediate = true,
    updateTiming = 'sync',
  } = options

  const [bounds, setBounds] = useState({
    height: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  })

  const observerRef = useRef<MutationObserver | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const recalculate = useCallback(() => {
    const el = targetRef.current

    if (!el) {
      if (reset) {
        setBounds({
          height: 0,
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
          x: 0,
          y: 0,
        })
      }
      return
    }

    const rect = el.getBoundingClientRect()

    setBounds({
      height: rect.height,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: rect.width,
      x: rect.x,
      y: rect.y,
    })
  }, [targetRef, reset])

  const update = useCallback(() => {
    if (updateTiming === 'sync') {
      recalculate()
    }
    else if (updateTiming === 'next-frame') {
      requestAnimationFrame(() => recalculate())
    }
  }, [recalculate, updateTiming])

  /** 设置观察器 */
  useEffect(() => {
    const el = targetRef.current

    if (el) {
      resizeObserverRef.current = new ResizeObserver(() => {
        update()
      })
      resizeObserverRef.current.observe(el)

      observerRef.current = new MutationObserver(update)
      observerRef.current.observe(el, {
        attributeFilter: ['style', 'class'],
      })

      /** 初始更新 */
      if (immediate) {
        update()
      }
    }

    return () => {
      resizeObserverRef.current?.disconnect()
      observerRef.current?.disconnect()
    }
  }, [targetRef, immediate, update])

  /** 监听窗口事件 */
  useEffect(() => {
    if (windowScroll) {
      window.addEventListener('scroll', update, { capture: true, passive: true })
    }
    if (windowResize) {
      window.addEventListener('resize', update, { passive: true })
    }

    return () => {
      if (windowScroll) {
        window.removeEventListener('scroll', update, { capture: true })
      }
      if (windowResize) {
        window.removeEventListener('resize', update)
      }
    }
  }, [windowScroll, windowResize, update])

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
