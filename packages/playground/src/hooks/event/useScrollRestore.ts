import { rafThrottle } from '@jl-org/tool'
import type { RefObject } from 'react'
import { useEffect } from 'react'
import { useLatestRef } from '../ref'

/**
 * 记录并恢复滚动位置
 * @param containerRef 滚动容器的 ref，如果不传则默认为 window
 * @param key 存储的 key，如果不传则根据当前路径自动生成
 */
export function useScrollRestore(
  containerRef?: RefObject<HTMLElement | null>,
  key?: string,
) {
  const isServer = typeof window === 'undefined'
  const scrollKey = isServer
    ? ''
    : key || `scroll-position:${window.location.pathname}`
  const containerRefRef = useLatestRef(containerRef)

  useEffect(() => {
    if (isServer) return

    const container = containerRefRef.current?.current
      ?? document.body
      ?? document.documentElement
      ?? window
    const savedPosition = sessionStorage.getItem(scrollKey)

    if (savedPosition) {
      try {
        const position = JSON.parse(savedPosition)
        if (container instanceof Window) {
          container.scrollTo(position.x, position.y)
        }
        else {
          container.scrollLeft = position.x
          container.scrollTop = position.y
        }
      }
      catch (e) {
        console.error('[useScrollRestore] Restore failed:', e)
      }
    }

    const handleScroll = rafThrottle(() => {
      const x = container instanceof Window
        ? container.scrollX
        : container.scrollLeft
      const y = container instanceof Window
        ? container.scrollY
        : container.scrollTop
      sessionStorage.setItem(scrollKey, JSON.stringify({ x, y }))
    })

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [scrollKey, containerRefRef, isServer])
}
