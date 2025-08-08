import type { RefObject } from 'react'
import { CANVAS_CONFIG } from '../constants'

export interface CanvasAreaProps {
  canvasContainerRef: RefObject<HTMLDivElement>
}

export function CanvasArea({ canvasContainerRef }: CanvasAreaProps) {
  const { width, height } = CANVAS_CONFIG

  return (
    <div className="relative flex items-center justify-center">
      <div
        ref={ canvasContainerRef }
        className="relative overflow-hidden border border-white/30 rounded-2xl bg-white shadow-2xl dark:border-gray-600/30 dark:bg-gray-800/50"
        style={ { width, height } }
      />
    </div>
  )
}
