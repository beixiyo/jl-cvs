import { bindWinEvent } from '@jl-org/tool'
import { useEffect, useRef } from 'react'
import { useLatestCallback, useStable } from '../memo'
import { useLatestRef } from '../ref'

/**
 * 监听窗口隐藏
 * @param hiddenFn 窗口隐藏时执行的函数
 * @param showFn 窗口显示时执行的函数
 */
export function useOnWinHidden(
  hiddenFn: VoidFunction,
  showFn?: VoidFunction,
) {
  const watchHiddenFn = useLatestRef(hiddenFn)
  const watchShowFn = useLatestRef(showFn)

  useEffect(() => {
    const fn = () => {
      const isHidden = document.visibilityState === 'hidden'
      if (isHidden) {
        watchHiddenFn.current()
        return
      }

      const isVisible = document.visibilityState === 'visible'
      if (isVisible && watchShowFn.current) {
        watchShowFn.current()
      }
    }

    document.addEventListener('visibilitychange', fn)

    return () => {
      document.removeEventListener('visibilitychange', fn)
    }
  }, [watchHiddenFn, watchShowFn])
}

/**
 * 绑定 window/document/element 事件，卸载时自动解绑
 * `deps` 仅表示「需要重新走一遍 add/remove 的订阅周期」的条件（如开关、与布局相关的 id）
 * @returns 手动解绑函数（与 effect 清理共用同一条 `bindWinEvent` 返回的解绑逻辑）
 */
export function useBindWinEvent<
  Target extends Window | Document | Element = Window,
  K extends keyof EventMap<Target> = keyof EventMap<Target>,
>(config: UseBindWinEventOptions<K, Target>) {
  const {
    eventName,
    listener,
    deps = [],
    options,
    enabled = true,
    target = typeof window !== 'undefined'
      ? window
      : undefined,
  } = config
  const listenerRef = useLatestRef(listener)
  const stableOptions = useStable(options)
  const stableDeps = useStable(deps)
  const unbindRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!enabled || !target) {
      unbindRef.current = null
      return
    }

    function delegated(this: Target, ev: EventMap<Target>[K]) {
      const cb = listenerRef.current as unknown as (this: Target, ev: EventMap<Target>[K]) => unknown
      cb.call(this, ev)
    }

    const unBind = bindWinEvent(
      eventName as any,
      delegated as any,
      stableOptions,
      target as any,
    )
    unbindRef.current = unBind
    return () => {
      unBind()
      unbindRef.current = null
    }
  }, [eventName, stableOptions, stableDeps, enabled, target])

  return useLatestCallback(() => {
    unbindRef.current?.()
  })
}

type EventMap<T> = T extends Window ? WindowEventMap
  : T extends Document ? DocumentEventMap
  : HTMLElementEventMap

/**
 * `useBindWinEvent` 的配置项
 */
export interface UseBindWinEventOptions<
  K extends keyof EventMap<Target>,
  Target extends Window | Document | Element = Window,
> {
  /** 事件名称 */
  eventName: K
  /**
   * 事件回调（内部经 `useLatestRef` 转发，无需再包 `useCallback`）
   */
  listener: (this: Target, ev: EventMap<Target>[K]) => void
  /**
   * 与重新绑定相关的依赖（深度稳定化，避免新数组引用导致无意义重绑）
   * @default []
   */
  deps?: unknown[]
  /** `addEventListener` 第三参（与 `bindWinEvent` 一致） */
  options?: boolean | AddEventListenerOptions
  /**
   * 为 `false` 时不注册监听
   * @default true
   */
  enabled?: boolean
  /**
   * 监听目标，默认 `window`
   */
  target?: Target
}
