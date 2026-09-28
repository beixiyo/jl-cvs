/** 管理 LazyImg 的稳定资源身份、异步解析和加载状态 */

import { useLatestCallback, useLatestRef } from '@/hooks'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { LazyImgResolveContext, LazyImgResolvedSource, LazyImgSource } from '../types'
import { createImageRequestKey, isImageLoaded } from '../utils'
import { createInitialImageLoadState, hasImageSourceStarted, snapshotImageSource } from '../utils/imageLoadState'
import type { LifecycleLoadState } from '../utils/imageLoadState'
import { disposeImageSource, isImageSourceLifecycleCurrent, releaseImageSourceLifecycle, startImageSourceResolution } from '../utils/imageSourceLifecycle'
import type { ImageSourceLifecycle } from '../utils/imageSourceLifecycle'

const useIsomorphicLayoutEffect = typeof window === 'undefined'
  ? useEffect
  : useLayoutEffect

/** 以 `sourceKey` 为边界持有和解析当前图片资源 */
export function useImageSource(options: UseImageSourceOptions) {
  const {
    source,
    sourceKey: customSourceKey,
    lazy,
    resolveSource,
    onResolveError,
    onDisposeError,
  } = options
  const sourceRef = useLatestRef(source)
  const resolveSourceRef = useLatestRef(resolveSource)
  const sourceKey = customSourceKey ?? createImageRequestKey(source.src, source.srcSet, source.sizes)
  const initialState = createInitialImageLoadState({
    sourceKey,
    source,
    lazy,
    hasResolver: Boolean(resolveSource),
  })
  const [loadState, setLoadState] = useState(initialState)
  const activeLifecycleRef = useRef<ImageSourceLifecycle | undefined>(undefined)

  /** 换源首帧直接使用新身份的初态，避免被上一资源的状态污染 */
  const currentState = loadState.sourceKey === sourceKey
    ? loadState
    : initialState

  const reportResolveError = useLatestCallback((error: unknown) => {
    onResolveError?.(error)
  })

  const reportDisposeError = useLatestCallback((error: unknown) => {
    onDisposeError?.(error)
  })

  const commitLifecycleState = useLatestCallback((
    lifecycle: ImageSourceLifecycle,
    state: LifecycleLoadState,
  ) => {
    if (!isImageSourceLifecycleCurrent(lifecycle, activeLifecycleRef.current)) return false

    setLoadState({ sourceKey: lifecycle.sourceKey, ...state })
    return true
  })

  const installResolvedSource = useLatestCallback((
    lifecycle: ImageSourceLifecycle,
    resolvedSource: LazyImgResolvedSource,
  ) => {
    if (!isImageSourceLifecycleCurrent(lifecycle, activeLifecycleRef.current)) {
      disposeImageSource(resolvedSource.dispose, reportDisposeError)
      return
    }

    if (!createImageRequestKey(resolvedSource.src, resolvedSource.srcSet, resolvedSource.sizes)) {
      disposeImageSource(resolvedSource.dispose, reportDisposeError)
      commitLifecycleState(lifecycle, {
        status: 'error',
        source: undefined,
        resolvedByResolver: true,
      })
      reportResolveError(new Error('LazyImg resolveSource returned an empty image source'))
      return
    }

    lifecycle.dispose = resolvedSource.dispose
    commitLifecycleState(lifecycle, {
      status: resolvedSource.reuseLoadedState && isImageLoaded(lifecycle.sourceKey)
        ? 'loaded'
        : 'loading',
      source: snapshotImageSource(resolvedSource),
      resolvedByResolver: true,
    })
  })

  const rejectResolvedSource = useLatestCallback((
    lifecycle: ImageSourceLifecycle,
    error: unknown,
  ) => {
    const committed = commitLifecycleState(lifecycle, {
      status: 'error',
      source: undefined,
      resolvedByResolver: true,
    })
    if (committed) reportResolveError(error)
  })

  const startLoading = useLatestCallback(() => {
    const lifecycle = activeLifecycleRef.current
    if (!lifecycle || lifecycle.started) return

    lifecycle.started = true
    const resolver = resolveSourceRef.current
    const currentSource = snapshotImageSource(sourceRef.current)

    if (!resolver) {
      const hasSource = Boolean(createImageRequestKey(
        currentSource.src,
        currentSource.srcSet,
        currentSource.sizes,
      ))
      commitLifecycleState(lifecycle, {
        status: hasSource
          ? 'loading'
          : 'error',
        source: hasSource
          ? currentSource
          : undefined,
        resolvedByResolver: false,
      })
      return
    }

    const committed = commitLifecycleState(lifecycle, {
      status: 'loading',
      source: undefined,
      resolvedByResolver: true,
    })
    if (!committed) return

    startImageSourceResolution({
      lifecycle,
      source: currentSource,
      resolveSource: resolver,
      onResolved: (resolvedSource) => installResolvedSource(lifecycle, resolvedSource),
      onRejected: (error) => rejectResolvedSource(lifecycle, error),
    })
  })

  useIsomorphicLayoutEffect(() => {
    const hasResolver = Boolean(resolveSourceRef.current)
    const nextState = createInitialImageLoadState({
      sourceKey,
      source: sourceRef.current,
      lazy,
      hasResolver,
    })
    const lifecycle: ImageSourceLifecycle = {
      sourceKey,
      active: true,
      started: hasImageSourceStarted(nextState, hasResolver),
    }
    activeLifecycleRef.current = lifecycle
    setLoadState((current) =>
      current.sourceKey === sourceKey
        ? current
        : nextState
    )

    return () => {
      releaseImageSourceLifecycle(lifecycle, reportDisposeError)
      if (activeLifecycleRef.current === lifecycle) activeLifecycleRef.current = undefined
    }
  }, [sourceKey])

  const markLoaded = useLatestCallback(() => {
    setLoadState((current) =>
      current.sourceKey === sourceKey
        ? { ...current, status: 'loaded' }
        : current
    )
  })

  const markError = useLatestCallback(() => {
    setLoadState((current) =>
      current.sourceKey === sourceKey
        ? { ...current, status: 'error' }
        : current
    )
  })

  return {
    sourceKey,
    status: currentState.status,
    resolvedSource: currentState.source,
    resolvedByResolver: currentState.resolvedByResolver,
    shouldStartLoading: currentState.status === 'idle'
      || (
        currentState.status === 'loading'
        && currentState.resolvedByResolver
        && !currentState.source
      ),
    shouldRequest: Boolean(currentState.source)
      && (currentState.status === 'loading' || currentState.status === 'loaded'),
    startLoading,
    markLoaded,
    markError,
  }
}

type UseImageSourceOptions = {
  source: LazyImgSource
  sourceKey?: string
  lazy: boolean
  resolveSource?: (
    context: LazyImgResolveContext,
  ) => LazyImgResolvedSource | Promise<LazyImgResolvedSource>
  onResolveError?: (error: unknown) => void
  onDisposeError?: (error: unknown) => void
}
