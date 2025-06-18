import { motion, useMotionValue } from 'framer-motion'
import { RefreshCw, RotateCw } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useBindWinEvent, useGetState } from '@/hooks'
import { Icon } from '../Icon'
import { Mask } from '../Mask'
import { RmBtn } from '../RmBtn'

export const PreviewImg = memo<PreviewImgProps>((
  {
    style,
    className,
    src,
    onClose,
  },
) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  /** 用于动画的值 */
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  const scaleValue = useMotionValue(1)

  const [imgStyle, setImgStyle] = useGetState<React.CSSProperties>({
    transition: '.2s transform',
  })

  /** 重置状态 */
  const resetState = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setImgStyle.reset()

    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    x.set(0)
    y.set(0)
    rotate.set(0)
    scaleValue.set(1)
  }, [x, y, rotate, scaleValue])

  /** 处理滚轮缩放 */
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImgStyle({ transition: 'none' })

    const delta = e.deltaY > 0
      ? -0.1
      : 0.1
    const newScale = Math.max(0.1, Math.min(5, scale + delta))
    setScale(newScale)
    scaleValue.set(newScale)
  }, [scale, scaleValue])

  /** 处理拖动 */
  const handleDragStart = useCallback(() => {
    setImgStyle({ transition: 'none' })
    setIsDragging(true)
  }, [setImgStyle])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging)
      return

    setPosition(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }))
    x.set(position.x + e.movementX)
    y.set(position.y + e.movementY)
  }, [isDragging, position, x, y])

  /** 处理旋转 */
  const handleRotate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setImgStyle.reset()

    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
    rotate.set(newRotation)
  }, [rotation, rotate])

  /** 添加事件监听 */
  useEffect(() => {
    const container = containerRef.current
    if (!container)
      return

    const lastOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleDragStart)
    container.addEventListener('mousemove', handleDrag)
    container.addEventListener('mouseup', handleDragEnd)
    container.addEventListener('mouseleave', handleDragEnd)

    return () => {
      document.body.style.overflow = lastOverflow

      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mousedown', handleDragStart)
      container.removeEventListener('mousemove', handleDrag)
      container.removeEventListener('mouseup', handleDragEnd)
      container.removeEventListener('mouseleave', handleDragEnd)
    }
  }, [handleWheel, handleDragStart, handleDrag, handleDragEnd])

  useBindWinEvent('keydown', (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  })

  return <Mask
    style={ style }
    className={ className }
  >
    <motion.div
      ref={ containerRef }
      initial={ { scale: 0.8, opacity: 0 } }
      animate={ { scale: 1, opacity: 1 } }
      exit={ { scale: 0.8, opacity: 0 } }
      transition={ { type: 'spring', duration: 0.3 } }
      className="relative max-h-[90vh] max-w-[90vw] select-none"
      onClick={ e => e.stopPropagation() }
    >
      <motion.div
        layoutId={ src }
        style={ {
          x,
          y,
          rotate,
          scale: scaleValue,
          ...imgStyle,
        } }
        className="relative"
      >
        <img
          src={ src }
          draggable={ false }
          alt="Preview"
          className="max-h-[90vh] max-w-full object-contain"
          style={ {
            cursor: isDragging
              ? 'grabbing'
              : 'grab',
          } }
        />
      </motion.div>
    </motion.div>

    {/* 控制按钮组 */ }
    <div className="fixed bottom-4 left-1/2 flex items-center gap-2 -translate-x-1/2">
      <Icon
        onClick={ handleRotate }
        icon={ RotateCw }
      />

      <Icon
        onClick={ resetState }
        icon={ RefreshCw }
      />
    </div>

    <RmBtn
      onClick={ onClose }
      mode="fixed"
    />
  </Mask>
})

PreviewImg.displayName = 'PreviewImg'

export type PreviewImgProps = {
  /**
   * 预览图片的URL
   */
  src: string
  /**
   * 关闭预览的回调函数
   */
  onClose: () => void
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>
