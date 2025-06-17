import type { KeepAliveContextType } from './type'
import { createContext } from 'react'

const activeEffectMap = new Map<keyof any, Function[]>()
const deactiveEffectMap = new Map<keyof any, Function[]>()

export const KeepAliveCtxVal: KeepAliveContextType = {
  findEffect: key => ({
    activeEffect: key
      ? activeEffectMap.get(key) || []
      : [],
    deactiveEffect: key
      ? deactiveEffectMap.get(key) || []
      : [],
  }),

  delActiveEffect(key) {
    key
      ? activeEffectMap.delete(key)
      : activeEffectMap.clear()
  },
  delDeactiveEffect(key) {
    key
      ? deactiveEffectMap.delete(key)
      : deactiveEffectMap.clear()
  },

  registerActiveEffect: (key, callback) => {
    if (!activeEffectMap.get(key)) {
      activeEffectMap.set(key, [callback])
    }
    else {
      activeEffectMap.get(key)?.push(callback)
    }
  },
  registerDeactiveEffect: (key, callback) => {
    if (!deactiveEffectMap.get(key)) {
      deactiveEffectMap.set(key, [callback])
    }
    else {
      deactiveEffectMap.get(key)?.push(callback)
    }
  },
}

export const KeepAliveContext = createContext<KeepAliveContextType>(KeepAliveCtxVal)
