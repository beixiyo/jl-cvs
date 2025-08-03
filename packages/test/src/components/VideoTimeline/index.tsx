'use client'

import type { VideoFrame } from './types'
import { useRef, useState } from 'react'
import { useResizeObserver } from '@/hooks'
import { cn } from '@/utils'
import { TimelineSlider } from './TimelineSlider'
import { TimelineTrack } from './TimelineTrack'
import useTimelineScroll from './useTimelineScroll'

const InnerVideoTimeline = forwardRef<VideoTimelineRef, VideoTimelineProps>((
  {
    loadData,
    hasMore,
    data = [],
    trackHeight = 80,
    previewHeight = 120,
    onFrameChange,
    className = '',
  },
  ref,
) => {
  const perWidth = 100

  const [loading, setLoading] = useState<boolean>(false)
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0)
  const currentFrame = data[currentFrameIndex] || null
  const [updateIndex, setUpdateIndex] = useState(0)

  /** 添加一个状态来记录上一次的滚动位置 */
  const lastScrollPosition = useRef<number>(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  const {
    handleScroll,
    scrollToPosition,
  } = useTimelineScroll({
    timelineRef,
    onReachThreshold: async () => {
      if (!hasMore || loading)
        return

      /** 保存当前滚动位置 */
      if (timelineRef.current) {
        lastScrollPosition.current = timelineRef.current.scrollLeft
      }

      setLoading(true)
      try {
        await loadData()
        /** 数据加载完成后，恢复到上一次的滚动位置 */
        requestAnimationFrame(() => {
          if (timelineRef.current) {
            scrollToPosition(lastScrollPosition.current)
          }
        })
      }
      catch (error) {
        console.error('Failed to load more frames:', error)
      }
      finally {
        setLoading(false)
      }
    },
  })

  const handleSliderMove = (positionPercent: number, currentIndex: number) => {
    if (!timelineRef.current) {
      return
    }

    const maxScroll = timelineRef.current.scrollWidth - timelineRef.current.clientWidth
    const targetScroll = Math.min(positionPercent * maxScroll, maxScroll)
    scrollToPosition(targetScroll)

    /** 计算并设置 currentFrameIndex 基于滑块的位置 */
    if (data.length > 0) {
      if (currentIndex !== currentFrameIndex && data[currentIndex]) {
        setCurrentFrameIndex(currentIndex)
        onFrameChange?.(data[currentIndex])
      }
      /** 处理只有一个帧的情况 */
      else if (currentIndex === 0 && data.length === 1 && currentFrameIndex !== 0) {
        setCurrentFrameIndex(0)
        onFrameChange?.(data[0])
      }
    }
  }

  useResizeObserver([timelineRef], () => {
    setUpdateIndex(prev => prev + 1)
  })

  useImperativeHandle(
    ref,
    () => ({
      el: timelineRef.current!,
      isOverflow: timelineRef.current!.scrollWidth > timelineRef.current!.clientWidth,
      scrollWidth: timelineRef.current?.scrollWidth || 0,
      clientWidth: timelineRef.current?.clientWidth || 0,
      scrollLeft: timelineRef.current?.scrollLeft || 0,
    }),
    [updateIndex],
  )

  return (
    <div
      className={ cn(
        'VideoTimelineContainer relative w-full overflow-hidden select-none',
        className,
      ) }
      style={ { height: trackHeight + previewHeight + 40 } }
    >
      <div
        ref={ timelineRef }
        className="hide-scroll absolute bottom-0 w-full overflow-x-auto overflow-y-hidden"
        style={ { height: trackHeight + 20 } }
        onScroll={ handleScroll }
      >
        <TimelineTrack
          perWidth={ perWidth }
          frames={ data }
          height={ trackHeight }
          currentFrameIndex={ currentFrameIndex }
        />
      </div>

      <TimelineSlider
        perWidth={ perWidth }
        timelineRef={ timelineRef }
        onPositionChange={ handleSliderMove }
        trackHeight={ trackHeight }
        currentFrame={ currentFrame }
        previewHeight={ previewHeight }
      />
    </div>
  )
})

InnerVideoTimeline.displayName = 'VideoTimeline'

export const VideoTimeline = memo(InnerVideoTimeline) as typeof InnerVideoTimeline

export interface VideoTimelineProps {
  loadData: () => Promise<void>
  hasMore: boolean
  data: VideoFrame[]
  trackHeight?: number
  previewHeight?: number
  onFrameChange?: (frame: VideoFrame) => void
  className?: string
}

export type VideoTimelineRef = {
  el: HTMLDivElement
  isOverflow: boolean
  scrollWidth: number
  clientWidth: number
  scrollLeft: number
}

export * from './types'
