import type { VideoFrame } from './types'
import React from 'react'

interface CurrentFramePreviewProps {
  frame: VideoFrame | null
  height: number
  width?: number
}

export const CurrentFramePreview: React.FC<CurrentFramePreviewProps> = React.memo(({
  frame,
  height,
  width = 100,
}) => {
  if (!frame) {
    return null
  }

  return (
    <div
      className="relative overflow-hidden border border-gray-200 rounded-md bg-white shadow-lg"
      style={ { width, height: `${height}px` } }
    >
      <img
        src={ frame.src }
        alt={ `Frame at ${frame.timestamp.toFixed(2)}s` }
        className="h-full w-full object-cover"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1 text-xs text-white">
        { Math.floor(frame.timestamp / 60) }
        :
        { Math.floor(frame.timestamp % 60).toString().padStart(2, '0') }
        .
        { Math.floor((frame.timestamp % 1) * 100).toString().padStart(2, '0') }
      </div>
    </div>
  )
})

CurrentFramePreview.displayName = 'CurrentFramePreview'
