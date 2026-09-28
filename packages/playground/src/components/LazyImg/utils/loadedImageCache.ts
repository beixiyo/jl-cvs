/** 管理 LazyImg 当前会话内的已加载请求缓存 */

/** 已成功加载的图片请求，用于避免重复等待视口或播放加载动画 */
export const loadedImageCache = new Set<string>()

/** 缓存容量上限，防止长会话下按 URL 无界增长（data URL 场景可达 MB 级） */
const LOADED_IMAGE_CACHE_LIMIT = 1000

/** 记录已加载请求，超出上限时淘汰最早插入的记录 */
export function addLoadedImage(requestKey: string): void {
  if (loadedImageCache.has(requestKey)) return

  if (loadedImageCache.size >= LOADED_IMAGE_CACHE_LIMIT) {
    const oldest = loadedImageCache.values().next().value
    if (oldest !== undefined) loadedImageCache.delete(oldest)
  }

  loadedImageCache.add(requestKey)
}
