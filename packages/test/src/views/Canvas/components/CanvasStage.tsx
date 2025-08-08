import type { CanvasApp as CanvasAppType } from '@jl-org/cvs'
import type { ToolMode } from './Toolbar'
import { CanvasApp } from '@jl-org/cvs'
import { memo, useEffect, useRef } from 'react'

export interface CanvasStageProps {
  mode: ToolMode
  onReady?: (app: CanvasAppType) => void
}

function CanvasStageInner({ onReady }: CanvasStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const appRef = useRef<CanvasAppType | null>(null)

  useEffect(() => {
    if (!containerRef.current)
      return
    const app = new CanvasApp({
      container: containerRef.current,
      background: '#ffffff',
      minZoom: 0.1,
      maxZoom: 8,
      zoom: 1,
    })
    appRef.current = app
    onReady?.(app)

    return () => {
      app.dispose()
    }
  }, [onReady])

  return (
    <div className="grid grid-rows-[auto_1fr] h-full min-h-[400px]">
      <div className="text-xs text-slate-500 px-4 py-2 bg-white">内置：平移/缩放；后续绘制由库内部工具接管</div>
      <div ref={ containerRef } className="w-full h-full bg-white" />
    </div>
  )
}

export const CanvasStage = memo(CanvasStageInner)
