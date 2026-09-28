import { useEffect, useRef } from 'react'

type EffectFn = Parameters<typeof useEffect>[0]

type EffectOpts = {
  /**
   * 传入自定义的 effect 函数
   */
  effectFn?: EffectFn
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
