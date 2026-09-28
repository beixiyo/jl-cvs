import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { useLatestCallback } from '../memo'

/** 提供可取消、可选防抖的元素滚入视区能力，触发策略由调用方负责 */
export function useScrollIntoView(options: UseScrollIntoViewOptions = {}) {
  const {
    enabled = true,
    delay = 0,
    behavior = 'smooth',
    block = 'nearest',
    inline = 'nearest',
  } = options
  const scrollOptions: ScrollIntoViewOptions = { behavior, block, inline }
  const timerRef = useRef<number | null>(null)

  const cancelScroll = useLatestCallback(() => {
    if (timerRef.current === null) return

    window.clearTimeout(timerRef.current)
    timerRef.current = null
  })

  const scrollIntoView = useLatestCallback((targets: ScrollIntoViewTargets) => {
    cancelScroll()
    if (!enabled) return

    const scroll = () => {
      timerRef.current = null
      const targetList = Array.isArray(targets)
        ? targets
        : [targets]
      targetList.forEach((target) => {
        resolveTarget(target)?.scrollIntoView(scrollOptions)
      })
    }

    if (delay <= 0) {
      scroll()
      return
    }

    timerRef.current = window.setTimeout(scroll, delay)
  })

  useEffect(() => cancelScroll, [cancelScroll])

  return {
    scrollIntoView,
    cancelScroll,
  }
}

function resolveTarget(target: ScrollIntoViewTarget) {
  if (typeof target === 'function') return target()
  if ('current' in target) return target.current
  return target
}

export type ScrollIntoViewTarget = Element | RefObject<Element | null> | (() => Element | null)
export type ScrollIntoViewTargets = ScrollIntoViewTarget | readonly ScrollIntoViewTarget[]

export interface UseScrollIntoViewOptions extends ScrollIntoViewOptions {
  /** 是否允许执行滚动 @default true */
  enabled?: boolean
  /** 防抖时间，单位毫秒；小于等于 0 时立即执行 @default 0 */
  delay?: number
}
