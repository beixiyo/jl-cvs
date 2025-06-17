import type { CSSProperties } from 'react'
import type { SetStateParam } from './types'
import { debounce, isBrowser, isFn, throttle } from '@jl-org/tool'
import { useMemo, useState } from 'react'
import { flushSync } from 'react-dom'

/**
 * 返回一个状态值和一个切换状态值的函数
 */
export function useToggle(initState = false) {
  const [state, setState] = useState(initState)
  const toggle = (val?: boolean) => {
    if (val != undefined) {
      setState(val)
      return
    }

    setState(val => !val)
  }

  return [state, toggle] as const
}

/**
 * 节流 useState
 * @param initState 初始值
 * @param delayMS 节流时间
 */
export function useThrottle<T>(initState: T, delayMS: number = 500) {
  const [state, _setState] = useState<T>(initState)
  const setState = (useMemo(
    () => {
      return throttle(_setState, delayMS)
    },
    [],
  )
  ) as unknown as typeof _setState

  return [
    state,
    setState,
  ] as const
}

/**
 * 防抖 useState
 * @param initState 初始值
 * @param delayMS 防抖时间
 */
export function useDebounce<T>(initState: T, delayMS: number = 500) {
  const [state, _setState] = useState<T>(initState)
  const setState = (useMemo(
    () => {
      return debounce(_setState, delayMS)
    },
    [],
  )
  ) as unknown as typeof _setState

  return [
    state,
    setState,
  ] as const
}

/**
 * 监听值，设置时使用防抖
 * @param value 监听的值
 * @param delayMS 防抖时间
 */
export function useWatchDebounce<T>(value: T, delayMS: number = 500) {
  const [state, setState] = useDebounce<T>(value, delayMS)
  useEffect(
    () => {
      setState(value)
    },
    [value, setState],
  )
  return state
}

/**
 * 监听值，设置时使用节流
 * @param value 监听的值
 * @param delayMS 节流时间
 */
export function useWatchThrottle<T>(value: T, delayMS: number = 500) {
  const [state, setState] = useThrottle<T>(value, delayMS)
  useEffect(
    () => {
      setState(value)
    },
    [value, setState],
  )
  return state
}

/**
 * Vue v-show
 * @example
 * ```ts
 * style={{
 *   ...vShow(loading)
 * }}>
 * ```
 */
export function vShow(
  show: boolean,
  opts: { visibility?: boolean } = {},
): CSSProperties {
  if (opts.visibility) {
    return show
      ? { visibility: 'visible' }
      /**
       * 不显示元素，大小拉满，但不占位置
       * 适用于隐藏元素，但不影响布局计算情况
       */
      : {
          visibility: 'hidden',
          position: 'absolute',
          zIndex: -99,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }
  }

  return show
    ? {}
    : { display: 'none' }
}

export function useConst<T>(value: T | (() => T)) {
  const refValue = useRef<T>(
    isFn(value)
      ? value()
      : value,
  )
  return refValue.current
}

export function useWatchRef<T>(state: T) {
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  return stateRef
}

const isViewTransitionSupported = isBrowser && !!document.startViewTransition
/**
 * 实现 View Transition 动画的 useState
 */
export function useViewTransitionState<T>(initState: T | (() => T)) {
  const [state, setState] = useState<T>(initState)

  const setTransiton = (val: SetStateParam<T>) => {
    if (!isViewTransitionSupported) {
      setState(val)
      return
    }

    document.startViewTransition(() => {
      flushSync(() => setState(val))
    })
  }

  return [state, setTransiton] as const
}
