/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useRef } from 'react'
import { useRefresh } from '../lifecycle'
import type { useGetState } from './useGetState'

/**
 * 类似 Vue 的 ref 用法，修改 `.current` 直接刷新
 * ### 请调用 useGenRefState 来创建带有缓存的 useRefState
 * @param initState 初始值
 * @param refreshFn 刷新函数，可选。这样就能在单组件里使用多个 `useRefState`
 */
function useRefState<T>(
  initState: T,
  refreshFn = useRefresh(),
) {
  const state = useRef<T>(initState)
  const proxyState = useMemo(
    () =>
      new Proxy(state, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver)
        },
        set(target, prop, value, receiver) {
          if (prop !== 'current' || target[prop] === value) {
            return true
          }

          const flag = Reflect.set(target, prop, value, receiver)
          refreshFn()
          return flag
        },
      }),
    [refreshFn],
  )

  return proxyState
}

/**
 * 创建带有缓存的 useRefState，类似 Vue ref 的写法
 *
 * **推荐使用 {@link useGetState} 替代**：useGetState 基于标准 useState，
 * 无 Hooks 调用顺序限制，支持对象自动合并、reset、getLatest，适用面更广
 * 本 hook 仅适合需要 `ref.current = value` 赋值写法的特殊场景
 *
 * **注意**：返回的函数内部调用了 Hooks（useRef、useMemo），
 * 必须在组件顶层以固定次数和顺序调用，严禁在条件分支或循环中使用
 *
 * @example
 * ```ts
 * const useRefState = useGenRefState()
 * // ✅ 顶层固定调用
 * const count = useRefState(0)
 * const name = useRefState('')
 *
 * // ❌ 禁止在条件/循环中调用
 * // if (condition) { const val = useRefState(0) }
 * ```
 */
export function useGenRefState() {
  const refreshFn = useRefresh()

  return <T>(initState: T) => {
    return useRefState(initState, refreshFn)
  }
}
