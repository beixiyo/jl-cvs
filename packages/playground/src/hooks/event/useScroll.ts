import { rafThrottle } from '@jl-org/tool'
import type { RefObject } from 'react'
import { useCallback, useEffect, useLayoutEffect } from 'react'
import { useLatestRef } from '../ref'
import type { ScrollBottomOpts, ScrollReachBottomOpts } from './types'

/**
 * 滚动到底部
 * @param elRef 滚动容器的 ref
 * @param deps 依赖项
 * @param options 配置选项
 */
export function useScrollBottom(
  elRef: RefObject<HTMLElement>,
  deps: any[] = [],
  options: ScrollBottomOpts = {},
) {
  const {
    enabled = true,
    smooth = false,
    delay = 0,
  } = options

  const scrollToBottom = useCallback(() => {
    const el = elRef.current
    if (!el) return

    const { scrollHeight, clientHeight } = el
    /** 仅当内容溢出时才执行 */
    if (scrollHeight > clientHeight) {
      const target = scrollHeight - clientHeight
      el.scrollTo({
        top: target,
        behavior: smooth
          ? 'smooth'
          : 'instant',
      })
    }
  }, [elRef, smooth])

  useLayoutEffect(() => {
    if (!enabled) return

    if (delay > 0) {
      const timer = window.setTimeout(scrollToBottom, delay)
      return () => window.clearTimeout(timer)
    }
    else {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, smooth, delay, scrollToBottom, ...deps])

  return {
    /**
     * 计算并滚动到正确的底部位置
     */
    scrollToBottom,
  }
}

/**
 * 检测滚动是否触底
 * @param containerRef 滚动容器的 ref
 * @param onReachBottom 触底时的回调函数
 * @param options 配置选项
 * @returns 返回滚动信息和触底检测函数
 */
export function useScrollReachBottom(
  containerRef: RefObject<HTMLElement | null>,
  onReachBottom?: () => void,
  options: ScrollReachBottomOpts = {},
) {
  const {
    threshold = 50,
    enabled = true,
  } = options

  const watchOnReachBottom = useLatestRef(onReachBottom)

  /**
   * 获取滚动尺寸信息
   */
  const getScrollSize = useCallback((customThreshold = threshold) => {
    const container = containerRef.current
    if (!container) {
      return {
        scrollTop: 0,
        clientHeight: 0,
        scrollHeight: 0,
        isReachedBottom: false,
      }
    }

    const scrollTop = container.scrollTop
    const clientHeight = container.clientHeight
    const scrollHeight = container.scrollHeight

    /** 检查是否触底：滚动位置 + 可视高度 >= 总高度 - 阈值 */
    const isReachedBottom = scrollTop + clientHeight >= scrollHeight - customThreshold

    return {
      scrollTop,
      clientHeight,
      scrollHeight,
      isReachedBottom,
    }
  }, [containerRef, threshold])

  /**
   * 检查是否触底
   */
  const checkReachBottom = useCallback(() => {
    if (!enabled || !watchOnReachBottom.current) {
      return
    }

    const { isReachedBottom } = getScrollSize()
    if (isReachedBottom) {
      watchOnReachBottom.current()
    }
  }, [enabled, watchOnReachBottom, getScrollSize])

  /** 监听滚动事件 */
  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled || !watchOnReachBottom.current) {
      return
    }

    const handleScroll = rafThrottle(() => {
      checkReachBottom()
    })

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, enabled, watchOnReachBottom, checkReachBottom])

  return {
    /**
     * 获取滚动尺寸信息
     */
    getScrollSize,
    /**
     * 手动检查是否触底
     */
    checkReachBottom,
  }
}
