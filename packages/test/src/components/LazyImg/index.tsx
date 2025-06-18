import type { MotionProps } from 'framer-motion'
import { motion } from 'framer-motion'
import { memo, useEffect, useRef, useState } from 'react'
import { PreviewImg } from '@/components/PreviewImg'
import { cn } from '@/utils'

// WeakMap 用于存储 Observer 需要的数据 (主要是 src)
const observerMap = new WeakMap<HTMLImageElement, { src: string }>()

const ob = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting)
        return

      const imgEl = entry.target as HTMLImageElement
      const data = observerMap.get(imgEl)

      if (data) {
        /**
         * 当图片进入视口时，设置其 src 属性，触发浏览器加载
         * 后续的状态更新由 imgEl 的 onLoad 和 onError 事件处理
         */
        imgEl.src = data.src

        /** 处理完后取消观察并清理 Map */
        ob.unobserve(imgEl)
        observerMap.delete(imgEl)
      }
    })
  },
  {
    threshold: 0.01, // 元素可见 1% 时触发
    rootMargin: '20px', // 预加载范围扩大 20px
  },
)

export const LazyImg = memo<LazyImgProps>((
  {
    style,
    imgStyle,
    className,
    imgClassName,
    children,

    lazy = true,
    src,
    loadingSrc = new URL('@/assets/loadingSvg.svg', import.meta.url).href,
    errorSrc = 'https://tse4-mm.cn.bing.net/th/id/OIP-C.DP6b1UUJQbIaD8dHSskvggHaGX?w=213&h=183&c=7&r=0&o=5&dpr=1.1&pid=1.7',

    errorText = 'The picture was stolen by aliens',
    loadingText = '',
    keepAspect = true,
    previewable = true,

    ...rest
  },
) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  // --- 状态管理 ---
  // showLoading: 是否显示加载占位符
  // showError: 是否显示错误占位符
  // showImg: 是否显示实际图片 (加载成功后)
  const [showLoading, setShowLoading] = useState(true) // 初始总是显示 loading
  const [showError, setShowError] = useState(false)
  const [showImg, setShowImg] = useState(false) // 初始不显示实际图片

  // --- 事件处理 ---
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // console.log('handleLoad triggered for:', (event.target as HTMLImageElement).src)
    const imgEl = event.target as HTMLImageElement
    setShowLoading(false)
    setShowError(false)
    setShowImg(true)

    /** 应用加载完成后的效果 (blur out) */
    imgEl.style.filter = 'blur(5px)'
    imgEl.style.transition = '.2s'

    setTimeout(() => {
      imgEl.style.filter = 'none'
    }, 200)

    rest.onLoad?.(event)
  }

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // console.error('handleError triggered for:', (event.target as HTMLImageElement).src)
    /**
     * 如果是 lazy 模式，加载失败也需要 unobserve
     */
    if (lazy && imgRef.current) {
      ob.unobserve(imgRef.current)
      observerMap.delete(imgRef.current)
    }
    setShowLoading(false)
    setShowError(true)
    setShowImg(false)
    imgRef.current!.style.display = 'none'

    rest.onError?.(event)
  }

  // --- 副作用 ---
  useEffect(() => {
    /**
     * 重置状态以应对 src 或 lazy 的变化
     */
    setShowLoading(true)
    setShowError(false)
    setShowImg(false)

    /** 清理可能存在的旧样式 */
    if (imgRef.current) {
      imgRef.current.style.filter = 'none'
      imgRef.current.style.transition = 'none'
    }

    const imgElement = imgRef.current
    if (!imgElement)
      return

    // 1. 处理无效 src
    if (!src) {
      setShowError(true)
      setShowLoading(false)
      return // 无 src，直接显示错误，无需观察或设置 src
    }

    // 2. 处理非懒加载情况
    if (!lazy) {
      /** 直接设置 src，让 <img> 的 onLoad/onError 处理 */
      imgElement.src = src
      /**
       * 注意：这里不需要手动调用 handleLoad/handleError，
       * 它们会由 img 元素的事件触发
       */
    }
    // 3. 处理懒加载情况 (启动观察)
    else {
      /** 清空 src，确保旧图片不显示，等待 observer 触发 */
      imgElement.removeAttribute('src') // 确保 src 是空的

      /** 存储当前 src 到 Map 中，供 Observer 回调使用 */
      observerMap.set(imgElement, { src })
      /** 开始观察 */
      ob.observe(imgElement)
    }

    // --- 清理函数 ---
    return () => {
      // console.log('useEffect cleanup for:', src)
      if (imgElement) {
        /** 组件卸载或依赖变化时，停止观察并清理 Map */
        ob.unobserve(imgElement)
        observerMap.delete(imgElement)
      }
    }
    /** 依赖项：当 src 或 lazy 属性变化时，需要重新执行此 effect */
  }, [src, lazy])

  // --- 渲染逻辑 ---
  return (<>
    <motion.div
      className={ cn(
        'lazy-img-container size-full relative overflow-hidden select-none',
        className,
      ) }
      layout={ rest.layout }
      layoutId={ rest.layoutId }
      style={ style }
    >
      {/* 内层容器用于保持宽高比和定位 */ }
      <div
        className={ cn(`flex justify-center items-center
          w-full h-full relative overflow-hidden`, { 'aspect-padding': keepAspect }) }
        style={ {
          ...(keepAspect && {
            paddingBottom: keepAspect
              ? '100%'
              : undefined,
            height: keepAspect
              ? 0
              : '100%',
          }),
        } }
      >
        {/* Loading Placeholder */ }
        { showLoading && (
          <div className="absolute inset-0 z-5 flex flex-col items-center justify-center">
            <img
              src={ loadingSrc }
              alt="Loading..."
              decoding="async"
              className={ cn(
                'w-10 h-10 opacity-50',
              ) }
              style={ imgStyle }
              { ...rest }
            />
            { loadingText && (
              <span className="mt-1 text-xs text-gray-400">{ loadingText }</span>
            ) }
          </div>
        ) }

        {/* Error Placeholder */ }
        { showError && (
          <div className="absolute inset-0 z-5 flex flex-col items-center justify-center text-center">
            <img
              src={ errorSrc }
              alt="Error"
              decoding="async"
              className={ cn(
                'w-12 h-12',
              ) }
              style={ imgStyle }
              { ...rest }
            />
            { errorText && (
              <span className="mt-1 px-2 text-xs text-red-400">{ errorText }</span>
            ) }
          </div>
        ) }

        {/* Actual Image */ }
        <img
          ref={ imgRef }
          alt={ rest.alt || 'Lazy loaded image' }
          decoding="async"
          className={ cn(
            'absolute top-0 left-0 z-1 object-cover w-full h-full transition-transform duration-300',
            { 'hover:scale-105': showImg },
            { 'cursor-zoom-in': previewable && showImg },
            imgClassName,
          ) }
          style={ imgStyle }
          onClick={ () => {
            if (previewable && showImg)
              setPreviewVisible(true)
          } }
          onLoad={ handleLoad }
          onError={ handleError }
          { ...rest }
        />

        {/* Optional Children Overlay */ }
        { children }
      </div>
    </motion.div>

    {/* Preview Component */ }
    { previewVisible && <PreviewImg
      src={ src }
      onClose={ () => setPreviewVisible(false) }
    /> }
  </>)
})

LazyImg.displayName = 'LazyImg'

export type LazyImgProps = {
  className?: string
  imgClassName?: string
  style?: React.CSSProperties
  imgStyle?: React.CSSProperties
  children?: React.ReactNode
  lazy?: boolean
  src: string
  loadingSrc?: string
  errorSrc?: string
  errorText?: string
  loadingText?: string
  keepAspect?: boolean
  /**
   * 是否可预览
   * @default true
   */
  previewable?: boolean
}
& Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'src'>
& MotionProps
