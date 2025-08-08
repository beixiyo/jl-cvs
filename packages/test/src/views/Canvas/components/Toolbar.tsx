import type { CanvasApp } from '@jl-org/cvs'
import { Image as ImageIcon, Minus, Move, Pencil, Plus, RectangleHorizontal, RotateCcw, RotateCw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/**
 * 工具模式
 */
export type ToolMode = 'pan' | 'rect' | 'pen'

/**
 * 工具栏属性
 */
export interface ToolbarProps {
  /** 画布应用实例 */
  app?: CanvasApp | null
  /** 当前工具模式 */
  mode: ToolMode
  /** 切换工具模式 */
  onModeChange: (m: ToolMode) => void
  /** 撤销 */
  onUndo: () => void
  /** 重做 */
  onRedo: () => void
  /** 清空场景 */
  onClear: () => void
  /** 添加矩形 */
  onAddRect: () => void
  /** 画笔颜色 */
  penColor: string
  /** 画笔粗细 */
  penWidth: number
  /** 修改画笔颜色 */
  onPenColorChange: (c: string) => void
  /** 修改画笔粗细 */
  onPenWidthChange: (w: number) => void
  /** 添加图片（文件上传） */
  onAddImage: (file: File) => void
}

/**
 * 顶部工具栏
 */
export function Toolbar({ app, mode, onModeChange, onUndo, onRedo, onClear, onAddRect, penColor, penWidth, onPenColorChange, onPenWidthChange, onAddImage }: ToolbarProps) {
  const [zoom, setZoom] = useState(1)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!app)
      return
    const off = app.on('viewportchange', state => setZoom(state.zoom))
    return () => off()
  }, [app])

  const btn = 'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 transition-colors'
  const active = 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
  const iconBtn = 'inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors'
  const activeIconBtn = 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'

  const triggerUpload = () => fileRef.current?.click()
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]
    if (f)
      onAddImage(f)
    /** 清空以便可重复选择同一文件 */
    if (fileRef.current)
      fileRef.current.value = ''
  }

  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <input ref={ fileRef } type="file" accept="image/*" className="hidden" onChange={ handleFileChange } />
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              className={ `${iconBtn} ${mode === 'pan'
                ? activeIconBtn
                : ''}` }
              onClick={ () => onModeChange('pan') }
            >
              <Move size={ 18 } />
            </button>
            <button
              className={ `${iconBtn} ${mode === 'rect'
                ? activeIconBtn
                : ''}` }
              onClick={ () => onModeChange('rect') }
            >
              <RectangleHorizontal size={ 18 } />
            </button>
            <button
              className={ `${iconBtn} ${mode === 'pen'
                ? activeIconBtn
                : ''}` }
              onClick={ () => onModeChange('pen') }
            >
              <Pencil size={ 18 } />
            </button>
          </div>

          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-4">
            <label className="text-sm text-slate-600 font-medium">颜色</label>
            <input
              type="color"
              value={ penColor }
              onChange={ e => onPenColorChange(e.target.value) }
              className="h-8 w-8 cursor-pointer border border-slate-200 rounded-lg p-0"
            />
            <div className="ml-2 flex items-center gap-2">
              <label className="text-sm text-slate-600 font-medium">粗细</label>
              <input
                type="range"
                min={ 1 }
                max={ 20 }
                step={ 1 }
                value={ penWidth }
                onChange={ e => onPenWidthChange(Number(e.target.value)) }
                className="w-24 accent-blue-600"
              />
              <span className="w-6 text-center text-sm text-slate-600">{penWidth}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            <button
              className={ `${iconBtn}` }
              onClick={ () => app?.setZoom(zoom * 1.2) }
            >
              <Plus size={ 18 } />
            </button>
            <span className="min-w-[50px] px-2 text-center text-sm text-slate-600">
              {(zoom * 100).toFixed(0)}
              %
            </span>
            <button
              className={ `${iconBtn}` }
              onClick={ () => app?.setZoom(zoom / 1.2) }
            >
              <Minus size={ 18 } />
            </button>
          </div>

          <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-4">
            <button className={ iconBtn } onClick={ onUndo }>
              <RotateCcw size={ 18 } />
            </button>
            <button className={ iconBtn } onClick={ onRedo }>
              <RotateCw size={ 18 } />
            </button>
            <button className={ btn } onClick={ onAddRect }>
              <RectangleHorizontal size={ 18 } />
              添加矩形
            </button>
            <button className={ btn } onClick={ triggerUpload }>
              <ImageIcon size={ 18 } />
              上传图片
            </button>
            <button className={ `${btn} text-red-600 border-red-200 hover:bg-red-50` } onClick={ onClear }>
              <Trash2 size={ 18 } />
              清空
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
