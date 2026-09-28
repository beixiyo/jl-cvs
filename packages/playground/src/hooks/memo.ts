import { deepCompare, isFn } from '@jl-org/tool'
import { useCallback, useRef } from 'react'
import { useLatestRef } from './ref'

/**
 * 始终能获取最新值的 useCallback，无闭包陷阱
 */
export function useLatestCallback<T extends (...args: any[]) => any>(fn: T) {
  const latestFn = useLatestRef(fn)

  return useCallback((...args: Parameters<T>) => {
    return latestFn.current(...args)
  }, [latestFn]) as T
}

export function useConst<T>(value: T | (() => T)) {
  const refValue = useRef<T>(
    isFn(value)
      ? value()
      : value,
  )
  return refValue.current
}

/**
 * 稳定化对象，只有当对象内容变化时才更新引用
 * 解决在 useEffect 依赖中直接传入对象字面量导致的重复执行问题
 */
export function useStable<T>(obj: T): T {
  const ref = useRef(obj)

  if (!deepCompare(ref.current, obj)) {
    ref.current = obj
  }

  return ref.current
}
