import { onMounted, useRefresh } from '@/hooks'
import { LRUCache } from '@jl-org/tool'

import { activeEffectMap, deactiveEffectMap } from './KeepAliveRouteCtx'

const MAX_CACHE_LEN = 40
const componentMap = new LRUCache<string, {
  Outlet: React.ReactNode
  needCache: boolean
}>(MAX_CACHE_LEN)

export function useKeepAlive(
  {
    exclude,
    include,
    maxCache = MAX_CACHE_LEN,
  }: KeepAliveOpts = {},
) {
  if (exclude && include) {
    throw new Error('exclude and include can not be used at the same time')
  }

  onMounted(() => {
    componentMap.maxCacheLen = maxCache
  })

  const Outlet = useOutlet()
  const forceUpdate = useRefresh()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!componentMap.has(pathname)) {
      if (include) {
        if (include.includes(pathname)) {
          componentMap.set(pathname, {
            Outlet,
            needCache: true,
          })
        }
        else {
          componentMap.set(pathname, {
            Outlet,
            needCache: false,
          })
        }
      }
      else if (exclude) {
        if (!exclude.includes(pathname)) {
          componentMap.set(pathname, {
            Outlet,
            needCache: true,
          })
        }
        else {
          componentMap.set(pathname, {
            Outlet,
            needCache: false,
          })
        }
      }
      else {
        componentMap.set(pathname, {
          Outlet,
          needCache: true,
        })
      }
    }

    forceUpdate()

    /**
     * 触发钩子
     */
    for (const [key, fns] of activeEffectMap) {
      if (key === pathname) {
        for (const fn of fns) {
          fn()
        }
      }
    }

    return () => {
      for (const [key, fns] of deactiveEffectMap) {
        if (key === pathname) {
          for (const fn of fns)
            fn()
        }
      }
    }
  }, [pathname])

  return {
    pathname,
    componentMap,
  }
}

export interface KeepAliveOpts {
  include?: string[]
  exclude?: string[]
  /**
   * @default 40
   */
  maxCache?: number
}
