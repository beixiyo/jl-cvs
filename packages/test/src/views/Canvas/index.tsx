import type { CanvasApp } from '@jl-org/cvs'
import { createUnReDoList } from '@jl-org/cvs'
import { uniqueId } from '@jl-org/tool'
import { useCallback, useRef, useState } from 'react'
import { CanvasStage } from './components/CanvasStage'
import { Toolbar, type ToolMode } from './components/Toolbar'

/**
 * Canvas 测试页：演示无限画布、画笔、矩形、图片上传、撤销
 */
export default function Canvas() {
  const appRef = useRef<CanvasApp | null>(null)
  const [mode, setMode] = useState<ToolMode>('pan')
  const history = useRef(createUnReDoList<any>())
  const [, setTick] = useState(0)

  const [penColor, setPenColor] = useState('#0f172a')
  const [penWidth, setPenWidth] = useState(2)

  const handleReady = useCallback((app: CanvasApp) => {
    appRef.current = app
    // Initial shapes are now added in CanvasStage component
  }, [])

  const handleAddRect = useCallback(() => {
    const app = appRef.current
    if (!app)
      return
    const id = uniqueId()
    const center = app.screenToWorld({ x: 200, y: 200 })
    // const rect = new DemoRect({ id, x: center.x, y: center.y, width: 120, height: 80 })
    // app.add(rect)
    history.current.add({ type: 'add', shape: 'rect', id })
    setTick(x => x + 1)
  }, [])

  const handleAddImage = useCallback(async (file: File) => {
    const app = appRef.current
    if (!app)
      return
    const id = uniqueId()
    const p = app.screenToWorld({ x: 300, y: 200 })
    const url = URL.createObjectURL(file)
    // const img = new DemoImage({ id, x: p.x, y: p.y, width: 240, height: 160, src: url })
    // app.add(img)
    history.current.add({ type: 'add', shape: 'image', id })
    setTick(x => x + 1)
  }, [])

  const onSnapshot = useCallback((payload: any) => {
    history.current.add(payload)
    setTick(x => x + 1)
  }, [])

  const onUndo = useCallback(() => {
    const app = appRef.current
    if (!app)
      return
    const item = history.current.undo()
    if (!item)
      return
    const last = history.current.getLast()
    if (last?.type === 'add' && last.id) {
      app.remove(last.id)
    }
    setTick(x => x + 1)
  }, [])

  const onRedo = useCallback(() => {
    /** 简易示例：redo 仅移动历史指针，不做重建（M2 完善基于操作重放） */
    history.current.redo()
    setTick(x => x + 1)
  }, [])

  const onClear = useCallback(() => {
    const app = appRef.current
    if (!app)
      return
    app.clear()
    history.current.cleanAll()
    setTick(x => x + 1)
  }, [])

  return (
    <div className="h-full flex flex-col bg-white p-4">
      <Toolbar
        app={ appRef.current }
        mode={ mode }
        onModeChange={ setMode }
        onUndo={ onUndo }
        onRedo={ onRedo }
        onClear={ onClear }
        onAddRect={ handleAddRect }
        penColor={ penColor }
        penWidth={ penWidth }
        onPenColorChange={ setPenColor }
        onPenWidthChange={ setPenWidth }
        onAddImage={ handleAddImage }
      />
      <div className="mt-4 flex-1 overflow-hidden border border-gray-200 rounded-lg">
        <CanvasStage onReady={ handleReady } mode={ mode } />
      </div>
    </div>
  )
}
