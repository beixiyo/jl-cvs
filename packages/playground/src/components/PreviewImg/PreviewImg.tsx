'use client'

import { useElBounding, useKeyboardLayer, useLatestCallback, useShortCutKey, useWheelDirection } from '@/hooks'
import { cn } from '@/utils'
import { downloadByData, downloadByUrl } from '@jl-org/tool'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Z } from '../../constants/z-index'
import { CloseBtn } from '../CloseBtn'
import { ImgThumbnails } from '../ImgThumbnails'
import type { ImgThumbnailsOrientation } from '../ImgThumbnails/types'
import { Mask } from '../Mask'
import { SafePortal } from '../SafePortal'
import { ControlButtons } from './subcomponents/ControlButtons'
import { PreviewImage } from './subcomponents/PreviewImage'
import type { PreviewImgOverlayCtx, PreviewImgProps } from './types'

/** 浮层距视口边缘、以及浮层与大图之间统一的安全间距（px） */
const SAFE_GAP = 16

/** 一个浮层实际占掉的空间：自身尺寸 + 一个安全间距；没有浮层则不占 */
function band(size: number) {
  return size > 0
    ? size + SAFE_GAP
    : 0
}

/** 从图片地址里取文件名，取不到（如 base64、无扩展名的接口地址）则回退 */
function getFileName(src: string) {
  const path = src.split(/[?#]/)[0]
  const name = path.slice(path.lastIndexOf('/') + 1)

  return name || 'image'
}

/** 缩略图列表贴靠各边时的定位类名，边距与 SAFE_GAP 保持一致 */
const THUMBNAIL_PLACEMENT_CLASS = {
  top: 'top-4 left-1/2 -translate-x-1/2',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2',
  left: 'left-4 top-1/2 -translate-y-1/2',
  right: 'right-4 top-1/2 -translate-y-1/2',
} as const

/** 预览缩略图的默认样式：40×40、圆角 12、选中项 1.5px 白色描边、容器无底色无边框 */
const DEFAULT_THUMBNAIL_PROPS = {
  thumbSize: 40,
  thumbClassName: 'rounded-xl',
  activeThumbClassName: 'border-[1.5px] border-white',
  inactiveThumbClassName: 'border-[1.5px] border-transparent hover:border-white/50',
  containerClassName: 'gap-3 bg-transparent backdrop-blur-none',
  hideBorder: true,
} as const

/**
 * 图片预览组件
 *
 * 支持单张或多张图片预览，多图时显示缩略图切换（位置由 `thumbnailPlacement` 决定）
 *
 * @example
 * ```tsx
 * // 单张图片
 * <PreviewImg
 *   src="https://example.com/image.jpg"
 *   onClose={() => setOpen(false)}
 * />
 *
 * // 多张图片
 * <PreviewImg
 *   src={['img1.jpg', 'img2.jpg', 'img3.jpg']}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export const PreviewImg = memo<PreviewImgProps>(({
  style,
  className,
  src,
  onClose,
  initialIndex = 0,
  orientation = 'vertical',
  thumbnailPlacement,
  thumbnailProps,
  renderThumbnails,
  renderToolbar,
  toolbarActions,
  showThumbnails = true,
  maskClosable = true,
  windowDragMode = 'no-drag',
  imageMaxWidth,
  zIndex,
}) => {
  /** 统一处理为数组格式 */
  const images = useMemo(() => {
    return Array.isArray(src)
      ? src
      : [src]
  }, [src])

  /** 当前显示的图片索引 */
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  /** 缩略图贴靠的边：未显式指定时沿用 orientation 的老行为 */
  const placement = thumbnailPlacement ?? (orientation === 'vertical'
    ? 'right'
    : 'bottom')
  const thumbnailsOrientation: ImgThumbnailsOrientation = placement === 'left' || placement === 'right'
    ? 'vertical'
    : 'horizontal'

  const showThumbnailList = showThumbnails && images.length > 1

  /**
   * 工具栏与缩略图都是 fixed 浮层，大图在遮罩里居中，彼此不知道对方多大，
   * 所以实测两者的尺寸（内容可被外部替换，写死高度必然失真），再从大图的可用空间里减掉
   */
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const thumbnailsSize = useElBounding(thumbnailsRef)
  const toolbarSize = useElBounding(toolbarRef)

  /**
   * 预览挂在 Portal 里，首帧 ref 还是空的，useElBounding 的首次测量会落空且不再重跑，
   * 所以用回调 ref：DOM 一挂上就立刻量一次，首屏大图才会正确让位
   */
  const bindThumbnails = useLatestCallback((node: HTMLDivElement | null) => {
    thumbnailsRef.current = node
    if (node) thumbnailsSize.update()
  })

  const bindToolbar = useLatestCallback((node: HTMLDivElement | null) => {
    toolbarRef.current = node
    if (node) toolbarSize.update()
  })

  const toolbarBand = band(toolbarSize.height)

  /** 缩略图也贴底时要叠在工具栏之上，否则两个浮层挤在一起 */
  const thumbnailsStyle = useMemo(() => (placement === 'bottom'
    ? { bottom: SAFE_GAP + toolbarBand }
    : undefined), [placement, toolbarBand])

  const insets = useMemo(() => {
    const thumbnailBand = showThumbnailList
      ? band(
        thumbnailsOrientation === 'vertical'
          ? thumbnailsSize.width
          : thumbnailsSize.height,
      )
      : 0

    return {
      /** 视口边距恒为 SAFE_GAP，浮层占的那条带再往里叠加 */
      top: SAFE_GAP + (placement === 'top'
        ? thumbnailBand
        : 0),
      bottom: SAFE_GAP + toolbarBand + (placement === 'bottom'
        ? thumbnailBand
        : 0),
      left: SAFE_GAP + (placement === 'left'
        ? thumbnailBand
        : 0),
      right: SAFE_GAP + (placement === 'right'
        ? thumbnailBand
        : 0),
    }
  }, [placement, showThumbnailList, thumbnailsOrientation, thumbnailsSize, toolbarBand])

  /** 当前显示的图片URL */
  const currentSrc = images[currentIndex] || images[0] || ''

  /** 图片操作状态 */
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  /** 当图片切换时，重置操作状态 */
  useEffect(() => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  /** 重置状态（自定义工具栏可以不带事件对象直接调用） */
  const handleReset = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [])

  /** 处理旋转 */
  const handleRotate = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
  }, [rotation])

  /**
   * 下载当前图片
   *
   * 图片多在 CDN 上，跨域时 `<a download>` 的文件名会被浏览器忽略、直接跳走，
   * 所以先取成 blob 再下载；取不到（CORS 不放行等）才退回直链
   */
  const handleDownload = useLatestCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    if (!currentSrc) return

    const fileName = getFileName(currentSrc)

    try {
      const resp = await fetch(currentSrc)
      if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`)

      await downloadByData(await resp.blob(), fileName)
    }
    catch {
      await downloadByUrl(currentSrc, fileName)
    }
  })

  /** 处理图片切换 */
  const handleImageChange = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  /** 切换到上一张图片 */
  const handlePrevImage = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }, [images.length])

  /** 切换到下一张图片 */
  const handleNextImage = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }
  }, [images.length])

  /** 交给外部 TSX 的上下文：自定义工具栏 / 缩略图列表靠它与预览联动 */
  const overlayCtx = useMemo<PreviewImgOverlayCtx>(() => ({
    images,
    currentIndex,
    currentSrc,
    scale,
    rotation,
    select: handleImageChange,
    prev: handlePrevImage,
    next: handleNextImage,
    rotate: handleRotate,
    reset: handleReset,
    download: handleDownload,
    close: onClose,
  }), [
    images,
    currentIndex,
    currentSrc,
    scale,
    rotation,
    handleImageChange,
    handlePrevImage,
    handleNextImage,
    handleRotate,
    handleReset,
    handleDownload,
    onClose,
  ])

  useKeyboardLayer({
    active: true,
    keys: ['Escape'],
    priority: typeof zIndex === 'number'
      ? zIndex
      : typeof style?.zIndex === 'number'
      ? style.zIndex
      : Z.preview,
    allowRepeat: false,
    onKeyDown: onClose,
  })

  /** 左箭头键切换到上一张（同 ESC：捕获阶段消费并阻断冒泡，避免方向键漏到底层组件） */
  useShortCutKey({
    key: 'ArrowLeft',
    capture: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handlePrevImage()
    },
  })

  /** 右箭头键切换到下一张 */
  useShortCutKey({
    key: 'ArrowRight',
    capture: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleNextImage()
    },
  })

  /** 上箭头键切换到上一张 */
  useShortCutKey({
    key: 'ArrowUp',
    capture: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handlePrevImage()
    },
  })

  /** 下箭头键切换到下一张 */
  useShortCutKey({
    key: 'ArrowDown',
    capture: true,
    onKeyDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleNextImage()
    },
  })

  /** 阻止事件冒泡 */
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  /**
   * 鼠标滚轮切换图片
   * - 向上滚轮：上一张
   * - 向下滚轮：下一张
   */
  const handleWheel = useWheelDirection({
    onScrollUp: () => {
      handlePrevImage()
    },
    onScrollDown: () => {
      handleNextImage()
    },
  }, {
    preventDefault: true,
    stopPropagation: true,
    threshold: 0,
  })

  const handleMaskClick = useLatestCallback((e: React.MouseEvent) => {
    /** 点击遮罩层时，统一阻止事件冒泡，避免关闭预览后触发底层点击事件 */
    stopPropagation(e)

    if (!maskClosable) return

    if (e.target === e.currentTarget) onClose()
  })

  /** 阻止 body 滚动 */
  useEffect(() => {
    const lastOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = lastOverflow
    }
  }, [])

  const content = (
    <Mask
      className={ cn(
        'fixed',
        windowDragMode === 'no-drag' && '[-webkit-app-region:no-drag]',
        className,
      ) }
      style={ {
        ...style,
        zIndex: zIndex ?? style?.zIndex ?? Z.preview,
      } }
      onWheel={ handleWheel }
      onClick={ handleMaskClick }
      onMouseDown={ stopPropagation }
      onMouseMove={ stopPropagation }
      onMouseUp={ stopPropagation }
      onMouseLeave={ stopPropagation }
      onMouseEnter={ stopPropagation }
      onMouseOver={ stopPropagation }
      onMouseOut={ stopPropagation }
    >
      { /* 主预览图 */ }
      <PreviewImage
        src={ currentSrc }
        isDragging={ isDragging }
        scale={ scale }
        rotation={ rotation }
        position={ position }
        onScaleChange={ setScale }
        onPositionChange={ setPosition }
        onDraggingChange={ setIsDragging }
        insets={ insets }
        maxWidth={ imageMaxWidth }
      />

      { /* 缩略图列表（多图时显示） */ }
      { showThumbnailList && (
        <div
          ref={ bindThumbnails }
          className={ cn(
            'fixed z-modal pointer-events-auto',
            THUMBNAIL_PLACEMENT_CLASS[placement],
          ) }
          style={ thumbnailsStyle }
        >
          { renderThumbnails
            ? renderThumbnails(overlayCtx)
            : (
              <ImgThumbnails
                { ...DEFAULT_THUMBNAIL_PROPS }
                { ...thumbnailProps }
                images={ images }
                currentIndex={ currentIndex }
                onImageChange={ handleImageChange }
                orientation={ thumbnailsOrientation }
              />
            ) }
        </div>
      ) }

      { /* 底部工具栏 */ }
      <div
        ref={ bindToolbar }
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-modal pointer-events-auto"
      >
        { renderToolbar
          ? renderToolbar(overlayCtx)
          : (
            <ControlButtons
              onRotate={ handleRotate }
              onReset={ handleReset }
              onDownload={ handleDownload }
            >
              { typeof toolbarActions === 'function'
                ? toolbarActions(overlayCtx)
                : toolbarActions }
            </ControlButtons>
          ) }
      </div>

      <CloseBtn
        onClick={ onClose }
        mode="fixed"
        size="lg"
        iconSize={ 14 }
        strokeWidth={ 2.5 }
        variant="default"
        className="z-modal rounded-xl bg-text4 text-white hover:bg-text3 hover:text-white"
      />
    </Mask>
  )

  /** 使用 Portal 渲染到 body，避免 fixed 定位失效 */
  return <SafePortal>{ content }</SafePortal>
})

PreviewImg.displayName = 'PreviewImg'

/** 自定义工具栏时复用内置按钮样式 */
