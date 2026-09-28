/** 管理单个 LazyImg 资源身份的解析、取消与释放机制 */

import type { LazyImgResolveContext, LazyImgResolvedSource, LazyImgSource } from '../types'

/** 启动一次可取消的资源解析，并把控制器归属到当前生命周期 */
export function startImageSourceResolution(options: StartImageSourceResolutionOptions) {
  const {
    lifecycle,
    source,
    resolveSource,
    onResolved,
    onRejected,
  } = options
  const controller = new AbortController()
  lifecycle.controller = controller

  let result: LazyImgResolvedSource | Promise<LazyImgResolvedSource>
  try {
    result = resolveSource({
      ...source,
      sourceKey: lifecycle.sourceKey,
      signal: controller.signal,
    })
  }
  catch (error) {
    onRejected(error)
    return
  }

  if (isPromiseLike(result)) {
    void result.then(onResolved, onRejected)
    return
  }

  onResolved(result)
}

/** 判断异步结果是否仍属于当前可写入的资源生命周期 */
export function isImageSourceLifecycleCurrent(
  lifecycle: ImageSourceLifecycle,
  current?: ImageSourceLifecycle,
) {
  return lifecycle.active
    && current === lifecycle
    && !lifecycle.controller?.signal.aborted
}

/** 幂等地取消解析并释放当前生命周期持有的资源 */
export function releaseImageSourceLifecycle(
  lifecycle: ImageSourceLifecycle,
  onDisposeError: (error: unknown) => void,
) {
  if (!lifecycle.active) return

  lifecycle.active = false
  lifecycle.controller?.abort()
  lifecycle.controller = undefined

  const dispose = lifecycle.dispose
  lifecycle.dispose = undefined
  disposeImageSource(dispose, onDisposeError)
}

/** 调用外部释放函数，同时阻止释放异常中断换源或卸载 */
export function disposeImageSource(
  dispose: (() => void) | undefined,
  onDisposeError: (error: unknown) => void,
) {
  try {
    dispose?.()
  }
  catch (error) {
    onDisposeError(error)
  }
}

/** 当前资源身份独占的可取消、可释放生命周期 */
export type ImageSourceLifecycle = {
  sourceKey: string
  active: boolean
  started: boolean
  controller?: AbortController
  dispose?: () => void
}

type StartImageSourceResolutionOptions = {
  lifecycle: ImageSourceLifecycle
  source: LazyImgSource
  resolveSource: (
    context: LazyImgResolveContext,
  ) => LazyImgResolvedSource | Promise<LazyImgResolvedSource>
  onResolved: (source: LazyImgResolvedSource) => void
  onRejected: (error: unknown) => void
}

function isPromiseLike(
  result: LazyImgResolvedSource | Promise<LazyImgResolvedSource>,
): result is Promise<LazyImgResolvedSource> {
  return typeof (result as Promise<LazyImgResolvedSource>).then === 'function'
}
