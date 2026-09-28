/** 管理 LazyImg 共享的视口预加载观察器 */

/** 每个被观察元素只注册一个“允许开始加载”回调 */
const visibilityCallbacks = new WeakMap<Element, () => void>()
let visibilityObserver: IntersectionObserver | null = null

function getVisibilityObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null

  if (!visibilityObserver) {
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const onVisible = visibilityCallbacks.get(entry.target)
          visibilityObserver!.unobserve(entry.target)
          visibilityCallbacks.delete(entry.target)
          onVisible?.()
        })
      },
      {
        threshold: 0.01,
        rootMargin: '20px',
      },
    )
  }

  return visibilityObserver
}

/**
 * 元素进入预加载范围时调用一次 `onVisible`，并返回幂等的清理函数
 * 不支持 IntersectionObserver 的浏览器会立即加载，保证图片不会永久停在占位态
 */
export function observeImageVisibility(element: Element, onVisible: () => void) {
  const observer = getVisibilityObserver()
  if (!observer) {
    onVisible()
    return () => {}
  }

  visibilityCallbacks.set(element, onVisible)
  observer.observe(element)

  return () => {
    observer.unobserve(element)
    visibilityCallbacks.delete(element)
  }
}
