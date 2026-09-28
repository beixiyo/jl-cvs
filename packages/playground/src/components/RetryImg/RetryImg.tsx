'use client'

import { useCustomEffect, useLatestCallback } from '@/hooks'
import { addTimestampParam, cn } from '@/utils'
import { getImg, retryTask } from '@jl-org/tool'
import { memo, useRef, useState } from 'react'
import type { RetryImgProps, RetryImgStatus } from './types'

export const RetryImg = memo<RetryImgProps>((
  {
    style,
    className,
    src,
    retryCount = 3,
    fallback,
    onRetrySuccess,
    onRetryFail,
    ...rest
  },
) => {
  const [url, setUrl] = useState(src)
  const [key, setKey] = useState(0)
  const [status, setStatus] = useState<RetryImgStatus>('loading')

  /** 当前生效的 src，用于在异步重试结束后判断是否已被新的 src 覆盖（避免竞态回写） */
  const latestSrcRef = useRef(src)

  const handleRetrySuccess = useLatestCallback((finalUrl: string) => {
    onRetrySuccess?.(finalUrl)
  })
  const handleRetryFail = useLatestCallback(() => {
    onRetryFail?.()
  })

  useCustomEffect(
    async () => {
      latestSrcRef.current = src
      setStatus('loading')

      try {
        const newUrl = await retryTask(async () => {
          /** 重试时追加缓存破坏参数，避免命中失败图片的浏览器缓存导致重试无效 */
          const requestUrl = addTimestampParam(src)
          const img = await getImg(requestUrl)
          if (!img) {
            return Promise.reject(new Error('image load failed'))
          }

          return requestUrl
        }, retryCount)

        /** 旧 src 的异步结果不应覆盖最新 src */
        if (latestSrcRef.current !== src) return

        setUrl(newUrl)
        setKey((prev) => prev + 1)
        setStatus('success')
        handleRetrySuccess(newUrl)
      }
      catch {
        /** 所有重试均失败 */
        if (latestSrcRef.current !== src) return

        setStatus('error')
        handleRetryFail()
      }
    },
    [src],
  )

  /** 全部重试失败且提供了 fallback 时，渲染兜底内容 */
  if (status === 'error' && fallback !== undefined) return <>{ fallback }</>

  return (
    <img
      key={ key }
      className={ cn(
        'RetryImgContainer',
        className,
      ) }
      style={ style }
      src={ url }
      { ...rest }
    />
  )
})

RetryImg.displayName = 'RetryImg'
