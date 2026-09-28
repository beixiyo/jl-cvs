import { useCallback, useMemo, useSyncExternalStore } from 'react'

const getServerMatchSnapshot = () => false

/**
 * 订阅媒体查询的匹配状态
 *
 * 响应式读取 `window.matchMedia(query).matches`，query 变化时自动重新订阅；
 * SSR / 不支持 matchMedia 的环境恒返回 `false`
 *
 * @param query 媒体查询字符串
 * @returns 当前是否匹配
 *
 * @example
 * const isDarkScheme = useMediaQuery('(prefers-color-scheme: dark)')
 * const isMobile = useMediaQuery('(max-width: 640px)')
 */
export function useMediaQuery(query: string): boolean {
  /** 缓存 MediaQueryList，避免每次快照都新建实例；query 变化时重建 */
  const mql = useMemo(() => {
    if (typeof window.matchMedia !== 'function') return null

    return window.matchMedia(query)
  }, [query])

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!mql) return () => {}

      mql.addEventListener('change', listener)
      return () => mql.removeEventListener('change', listener)
    },
    [mql],
  )

  const getSnapshot = useCallback(() => mql?.matches ?? false, [mql])

  return useSyncExternalStore(subscribe, getSnapshot, getServerMatchSnapshot)
}
