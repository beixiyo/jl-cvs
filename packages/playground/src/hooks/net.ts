import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLatestRef } from './ref'
import type { UseReqOpts } from './types'

/**
 * 管理异步请求的状态，会自动设置数据、加载状态等
 *
 * 注意：默认（rethrow !== false）请求失败时除了触发 onError，还会向调用方 rethrow，
 * 以便调用方（如乐观更新场景）能感知失败并回滚；
 * 直接调用 request 而不处理 Promise 时需自行 catch，或传 `rethrow: false` 关闭
 * @param requestFn 一个返回 Promise 的函数，用于执行异步请求
 * @returns 返回一个对象，包含加载状态、数据、错误和请求触发函数
 */
export function useReq<T, P extends any[] = any[]>(
  requestFn: (...args: P) => Promise<T>,
  opts: UseReqOpts<T>,
) {
  const watchRequestFn = useLatestRef(requestFn)
  const watchOpts = useLatestRef(opts)

  const [loading, setLoading] = useState(opts.initLoading)
  const [data, setData] = useState<T | undefined>(opts.initData)
  const [error, setError] = useState<Error>()

  /** 请求计数器，用于丢弃过期响应 */
  const requestIdRef = useRef(0)

  const request = useCallback(async (...args: P) => {
    /** 单次请求使用触发时的配置，保证 setLoading/onFinally 等生命周期回调成对 */
    const requestOpts = watchOpts.current
    const id = ++requestIdRef.current
    setLoading(true)
    requestOpts.setLoading?.(true)

    try {
      const data = await watchRequestFn.current(...args)
      /** 丢弃过期请求的响应 */
      if (id !== requestIdRef.current) return
      setData(data)
      requestOpts.onSuccess?.(data)
    }
    catch (error) {
      /** 过期请求的失败同样丢弃，不向调用方传播 */
      if (id !== requestIdRef.current) return
      setError(error as Error)
      requestOpts.onError?.(error)
      /** 默认 rethrow 让调用方感知失败（如乐观更新回滚），可通过 rethrow: false 关闭 */
      if (requestOpts.rethrow !== false) throw error
    }
    finally {
      if (id === requestIdRef.current) {
        setLoading(false)
        requestOpts.setLoading?.(false)
        requestOpts.onFinally?.()
      }
    }
  }, [watchOpts, watchRequestFn])

  return {
    loading,
    data,
    error,
    request,
  }
}

/**
 * 管理异步请求的状态，并在依赖项变化时自动触发请求，会自动设置数据、加载状态等
 * @param requestFn 一个返回 Promise 的函数，用于执行异步请求
 * @param watchDeps 依赖项数组，当依赖项变化时，将触发请求
 * @returns 返回一个对象，包含加载状态、数据、错误和请求触发函数
 *
 * @example
 * ```ts
 * const { loading, data, error } = useWatchReq(fetchData, [url])
 * ```
 */
export function useWatchReq<T>(
  requestFn: () => Promise<T>,
  watchDeps: any[] = [],
  opts: UseReqOpts<T>,
) {
  const {
    loading,
    data,
    error,
    request,
  } = useReq(requestFn, opts)

  useEffect(() => {
    /** 错误已经由 error 状态与 onError 暴露，此处吞掉避免 unhandled rejection */
    request().catch(() => {})
  }, watchDeps)

  return {
    loading,
    data,
    error,
    request,
  }
}

/**
 * 订阅浏览器在线 / 离线状态
 *
 * 断网时返回 `false`，恢复联网返回 `true`；SSR / 无 window 环境按在线处理
 * 用 `useSyncExternalStore` 直接读 `navigator.onLine`，避免自维护 state 与事件不同步
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)

  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}
