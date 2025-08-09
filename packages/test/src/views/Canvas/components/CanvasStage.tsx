import type { CanvasApp as CanvasAppType } from '@jl-org/cvs'
import type { ToolMode } from './Toolbar'
import { CanvasApp } from '@jl-org/cvs'
import { Circle, Rect } from '@jl-org/cvs'
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

    // Add initial demo shapes
    addDefaultShapes(app)

    /** 添加拖拽事件监听器 */
    app.on('shapeDragStart', (shape) => {

    })

    app.on('shapeDrag', (shape) => {

    })

    app.on('shapeDragEnd', (shape) => {

    })

    onReady?.(app)

    return () => {
      app.dispose()
    }
  }, [onReady])

  /**
   * Add default shapes to the canvas when it initializes
   */
  const addDefaultShapes = (app: CanvasAppType) => {
    // Create a rectangle
    const rect = new Rect({
      startX: 100,
      startY: 100,
      shapeStyle: {
        fillStyle: '#3b82f6', // blue
        strokeStyle: '#1d4ed8', // darker blue
        lineWidth: 2,
      },
      meta: {
        id: 'default-rect',
        zIndex: 1,
        visible: true,
      },
    })
    rect.endX = 250
    rect.endY = 200
    app.add(rect)

    // Create a circle
    const circle = new Circle({
      startX: 350,
      startY: 150,
      shapeStyle: {
        fillStyle: '#ef4444', // red
        strokeStyle: '#b91c1c', // darker red
        lineWidth: 2,
      },
      meta: {
        id: 'default-circle',
        zIndex: 1,
        visible: true,
      },
    })
    circle.endX = 400
    circle.endY = 150
    app.add(circle)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-2 text-xs text-slate-500">
        内置：平移/缩放/形状拖拽；点击形状可拖拽，点击空白区域可平移画布
      </div>
      <div ref={ containerRef } className="flex-1 bg-white" />
    </div>
  )
}

export const CanvasStage = memo(CanvasStageInner)
