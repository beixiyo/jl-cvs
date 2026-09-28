/** 组合 LazyImg 的视口预加载与浏览器图片事件 */

import { useLatestCallback } from '@/hooks'
import type React from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { LazyImgResolveContext, LazyImgResolvedSource, LazyImgSource } from '../types'
import { markImageAsLoaded } from '../utils'
import { observeImageVisibility } from '../utils/imageVisibilityObserver'
import { useImageSource } from './useImageSource'

const useIsomorphicLayoutEffect = typeof window === 'undefined'
  ? useEffect
  : useLayoutEffect

/** 管理图片元素从进入预加载范围到浏览器加载完成的交互 */
export function useLazyImage(options: UseLazyImageOptions) {
  const {
    source,
    sourceKey: customSourceKey,
    lazy,
    resolveSource,
    onResolveError,
    onDisposeError,
    onLoad,
    onError,
  } = options
  const imgRef = useRef<HTMLImageElement>(null)
  const {
    sourceKey,
    status,
    resolvedSource,
    resolvedByResolver,
    shouldStartLoading,
    shouldRequest,
    startLoading,
    markLoaded,
    markError,
  } = useImageSource({
    source,
    sourceKey: customSourceKey,
    lazy,
    resolveSource,
    onResolveError,
    onDisposeError,
  })

  useIsomorphicLayoutEffect(() => {
    if (lazy || !shouldStartLoading) return

    startLoading()
  }, [sourceKey, lazy, shouldStartLoading])

  useEffect(() => {
    if (!lazy || !shouldStartLoading) return

    const imageElement = imgRef.current
    if (!imageElement) return

    return observeImageVisibility(imageElement, startLoading)
  }, [sourceKey, lazy, shouldStartLoading])

  const handleLoad = useLatestCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (event.currentTarget !== imgRef.current) return

    markImageAsLoaded(
      sourceKey,
      resolvedByResolver
        ? undefined
        : event.currentTarget.currentSrc || event.currentTarget.src,
    )
    markLoaded()
    onLoad?.(event)
  })

  const handleError = useLatestCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (event.currentTarget !== imgRef.current) return

    markError()
    onError?.(event)
  })

  return {
    imgRef,
    sourceKey,
    status,
    resolvedSource,
    shouldRequest,
    handleLoad,
    handleError,
  }
}

type UseLazyImageOptions = {
  source: LazyImgSource
  sourceKey?: string
  lazy: boolean
  resolveSource?: (
    context: LazyImgResolveContext,
  ) => LazyImgResolvedSource | Promise<LazyImgResolvedSource>
  onResolveError?: (error: unknown) => void
  onDisposeError?: (error: unknown) => void
  onLoad?: React.ReactEventHandler<HTMLImageElement>
  onError?: React.ReactEventHandler<HTMLImageElement>
}
