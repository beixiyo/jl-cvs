import type { KeepAliveContextType } from './type'
import { onMounted } from '@/hooks'
import { KeepAliveContext } from './context'

/**
 * ## 必须在 KeepAlive 组件传递 uniqueKey 属性才能使用
 * 注册激活回调
 */
export const useActiveEffect: KeepAliveContextType['registerActiveEffect'] = (key, callback) => {
  const { registerActiveEffect, delActiveEffect } = useContext(KeepAliveContext)

  onMounted(() => {
    registerActiveEffect?.(key, callback)

    return () => {
      delActiveEffect?.(key)
    }
  })
}

/**
 * ## 必须在 KeepAlive 组件传递 uniqueKey 属性才能使用
 * 注册失活回调
 */
export const useDeactiveEffect: KeepAliveContextType['registerDeactiveEffect'] = (key, callback) => {
  const { registerDeactiveEffect, delDeactiveEffect } = useContext(KeepAliveContext)

  onMounted(() => {
    registerDeactiveEffect?.(key, callback)

    return () => {
      delDeactiveEffect?.(key)
    }
  })
}
