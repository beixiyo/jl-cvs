'use client'

import { useLatestCallback } from '@/hooks'
import { debounce } from '@jl-org/tool'
import { motion, useMotionValue, useTransform } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * 预览图片组件
 * 处理图片的缩放、旋转、拖动等交互
 */
export const PreviewImage = memo<PreviewImageProps>(({
  src,
  isDragging,
  scale,
  rotation,
  position,
  onScaleChange,
  onPositionChange,
  onDraggingChange,
  insets,
  maxWidth,
}) => {
  const containerRef = useRef<HTMLImageElement>(null)

  /** 用于动画的值 */
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  /** 仅用于用户交互缩放，不再叠加「进入时缩放」动画，避免切换图片时出现 scale 过渡 */
  const userScale = useMotionValue(1)

  /** 使用 ref 来跟踪是否正在用户交互（拖动或滚轮缩放） */
  const isUserInteractingRef = useRef(false)

  /** 使用 state 来跟踪交互状态，确保样式更新 */
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  /** 重置交互标志的 debounced 函数 */
  const resetInteractionFlag = useCallback(
    debounce(() => {
      isUserInteractingRef.current = false
      setIsUserInteracting(false)
    }, 150),
    [],
  )

  /** 根据交互状态计算样式 */
  const imgStyle = useMemo<React.CSSProperties>(() => {
    return {
      transition: isUserInteracting
        ? 'none'
        : '.2s transform',
    }
  }, [isUserInteracting])

  /** 最终缩放：仅使用用户交互产生的缩放，不再在切换图片时做额外 scale 动画 */
  const finalScale = useTransform(userScale, (value) => value)

  /** 同步 motion values */
  useEffect(() => {
    x.set(position.x)
    y.set(position.y)
    rotate.set(rotation)
    userScale.set(scale)
  }, [position.x, position.y, rotation, scale, x, y, rotate, userScale])

  /** 处理滚轮缩放 */
  const handleWheel = useLatestCallback((e: WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isUserInteractingRef.current = true
    setIsUserInteracting(true)

    const delta = e.deltaY > 0
      ? -0.1
      : 0.1
    const newScale = Math.max(0.1, Math.min(5, scale + delta))
    onScaleChange(newScale)
    userScale.set(newScale)

    /** 使用 debounce 延迟重置交互标志，确保滚轮连续操作时不会恢复动画 */
    resetInteractionFlag()
  })

  /** 处理拖动 */
  const handleDragStart = useLatestCallback(() => {
    isUserInteractingRef.current = true
    setIsUserInteracting(true)
    onDraggingChange(true)
  })

  const handleDragEnd = useLatestCallback(() => {
    onDraggingChange(false)
    /** 拖动结束后立即重置交互标志，因为拖动已经完成 */
    isUserInteractingRef.current = false
    setIsUserInteracting(false)
  })

  const handleDrag = useLatestCallback((e: MouseEvent) => {
    if (!isDragging) return

    const newPosition = {
      x: position.x + e.movementX,
      y: position.y + e.movementY,
    }
    onPositionChange(newPosition)
    x.set(newPosition.x)
    y.set(newPosition.y)
  })

  /**
   * 添加事件监听
   *
   * img 带 key={src}，切图会换成一个全新的节点，所以必须跟着 src 重新绑定：
   * 否则新节点上没有监听，滚轮不再被拦下、直接冒泡到遮罩变成「切图」，缩放与拖拽一起失效
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleDragStart)
    container.addEventListener('mousemove', handleDrag)
    container.addEventListener('mouseup', handleDragEnd)
    container.addEventListener('mouseleave', handleDragEnd)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mousedown', handleDragStart)
      container.removeEventListener('mousemove', handleDrag)
      container.removeEventListener('mouseup', handleDragEnd)
      container.removeEventListener('mouseleave', handleDragEnd)
    }
  }, [src, handleWheel, handleDragStart, handleDrag, handleDragEnd])

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  /** 图片加载完成处理（如果后续需要基于加载状态做别的事，可以在这里扩展） */
  const handleImageLoad = useCallback(() => {
    /** 当前不再根据加载状态做缩放动画，仅保留接口 */
  }, [])

  return (
    <motion.img
      ref={ containerRef }
      key={ src }
      initial={ { opacity: 0 } }
      animate={ { opacity: 1 } }
      /** 退出时也只做透明度动画，避免额外的缩放效果 */
      exit={ { opacity: 0 } }
      transition={ { duration: 0.3 } }
      onClick={ stopPropagation }
      onLoad={ handleImageLoad }
      style={ {
        x,
        y,
        rotate,
        scale: finalScale, // 使用组合后的 scale（初始动画 + 用户操作）
        /**
         * 让出四周被工具栏 / 缩略图占用的空间：
         * 先从可用尺寸里减掉，再把居中位置往让出的反方向平移一半，图片就落在剩余区间的正中
         *
         * 外部配置了 maxWidth 时与可用空间取小值，窄视口下仍以让位结果为准
         */
        maxWidth: maxWidth != null
          ? `min(${maxWidth}px, calc(100vw - ${insets.left + insets.right}px))`
          : `calc(100vw - ${insets.left + insets.right}px)`,
        maxHeight: `calc(100vh - ${insets.top + insets.bottom}px)`,
        marginTop: insets.top - insets.bottom,
        marginLeft: insets.left - insets.right,
        cursor: isDragging
          ? 'grabbing'
          : 'grab',
        ...imgStyle,
      } }
      src={ src }
      draggable={ false }
      alt="Preview"
      className="relative object-contain"
    />
  )
})

PreviewImage.displayName = 'PreviewImage'

export interface PreviewImageProps {
  /**
   * 图片URL
   */
  src: string
  /**
   * 是否正在拖动
   */
  isDragging: boolean
  /**
   * 缩放值
   */
  scale: number
  /**
   * 旋转角度
   */
  rotation: number
  /**
   * 位置偏移
   */
  position: { x: number; y: number }
  /**
   * 缩放值变化回调
   */
  onScaleChange: (scale: number) => void
  /**
   * 位置变化回调
   */
  onPositionChange: (position: { x: number; y: number }) => void
  /**
   * 拖动状态变化回调
   */
  onDraggingChange: (isDragging: boolean) => void
  /**
   * 四周需要让出的空间（像素），用于避开工具栏、缩略图列表与视口边距
   */
  insets: PreviewImageInsets
  /**
   * 图片基准显示的最大宽度（px），实际生效值为它与视口可用宽度的较小者
   * 不传则只受视口可用宽度约束
   */
  maxWidth?: number
}

export interface PreviewImageInsets {
  top: number
  bottom: number
  left: number
  right: number
}
