'use client'

import type { Ref, RefObject } from 'react'
import { useCallback, useEffect, useInsertionEffect, useRef } from 'react'

/**
 * 通用的 ref 合并 Hook
 *
 * 用于同时支持外部 forwardRef 和内部 ref 需求，并可选择性地提供生命周期回调
 *
 * @example
 * ```tsx
 * const MyComponent = forwardRef<HTMLDivElement, Props>((props, ref) => {
 *   const { setRef, elementRef } = useComposedRef({
 *     ref,
 *     onMounted: (node) => { console.log('mounted', node) },
 *     onUnmounted: () => { console.log('unmounted') }
 *   })
 *
 *   return <div ref={setRef}>...</div>
 * })
 * ```
 *
 * @template T - ref 指向的元素类型
 * @param options - 配置项
 * @returns - setRef 用于绑定到元素，elementRef 为内部使用的 ref 对象
 */
export function useComposedRef<T extends HTMLElement = HTMLElement>(options: {
  /** 外部传入的 ref（来自 forwardRef） */
  ref: Ref<T> | undefined
  /** 注册回调，当元素挂载/更新时调用 */
  onMounted?: (node: T | null) => void
  /** 注销回调，当组件卸载时调用 */
  onUnmounted?: () => void
}) {
  const { ref, onMounted, onUnmounted } = options

  /** 本地 ref，用于组件内部使用 */
  const elementRef = useRef<T | null>(null)

  /** 合并转发 ref 与本地 ref，并调用 onMounted 回调 */
  const setRef = useCallback(
    (node: T | null) => {
      /** 保存到本地 ref */
      elementRef.current = node

      /** 转发给外部 ref */
      if (typeof ref === 'function') {
        ref(node)
      }
      else if (ref && 'current' in ref) {
        ;(ref as RefObject<T | null>).current = node
      }

      /** 调用挂载回调 */
      if (onMounted) {
        try {
          onMounted(node)
        }
        catch {
          /** 忽略回调错误 */
        }
      }
    },
    [ref, onMounted],
  )

  /** 在卸载时调用注销回调 */
  useEffect(() => {
    return () => {
      if (onUnmounted) {
        try {
          onUnmounted()
        }
        catch {
          /** 忽略回调错误 */
        }
      }
    }
  }, [onUnmounted])

  return {
    /** 用于赋值给元素的 ref 属性 */
    setRef,
    /** 内部使用的 ref，方便组件内部访问 DOM 元素 */
    elementRef,
  }
}

/**
 * 监听值，返回始终指向最新值的 ref
 *
 * @remarks
 * 用 `useInsertionEffect` 而非 `useEffect` 同步：它在 commit 期、早于 layout/passive effect 执行，
 * 所以 ref 在 `useLayoutEffect` 阶段就已是最新值（passive 同步则要等到 paint 之后，layout 期会读到旧一帧）
 * 这让基于它的 `useLatestCallback` 也能安全地在 layout effect 里调用，语义更贴近官方 `useEffectEvent`
 *
 * 不在 render 中直接赋值：React 要求 render 保持纯净，否则并发模式下被丢弃的 render 也可能污染 ref
 * React 官方将 `useInsertionEffect` 定位为 CSS-in-JS 库 API，并明确其执行时不能依赖 DOM 或宿主 ref
 * 是否已更新。本 Hook 只写普通数据 ref，不读取 DOM；后续不得在这里加入 DOM 访问
 * React 19.2.7 的 `useEffectEvent` 同样不会在 render 中覆盖实现，而是在 commit 的 before-mutation
 * 阶段切换到 `nextImpl`
 *
 * 注意：仍**无法**让 setState 后的同一调用栈或渲染期读到新值。需要同步读取时，应在 setter 中同步维护 ref；
 * 渲染期派生值则直接计算，或使用 `useMemo`/`useCallback`
 *
 * @param state 监听的值
 * @returns 始终指向最新值的 ref
 * @see {@link https://react.dev/reference/react/useRef#pitfall | React useRef：render 期间不得读写 ref}
 * @see {@link https://react.dev/reference/react/useInsertionEffect#caveats | React useInsertionEffect：官方限制}
 * @see {@link https://github.com/facebook/react/blob/v19.2.7/packages/react-reconciler/src/ReactFiberCommitWork.js#L489-L506 | React 19.2.7 useEffectEvent 的 commit 实现}
 */
export function useLatestRef<T>(state: T) {
  const stateRef = useRef(state)
  useInsertionEffect(() => {
    stateRef.current = state
  }, [state])

  return stateRef
}
