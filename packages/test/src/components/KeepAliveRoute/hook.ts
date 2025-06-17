import { onMounted } from '@/hooks'
import { KeepAliveRouteCtx } from './KeepAliveRouteCtx'

/**
 * 注册路由激活回调
 */
export function useRouteActive(callback: VoidFunction) {
  const { pathname } = useLocation()
  const { registerActiveEffect, delActiveEffect } = useContext(KeepAliveRouteCtx)

  onMounted(() => {
    registerActiveEffect?.(pathname, callback)

    return () => {
      delActiveEffect(pathname)
    }
  })
}

/**
 * 注册路由失活回调
 */
export function useRouteDeactive(callback: VoidFunction) {
  const { pathname } = useLocation()
  const { registerDeactiveEffect, delDeactiveEffect } = useContext(KeepAliveRouteCtx)

  onMounted(() => {
    registerDeactiveEffect?.(pathname, callback)

    return () => {
      delDeactiveEffect(pathname)
    }
  })
}
