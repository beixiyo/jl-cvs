'use client'

import type { VideoFrame } from './types'
import { clamp } from '@jl-org/tool'
import React, { useCallback, useEffect, useState } from 'react'
import { cn } from '@/utils'
import { AnimateShow } from '../Animate'
import { CurrentFramePreview } from './CurrentFramePreview'

interface TimelineSliderProps {
  timelineRef: React.RefObject<HTMLDivElement>
  onPositionChange: (positionPercent: number, currentIndex: number) => void
  trackHeight: number
  currentFrame: VideoFrame | null
  previewHeight: number
  perWidth?: number
}

export const TimelineSlider: React.FC<TimelineSliderProps> = React.memo(({
  timelineRef,
  onPositionChange,
  trackHeight,
  currentFrame,
  previewHeight,
  perWidth = 100,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  /** 0 - 1 */
  const [positionPercent, setPositionPercent] = useState<number>(0)

  // Update slider position based on timeline scroll
  useEffect(() => {
    const updateSliderPosition = () => {
      if (!timelineRef.current || isDragging)
        return

      const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current
      const maxScroll = scrollWidth - clientWidth

      if (maxScroll < 0) {
        setPositionPercent(0)
      }
      else {
        setPositionPercent(scrollLeft / maxScroll)
      }
    }

    const timeline = timelineRef.current
    if (timeline) {
      timeline.addEventListener('scroll', updateSliderPosition)
      // Initial position
      updateSliderPosition()
    }

    return () => {
      if (timeline) {
        timeline.removeEventListener('scroll', updateSliderPosition)
      }
    }
  }, [timelineRef, isDragging])

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const updatePositionFromEvent = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const el = timelineRef.current
    if (!el)
      return

    const timelineRect = el.getBoundingClientRect()
    const { scrollLeft } = el

    let clientX: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
    }
    else {
      clientX = (e as MouseEvent).clientX
    }

    // Calculate position relative to timeline width
    const relativeX = clamp(clientX - timelineRect.left, 0, timelineRect.width)
    const cursorScrollLeft = scrollLeft + relativeX
    const newPosition = relativeX / timelineRect.width
    const currentIndex = Math.floor(cursorScrollLeft / perWidth)

    setPositionPercent(newPosition)
    onPositionChange(newPosition, currentIndex)
  }, [onPositionChange, timelineRef])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging)
        return
      updatePositionFromEvent(e)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, updatePositionFromEvent])

  return (
    <div
      className="absolute bottom-0 left-0 right-0 cursor-pointer"
      style={ { height: `${trackHeight + 5}px` } }
    >
      {/* 图片预览 */ }
      <AnimateShow
        show
        className="absolute z-10"
        style={ {
          left: `clamp(0px, ${positionPercent * 100}%, calc(100% - ${perWidth + 40}px))`,
          transform: 'translateX(-50%)',
          top: `-${previewHeight + 20}px`,
        } }
      >
        <CurrentFramePreview
          width={ perWidth + 40 }
          frame={ currentFrame }
          height={ previewHeight }
        />
      </AnimateShow>

      <div
        className={ cn(
          'absolute w-4 flex items-center justify-center cursor-grab',
          isDragging && 'cursor-grabbing',
        ) }
        style={ {
          left: `${positionPercent * 100}%`,
          transform: 'translateX(-50%)',
          bottom: 0,
          height: `${trackHeight + 20}px`,
        } }
        onMouseDown={ handleMouseDown }
        onTouchStart={ handleMouseDown }
      >
        {/* 竖线 */ }
        <div
          className={ `w-0.5 h-full transition-colors duration-200 ${isDragging
            ? 'bg-blue-500'
            : 'bg-gray-400'
          }` }
        ></div>

        {/* 圆点 */ }
        <div
          className={ `absolute bottom-0 w-4 h-4 rounded-full transition-colors duration-200 ${isDragging
            ? 'bg-blue-500 shadow-md scale-110'
            : 'bg-gray-400'
          }` }
          style={ {
            transform: isDragging
              ? 'scale(1.1)'
              : 'scale(1)',
            transition: 'transform 0.2s, background-color 0.2s',
          } }
        ></div>
      </div>
    </div>
  )
})

TimelineSlider.displayName = 'TimelineSlider'
