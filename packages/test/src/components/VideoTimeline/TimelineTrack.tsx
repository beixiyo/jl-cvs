import type { VideoFrame } from './types'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { cn } from '@/utils'

interface TimelineTrackProps {
  frames: VideoFrame[]
  height: number
  perWidth?: number
  currentFrameIndex: number
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 图片轨道
 */
export const TimelineTrack: React.FC<TimelineTrackProps> = memo(({
  frames,
  height,
  currentFrameIndex,
  perWidth = 100,
}) => {
  if (frames.length === 0) {
    return (
      <div
        className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400"
        style={ { minWidth: '100%' } }
      >
        No frames available
      </div>
    )
  }

  return (
    <div
      className="relative"
      style={ {
        height: `${height}px`,
        width: `${frames.length * perWidth}px`,
      } }
    >
      { frames.map((frame, index) => (
        <motion.div
          initial={ { opacity: 0, x: 10, y: 10 } }
          animate={ { opacity: 1, x: 0, y: 0 } }
          exit={ { opacity: 0, x: -10, y: -10 } }
          key={ `${frame.id}-${index}` }
          className={ cn(
            'absolute top-0 transition-all duration-200 cursor-pointer',
            'transition-all duration-300',
            index === currentFrameIndex
              ? 'opacity-100'
              : 'opacity-50',
          ) }
          style={ {
            width: perWidth,
            height: '100%',
            left: `${index * perWidth}px`,
            backgroundImage: `url(${frame.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } }
        >
          <div className="absolute bottom-0 left-0 right-0 flex items-center bg-black bg-opacity-40 px-1 py-0.5 text-xs text-white">
            <Clock size={ 10 } className="mr-1" />
            { formatTimestamp(frame.timestamp) }
          </div>
        </motion.div>
      )) }
    </div>
  )
})

TimelineTrack.displayName = 'TimelineTrack'
