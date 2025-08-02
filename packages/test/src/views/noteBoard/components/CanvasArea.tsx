import type { RefObject } from 'react'
import { CANVAS_CONFIG } from '../constants'

export interface CanvasAreaProps {
  canvasContainerRef: RefObject<HTMLDivElement>
}

export function CanvasArea({ canvasContainerRef }: CanvasAreaProps) {
  const { width, height } = CANVAS_CONFIG

  return (
    <div className="flex justify-center items-center relative">
      <div
        ref={ canvasContainerRef }
        className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/30 bg-white dark:bg-gray-800/50 dark:border-gray-600/30"
        style={ { width, height } }
      />
    </div>
  )
}
