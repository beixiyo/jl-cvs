import type { RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'

interface UseTimelineScrollProps {
  timelineRef: RefObject<HTMLDivElement>
  onReachThreshold: () => void
  threshold?: number
}

export function useTimelineScroll({
  timelineRef,
  onReachThreshold,
  threshold = 0.65, // Load more when scrolled to 50% of viewport width
}: UseTimelineScrollProps) {
  const [scrollLeft, setScrollLeft] = useState<number>(0)
  const [isScrolling, setIsScrolling] = useState<boolean>(false)

  // Handle scroll event
  const handleScroll = useCallback(() => {
    if (!timelineRef.current)
      return

    const { scrollLeft, clientWidth } = timelineRef.current
    setScrollLeft(scrollLeft)
    setIsScrolling(true)

    // Check if we've scrolled to the threshold
    const viewportThreshold = clientWidth * threshold
    const hasReached = scrollLeft >= viewportThreshold

    if (hasReached) {
      onReachThreshold?.()
    }
  }, [onReachThreshold, threshold, timelineRef])

  // Reset scrolling state after a delay
  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isScrolling) {
      timeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    return () => {
      if (timeout)
        clearTimeout(timeout)
    }
  }, [isScrolling])

  // Smoothly scroll to a specific position
  const scrollToPosition = useCallback((position: number) => {
    if (!timelineRef.current)
      return

    timelineRef.current.scrollTo({
      left: position,
      behavior: 'auto',
    })
  }, [timelineRef])

  return {
    scrollLeft,
    isScrolling,
    handleScroll,
    scrollToPosition,
  }
}

export default useTimelineScroll
