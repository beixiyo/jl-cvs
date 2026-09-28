/** 渲染 LazyImg 的加载、错误、成功图片与按需预览界面 */
'use client'

import { useLatestCallback } from '@/hooks'
import { cn } from '@/utils'
import { ImageOff } from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useState } from 'react'
import { Loading } from '../Loading/Loading'
import { PreviewImg } from '../PreviewImg'
import type { PreviewImgProps } from '../PreviewImg/types'
import { useLazyImage } from './hooks/useLazyImage'
import type { LazyImgProps } from './types'

function extractRadiusClass(className?: string) {
  if (!className) return undefined

  const radiusClasses = className
    .split(' ')
    .map((cls) => cls.trim())
    .filter(Boolean)
    .filter((cls) => cls.startsWith('rounded'))

  return radiusClasses.length > 0
    ? radiusClasses.join(' ')
    : undefined
}

/** 支持稳定资源身份、可取消异步解析和自定义预览的懒加载图片 */
export const LazyImg = memo<LazyImgProps>((
  {
    style,
    imgStyle,
    className,
    imgClassName,
    children,

    lazy = true,
    src,
    srcSet,
    sizes,
    sourceKey: customSourceKey,
    resolveSource,
    onResolveError,
    onDisposeError,
    decoding = 'async',
    loading,
    errorSrc,

    errorText = '',
    loadingText = '',
    keepAspect = true,
    previewable = true,
    showThumbnails = true,
    previewMaskClosable = true,
    previewImages,
    renderPreview,
    onClick,
    onLoad: userOnLoad,
    onError: userOnError,
    layout,
    layoutId,

    ...imgProps
  },
) => {
  const [previewSourceKey, setPreviewSourceKey] = useState<string>()
  const mergedRadiusClass = extractRadiusClass(className || imgClassName)
  const {
    imgRef,
    sourceKey,
    status,
    resolvedSource,
    shouldRequest,
    handleLoad,
    handleError,
  } = useLazyImage({
    source: { src, srcSet, sizes },
    sourceKey: customSourceKey,
    lazy,
    resolveSource,
    onResolveError,
    onDisposeError,
    onLoad: userOnLoad,
    onError: userOnError,
  })
  const [failedErrorImageKey, setFailedErrorImageKey] = useState('')
  const errorImageKey = `${sourceKey}\0${errorSrc || ''}`
  const isLoaded = status === 'loaded'
  const showLoading = status === 'idle' || status === 'loading'
  const showError = status === 'error'
  const showCustomErrorImage = Boolean(errorSrc) && failedErrorImageKey !== errorImageKey
  const previewVisible = previewSourceKey === sourceKey

  const handleImageClick = useLatestCallback((event: React.MouseEvent<HTMLImageElement>) => {
    onClick?.(event)
    if (previewable && isLoaded) setPreviewSourceKey(sourceKey)
  })

  const handlePreviewClose = useLatestCallback(() => {
    setPreviewSourceKey(undefined)
  })

  const previewInitialIndex = previewImages && previewImages.length > 0
    ? Math.max(previewImages.indexOf(src), 0)
    : 0
  const previewProps: PreviewImgProps = {
    src: previewImages && previewImages.length > 0
      ? previewImages
      : src || resolvedSource?.src || '',
    initialIndex: previewInitialIndex,
    showThumbnails,
    maskClosable: previewMaskClosable,
    onClose: handlePreviewClose,
  }

  // --- 渲染逻辑 ---
  return (
    <>
      <motion.div
        className={ cn(
          'lazy-img-container relative overflow-hidden select-none',
          keepAspect
            ? 'aspect-square w-full'
            : 'size-full',
          className,
        ) }
        layout={ layout }
        layoutId={ layoutId }
        style={ style }
      >
        <div className="relative flex size-full items-center justify-center overflow-hidden">
          { /* Actual Image */ }
          <motion.img
            key={ sourceKey }
            { ...imgProps }
            ref={ imgRef }
            src={ shouldRequest
              ? resolvedSource?.src || undefined
              : undefined }
            srcSet={ shouldRequest
              ? resolvedSource?.srcSet
              : undefined }
            sizes={ shouldRequest
              ? resolvedSource?.sizes
              : undefined }
            alt={ imgProps.alt || 'Lazy loaded image' }
            decoding={ decoding }
            className={ cn(
              'absolute inset-0 size-full object-cover transition-[filter] duration-200',
              isLoaded
                ? 'visible blur-0'
                : 'invisible blur-sm',
              { 'cursor-zoom-in': previewable && isLoaded },
              imgClassName,
            ) }
            style={ {
              ...imgStyle,
            } }
            onClick={ handleImageClick }
            onLoad={ handleLoad }
            onError={ handleError }
          />

          { /* Optional Children Overlay */ }
          { children }
        </div>

        { /* Loading Placeholder */ }
        { showLoading && (
          <div className="absolute inset-0 z-5 flex flex-col items-center justify-center">
            { loading || (
              <Loading
                loading={ showLoading }
                skeletonProps={ {
                  className: mergedRadiusClass,
                } }
                variant="skeleton"
              />
            ) }
            { loadingText && <span className="mt-1 text-xs text-text2">{ loadingText }</span> }
          </div>
        ) }

        { /* Error Placeholder */ }
        { showError && (
          <div className="absolute inset-0 z-5 flex flex-col items-center justify-center text-center">
            { showCustomErrorImage
              ? (
                <img
                  key={ errorImageKey }
                  src={ errorSrc }
                  alt=""
                  decoding="async"
                  className="size-12"
                  style={ imgStyle }
                  onError={ () => setFailedErrorImageKey(errorImageKey) }
                />
              )
              : (
                <ImageOff
                  aria-hidden="true"
                  className="size-10 text-text2"
                  strokeWidth={ 1.5 }
                />
              ) }
            { errorText && <span className="mt-1 px-2 text-xs text-text2">{ errorText }</span> }
          </div>
        ) }
      </motion.div>

      { /* Preview Component */ }
      { previewVisible && isLoaded && (
        renderPreview?.(previewProps) ?? <PreviewImg { ...previewProps } />
      ) }
    </>
  )
})

LazyImg.displayName = 'LazyImg'

export type { LazyImgProps, LazyImgResolveContext, LazyImgResolvedSource, LazyImgSource } from './types'
