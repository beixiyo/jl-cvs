/* eslint-disable react-hooks/rules-of-hooks */

/**
 * @returns 强制刷新函数
 */
export function useRefresh() {
  const [_, refresh] = useState({})
  return useCallback(() => refresh({}), [])
}

/**
 * 挂载生命周期
 */
export function onMounted(fn: EffectFn) {
  return useEffect(fn, [])
}

/**
 * 卸载生命周期
 */
export function onUnmounted(fn: ReturnType<EffectFn>) {
  return useEffect(() => {
    return fn
  }, [])
}

/**
 * 只在更新时执行，首次挂载不执行的 useEffect
 */
export function useUpdateEffect(
  fn: EffectFn,
  deps: any[] = [],
  options: EffectOpts = {},
) {
  const { effectFn = useEffect } = options
  const isFirstRender = useRef(true)

  return effectFn(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    return fn()
  }, deps)
}

/**
 * 支持异步的 useEffect
 * @param onlyRunInUpdate 是否只在更新时执行，首次挂载不执行
 */
export function useAsyncEffect(
  fn: () => Promise<any>,
  deps: any[] = [],
  options: EffectOpts & { onlyRunInUpdate?: boolean } = {},
) {
  const {
    onlyRunInUpdate = false,
    effectFn = useEffect,
  } = options
  const isFirstRender = useRef(true)

  return effectFn(() => {
    if (isFirstRender.current && onlyRunInUpdate) {
      isFirstRender.current = false
      return
    }

    const clean = fn()

    return () => {
      clean.then((fn) => {
        fn?.()
      })
    }
  }, deps)
}

type EffectFn = Parameters<typeof useEffect>[0]

type EffectOpts = {
  /**
   * useEffect | useLayoutEffect ...
   * @default useEffect
   */
  effectFn?: typeof useEffect
}
