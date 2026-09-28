import { useSyncExternalStore } from 'react'

function subscribeVisibility(listener: () => void) {
  document.addEventListener('visibilitychange', listener)
  return () => {
    document.removeEventListener('visibilitychange', listener)
  }
}

function getVisibilitySnapshot(): DocumentVisibilityState {
  return document.visibilityState
}

/** SSR / 无 document 环境按可见处理 */
function getServerVisibilitySnapshot(): DocumentVisibilityState {
  return 'visible'
}

/**
 * 订阅页面可见性状态
 *
 * 切换标签页 / 最小化窗口时变化，适合控制轮询、视频、动画等前台独占逻辑
 *
 * @returns 当前可见性状态 `'visible' | 'hidden' | 'prerender'`
 *
 * @example
 * const visibility = usePageVisibility()
 * useEffect(() => {
 *   if (visibility !== 'visible')
 *     stopPolling()
 * }, [visibility])
 */
export function usePageVisibility(): DocumentVisibilityState {
  return useSyncExternalStore(
    subscribeVisibility,
    getVisibilitySnapshot,
    getServerVisibilitySnapshot,
  )
}
