import type { MutableRefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useWatchRef } from './state'

/**
 * @param els 观察的元素数组，你无需用 useMemo 处理
 * @param callback 回调函数，你无需用 useCallback 处理
 */
export function useIntersectionObserver<E extends HTMLElement>(
  els: Refs<E>,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit,
) {
  return useOb(IntersectionObserver, els, callback, options)
}

/**
 * @param els 观察的元素数组，你无需用 useMemo 处理
 * @param callback 回调函数，你无需用 useCallback 处理
 */
export function useResizeObserver<E extends HTMLElement>(
  els: Refs<E>,
  callback: (entry: ResizeObserverEntry) => void,
) {
  return useOb(ResizeObserver, els, callback)
}

/**
 * @param callback 回调函数，你无需用 useCallback 处理
 */
export function useMutationObserver<E extends HTMLElement>(
  el: MutableRefObject<E | null>,
  callback: MutationCallback,
  options: MutationObserverInit & { immediate?: boolean } = {},
) {
  const latestCallback = useWatchRef(callback)

  useEffect(
    () => {
      const element = el.current
      if (!element)
        return

      let ob: MutationObserver | null = null
      const { immediate = true, ...obOptions } = options

      /** 在挂载时立即调用一次回调，以处理初始状态 */
      if (immediate) {
        latestCallback.current([], ob = new MutationObserver(latestCallback.current))
      }

      if (!ob) {
        ob = new MutationObserver(latestCallback.current)
      }
      ob.observe(element, {
        childList: true,
        subtree: true,
        characterData: true,
        ...obOptions,
      })

      return () => {
        ob.disconnect()
      }
    },
    /** 依赖于 ref.current，当元素挂载、卸载或替换时，effect 会重新运行 */
    [el.current, options],
  )
}

/**
 * @param els 观察的元素数组，你无需用 useMemo 处理
 * @param callback 回调函数，你无需用 useCallback 处理
 */
function useOb<
  C extends new (
    callback: (entries: T[], observer: InstanceType<C>) => void,
    options?: any
  ) => {
    observe: (target: HTMLElement) => void
    unobserve: (target: HTMLElement) => void
    disconnect: () => void
  },
  T,
  E extends HTMLElement,
>(
  ObserverClass: C,
  els: Refs<E>,
  callback: (entry: T) => void,
  options?: ConstructorParameters<C>[1],
) {
  const ob = useRef<InstanceType<C>>()
  const latestCallback = useWatchRef(callback)

  const elements = useMemo(
    () => els.map(el => el.current).filter(Boolean) as E[],
    [...els.map(el => el.current)],
  )

  useEffect(() => {
    if (elements.length === 0)
      return

    // @ts-expect-error - The constructor signature is generic and works.
    ob.current = new ObserverClass(
      (entries: T[]) => {
        entries.forEach(latestCallback.current)
      },
      options,
    )

    elements.forEach(el => ob.current?.observe(el))

    return () => {
      ob.current?.disconnect()
    }
  }, [options, elements, ObserverClass])

  return ob
}

export type Refs<E> = MutableRefObject<(E | null | undefined)>[]
