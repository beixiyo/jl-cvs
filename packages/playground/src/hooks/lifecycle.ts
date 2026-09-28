/* eslint-disable react-hooks/rules-of-hooks */
import type { DependencyList, useInsertionEffect, useLayoutEffect } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatestRef } from './ref'

/**
 * @returns 强制刷新函数
 */
export function useRefresh() {
  const [, refresh] = useState(0)
  return useCallback(() => refresh((s) => s + 1), [])
}

/**
 * 通用 Effect 构造器，支持异步、立即执行控制、执行次数控制及 Hook 切换
 *
 * @param fn - 执行的函数，支持返回同步或异步的清理函数
 * @param deps - 依赖数组
 * @param options - 配置项
 *
 * @example
 * ```ts
 * // 支持异步逻辑与异步清理
 * useCustomEffect(async () => {
 *   const data = await fetchData()
 *   return () => console.log('cleanup', data)
 * }, [id])
 *
 * // 跳过首次执行
 * useCustomEffect(() => {
 *   console.log('updated')
 * }, [count], { immediate: false })
 *
 * // 只执行一次
 * useCustomEffect(() => {
 *   console.log('run once')
 * }, [count], { once: true })
 *
 * // 自定义 effect
 * useCustomEffect(() => {
 *   console.log('layout effect')
 * }, [], { effect: useLayoutEffect })
 * ```
 */
export function useCustomEffect(
  fn: () => any | Promise<any>,
  deps?: DependencyList,
  options: CreateEffectOptions = {},
) {
  const {
    effect = useEffect,
    immediate = true,
    once = false,
  } = options

  const isFirstRender = useRef(true)
  const hasRun = useRef(false)
  const fnRef = useLatestRef(fn)

  effect(() => {
    /** 处理非立即执行（首次挂载跳过） */
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (!immediate) return
    }

    /** 处理 once */
    if (once && hasRun.current) return

    const result = fnRef.current()
    hasRun.current = true

    /**
     * 支持异步 cleanup 或同步 cleanup
     *
     * 注意：异步 cleanup 在 Promise resolve 后执行，
     * 新 effect 可能在旧 cleanup 之前运行，涉及资源清理时需注意时序
     */
    if (result instanceof Promise) {
      return () => {
        result.then((cleanup) => {
          if (typeof cleanup === 'function') cleanup()
        }).catch((err) => {
          console.error('[useCustomEffect] Async cleanup error:', err)
        })
      }
    }

    if (typeof result === 'function') return result
  }, deps)
}

/**
 * 挂载生命周期
 */
export function onMounted(fn: () => any | Promise<any>) {
  return useCustomEffect(fn, [])
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
  fn: () => any | Promise<any>,
  deps: DependencyList = [],
  options: Omit<CreateEffectOptions, 'immediate'> = {},
) {
  return useCustomEffect(fn, deps, { ...options, immediate: false })
}

export type EffectFn = Parameters<typeof useEffect>[0]
export type EffectHook = typeof useEffect | typeof useLayoutEffect | typeof useInsertionEffect

export interface CreateEffectOptions {
  /**
   * 使用哪个 effect hook
   * @default useEffect
   */
  effect?: EffectHook
  /**
   * 是否立即执行（如果是 false，则在首次挂载时不执行，类似 useUpdateEffect）
   * @default true
   */
  immediate?: boolean
  /**
   * 是否只执行一次
   * @default false
   */
  once?: boolean
}
