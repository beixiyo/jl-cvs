/** 定义 LazyImg 资源加载状态及其纯状态计算 */

import type { LazyImgSource } from '../types'
import { createImageRequestKey, isImageLoaded } from './index'

/** 根据资源输入和加载策略创建当前身份的初始状态 */
export function createInitialImageLoadState(options: CreateInitialImageLoadStateOptions): ImageLoadState {
  const {
    sourceKey,
    source,
    lazy,
    hasResolver,
  } = options
  const hasInputSource = Boolean(createImageRequestKey(source.src, source.srcSet, source.sizes))

  if (!sourceKey || (!hasResolver && !hasInputSource)) {
    return {
      sourceKey,
      status: 'error',
      source: undefined,
      resolvedByResolver: hasResolver,
    }
  }

  if (hasResolver) {
    return {
      sourceKey,
      status: lazy
        ? 'idle'
        : 'loading',
      source: undefined,
      resolvedByResolver: true,
    }
  }

  if (isImageLoaded(sourceKey)) {
    return {
      sourceKey,
      status: 'loaded',
      source: snapshotImageSource(source),
      resolvedByResolver: false,
    }
  }

  return {
    sourceKey,
    status: lazy
      ? 'idle'
      : 'loading',
    source: lazy
      ? undefined
      : snapshotImageSource(source),
    resolvedByResolver: false,
  }
}

/** 判断初始状态是否已经开始请求图片或不再需要启动请求 */
export function hasImageSourceStarted(state: ImageLoadState, hasResolver: boolean) {
  if (state.status === 'error' || state.status === 'loaded') return true
  return !hasResolver && state.status === 'loading'
}

/** 截取浏览器图片请求需要的完整资源字段，避免继承解析结果上的释放函数 */
export function snapshotImageSource(source: LazyImgSource): LazyImgSource {
  return {
    src: source.src,
    srcSet: source.srcSet,
    sizes: source.sizes,
  }
}

/** LazyImg 从等待视口到浏览器完成请求的状态 */
export type ImageLoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

/** 单个资源身份对应的可渲染加载状态 */
export type ImageLoadState = {
  sourceKey: string
  status: ImageLoadStatus
  source?: LazyImgSource
  resolvedByResolver: boolean
}

/** 生命周期提交状态时由当前资源身份统一补齐 `sourceKey` */
export type LifecycleLoadState = Omit<ImageLoadState, 'sourceKey'>

type CreateInitialImageLoadStateOptions = {
  sourceKey: string
  source: LazyImgSource
  lazy: boolean
  hasResolver: boolean
}
