import { getScrollParents } from '@/hooks'
import type { RefObject } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * 跟随滚动时解析 Portal 挂载容器，并确保滚动容器具备定位上下文
 * 职责：仅负责 scroll 父级解析与 position 设置，不参与浮层定位计算
 */
export function useScrollPortal(
  triggerRef: RefObject<HTMLElement | null>,
  followScroll: boolean,
  isOpen: boolean,
) {
  const canUseDOM = typeof document !== 'undefined'
  const [scrollPortalTarget, setScrollPortalTarget] = useState<HTMLElement | null>(null)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (canUseDOM && followScroll && triggerRef.current) {
      const parent = getScrollParents(triggerRef.current)[0] ?? document.body
      scrollContainerRef.current = parent
      setScrollPortalTarget(parent)
    }
    else {
      scrollContainerRef.current = null
      setScrollPortalTarget(null)
    }
  }, [canUseDOM, followScroll, isOpen, triggerRef])

  useEffect(() => {
    if (!canUseDOM || !followScroll || !scrollPortalTarget || scrollPortalTarget === document.body) return
    const el = scrollPortalTarget as HTMLElement
    const prev = el.style.position
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }

    return () => {
      if (prev === '') el.style.position = ''
      else el.style.position = prev
    }
  }, [canUseDOM, followScroll, scrollPortalTarget])

  return { scrollPortalTarget, scrollContainerRef }
}
