import { addLoadedImage, loadedImageCache } from './loadedImageCache'

/**
 * 将图片地址归一化为浏览器实际请求的绝对地址；SSR 下保留原值
 */
export function normalizeImageUrl(src: string): string {
  const trimmedSrc = src.trim()
  if (!trimmedSrc) return ''

  try {
    const baseUrl = typeof document !== 'undefined'
      ? document.baseURI
      : undefined
    return new URL(trimmedSrc, baseUrl).href
  }
  catch {
    return trimmedSrc
  }
}

/**
 * 生成一次图片请求的稳定标识。`srcSet` 或 `sizes` 改变时必须视为新请求，
 * 否则可能把不同响应式候选图误判为同一张已加载图片
 */
export function createImageRequestKey(src: string, srcSet?: string, sizes?: string): string {
  const normalizedSrc = normalizeImageUrl(src)
  const normalizedSrcSet = srcSet?.trim() || ''
  const normalizedSizes = sizes?.trim() || ''

  if (!normalizedSrcSet) return normalizedSrc

  return JSON.stringify([normalizedSrc, normalizedSrcSet, normalizedSizes])
}

/**
 * 检查同一图片请求是否已经在当前会话中成功加载过
 */
export function isImageLoaded(requestKey: string): boolean {
  return Boolean(requestKey) && loadedImageCache.has(requestKey)
}

/**
 * 标记图片请求为已加载，同时记录浏览器最终选择的候选地址
 */
export function markImageAsLoaded(requestKey: string, currentSrc?: string): void {
  if (requestKey) addLoadedImage(requestKey)

  const normalizedCurrentSrc = normalizeImageUrl(currentSrc || '')
  if (normalizedCurrentSrc) addLoadedImage(normalizedCurrentSrc)
}
