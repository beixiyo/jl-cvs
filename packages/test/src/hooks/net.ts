import type { UseReqOpts } from './types'
import { useCallback, useEffect, useState } from 'react'

/**
 * 管理异步请求的状态，会自动设置数据、加载状态等
 * @param requestFn 一个返回 Promise 的函数，用于执行异步请求
 * @returns 返回一个对象，包含加载状态、数据、错误和请求触发函数
 */
export function useReq<T>(
  requestFn: () => Promise<T>,
  opts: UseReqOpts<T>,
) {
  const [loading, setLoading] = useState(opts.initLoading)
  const [data, setData] = useState<T | undefined>(opts.initData)
  const [error, setError] = useState<Error>()

  const request = async () => {
    setLoading(true)
    opts.setLoading?.(true)

    try {
      const data = await requestFn()
      setData(data)
      opts.onSuccess?.(data)
    }
    catch (error) {
      setError(error as Error)
      opts.onError?.(error)
    }
    finally {
      setLoading(false)
      opts.setLoading?.(false)
      opts.onFinally?.()
    }
  }

  return {
    loading,
    data,
    error,
    request: useCallback(request, [requestFn]),
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
    request()
  }, watchDeps)

  return {
    loading,
    data,
    error,
    request,
  }
}
