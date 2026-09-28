import { createContext } from 'react'

export const activeEffectMap = new Map<string, Function[]>()
export const deactiveEffectMap = new Map<string, Function[]>()

export const KeepAliveRouteCtxVal: KeepAliveRouteCtxType = {
  registerDeactiveEffect(pathname, callback) {
    if (!deactiveEffectMap.get(pathname)) {
      deactiveEffectMap.set(pathname, [callback])
    }
    else {
      deactiveEffectMap.get(pathname)?.push(callback)
    }
  },
  registerActiveEffect(pathname, callback) {
    if (!activeEffectMap.get(pathname)) {
      activeEffectMap.set(pathname, [callback])
    }
    else {
      activeEffectMap.get(pathname)?.push(callback)
    }
  },

  delActiveEffect: (pathname?: string) => {
    pathname
      ? activeEffectMap.delete(pathname)
      : activeEffectMap.clear()
  },
  delDeactiveEffect: (pathname?: string) => {
    pathname
      ? deactiveEffectMap.delete(pathname)
      : deactiveEffectMap.clear()
  },
}

export const KeepAliveRouteCtx = createContext<KeepAliveRouteCtxType>(KeepAliveRouteCtxVal)

export interface KeepAliveRouteCtxType {
  registerActiveEffect: (key: string, callback: VoidFunction) => void
  registerDeactiveEffect: (key: string, callback: VoidFunction) => void

  delActiveEffect: (key?: string) => void
  delDeactiveEffect: (key?: string) => void
}
