/* eslint-disable react-hooks/rules-of-hooks */
import { useRefresh } from './lifecycle'

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
    () => new Proxy(state, {
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
 * @returns 创建带有缓存的 useRefState
 * @example
 * ```ts
 * const useRefState = useGenRefState()
 * const count = useRefState(0)
 * ```
 */
export function useGenRefState() {
  const refreshFn = useRefresh()

  return <T>(initState: T) => {
    return useRefState(initState, refreshFn)
  }
}
