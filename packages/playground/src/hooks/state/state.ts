import { debounce, throttle } from '@jl-org/tool'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLatestRef } from '../ref'
import type { SetStateParam } from '../types'

/**
 * 返回一个状态值和一个切换状态值的函数
 */
export function useToggleState(initState = false) {
  const [state, setState] = useState(initState)
  const toggle = (val?: boolean) => {
    if (val != undefined) {
      setState(val)
      return
    }

    setState((val) => !val)
  }

  return [state, toggle] as const
}

/**
 * 节流 useState
 * @param initState 初始值
 * @param delayMS 节流时间
 */
export function useThrottleState<T>(initState: T, delayMS: number = 500) {
  const [state, _setState] = useState<T>(initState)
  const setState = (useMemo(
    () => {
      return throttle(_setState, delayMS)
    },
    [delayMS],
  )) as unknown as typeof _setState

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
export function useDebounceState<T>(initState: T, delayMS: number = 500) {
  const [state, _setState] = useState<T>(initState)
  const setState = (useMemo(
    () => {
      return debounce(_setState, delayMS)
    },
    [delayMS],
  )) as unknown as typeof _setState

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
export function useWatchDebounceState<T>(value: T, delayMS: number = 100) {
  const [state, setState] = useDebounceState<T>(value, delayMS)
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
export function useWatchThrottleState<T>(value: T, delayMS: number = 100, options: useWatchThrottleStateOptions = {}) {
  const {
    enable = true,
    syncLastValueTime = 1000,
  } = options

  const actualSyncLastValueTime = Math.max(syncLastValueTime, delayMS + 2)
  const timerRef = useRef<number | null>(null)
  const [state, setState] = useThrottleState<T>(value, delayMS)

  useEffect(
    () => {
      if (enable) {
        setState(value)
      }

      timerRef.current = window.setTimeout(() => {
        setState(value)
      }, actualSyncLastValueTime)

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    },
    [value, setState, enable, actualSyncLastValueTime],
  )

  return enable
    ? state
    : value
}

/**
 * 防抖回调函数，并在依赖变化时执行
 * - 返回的函数可带参调用；依赖变化时 effect 会无参触发一次（适合无参或可从闭包取值的场景）
 * @param fn 需要防抖的函数
 * @param options 配置项
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  options: UseDebounceFnOptions = {},
): (...args: Parameters<T>) => void {
  const { delay = 500 } = options
  const latestFn = useLatestRef(fn)
  const debounced = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        latestFn.current(...args)
      }, delay),
    [delay],
  )

  return debounced as (...args: Parameters<T>) => void
}

/**
 * 节流回调函数，并在依赖变化时执行
 * - 返回的函数可带参调用；依赖变化时 effect 会无参触发一次（适合无参或可从闭包取值的场景）
 * @param fn 需要节流的函数
 * @param options 配置项
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  options: UseThrottleFnOptions = {},
): (...args: Parameters<T>) => void {
  const { delay = 500 } = options
  const latestFn = useLatestRef(fn)
  const throttled = useMemo(
    () =>
      throttle((...args: Parameters<T>) => {
        latestFn.current(...args)
      }, delay),
    [delay],
  )

  return throttled as (...args: Parameters<T>) => void
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

const isViewTransitionSupported = typeof document !== 'undefined'
  && typeof document.startViewTransition === 'function'
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

export type useWatchThrottleStateOptions = {
  /**
   * @default true
   */
  enable?: boolean
  /**
   * 同步最新值的时间（毫秒 MS）
   * @default 1000
   */
  syncLastValueTime?: number
}

export interface UseDebounceFnOptions {
  /**
   * 防抖时间
   * @default 500
   */
  delay?: number
}

export type UseThrottleFnOptions = UseDebounceFnOptions
