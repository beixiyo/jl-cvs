import type { SetterFnWittGetLatest, SetterParam, UseGetStateReturn } from './types'
import { deepClone, isFn, isObj } from '@jl-org/tool'

/**
 * - 让你能用 getter 获取最新的 state，而不用使用回调，这在逻辑拆分非常有用
 * - 在 setState 对象时，会自动合并对象
 * - 可以调用 setState.reset 方法重置回初始值
 * @param initState 初始值
 * @param enableGetter 是否启用 getter，默认 false
 *
 * @example
 * ```ts
 * const [count, setCount] = useGetState(0, true)
 *
 * setCount(count + 1, true)
 * // getLatest 获取最新值
 * console.log(count, setCount.getLatest())  // 0 1
 *
 * // ================================================
 *
 * const [data, setData] = useGetState({ a: 1, b: 2 })
 * setData({ a: 9 })  // 自动合并为 { a: 9, b: 2 }
 * setData.reset()    // 重置回初始值 { a: 1, b: 2 }
 *
 * // ================================================
 *
 * // 开启 getter
 * const [data, setData] = useGetState({ a: 1, b: 2 }, true)
 *
 * const latestState = setData.getLatest()
 * latestState.a = 99
 * setData(latestState)
 * console.log(setData.getLatest())  // { a: 99, b: 2 }
 * ```
 */
export function useGetState<T, V extends boolean = false>(
  initState: T,
  enableGetter: V = false as V,
): UseGetStateReturn<T, V> {
  const getInitData = useCallback(() => deepClone(initState), [initState])
  const stateRef = useRef<T>(getInitData())
  const [state, setState] = useState<T>(stateRef.current)

  const setter = useCallback((value: SetterParam<T>) => {
    const newVal = value as any

    /** 处理函数类型的 value */
    if (isFn(newVal)) {
      /** 记录值 */
      if (enableGetter) {
        const res = newVal(stateRef.current)

        /** 如果返回值是对象，则自动合并 */
        if (isObj(res)) {
          const merged = { ...stateRef.current, ...res }
          stateRef.current = merged
          setState(merged)

          return
        }

        setState(res)
        stateRef.current = res

        return
      }

      setState((prevState) => {
        const res = newVal(prevState)

        if (isObj(res)) {
          return { ...prevState, ...res }
        }
        return res
      })

      return
    }

    /** 自动合并对象 */
    if (isObj(newVal)) {
      /** 记录值 */
      if (enableGetter) {
        const res = { ...stateRef.current, ...newVal }
        stateRef.current = res
        setState(res)

        return
      }

      setState(prevState => ({ ...prevState, ...newVal }))

      return
    }

    /**
     * 基本数据类型 value
     * 记录值
     */
    if (enableGetter) {
      setState(newVal)
      stateRef.current = newVal
      return
    }

    setState(newVal)
  }, [enableGetter])

  if (enableGetter) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (setter as SetterFnWittGetLatest<T>).getLatest = useCallback(() => deepClone(stateRef.current), [])
  }

  (setter as SetterFnWittGetLatest<T>).reset = useCallback(() => {
    setState(getInitData())
    stateRef.current = getInitData()
  }, [getInitData])

  return [state, setter] as UseGetStateReturn<T, V>
}
