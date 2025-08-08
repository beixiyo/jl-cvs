import type { CanvasApp } from '@jl-org/cvs'
import { Image as ImageIcon, Move, Pencil, Plus, RectangleHorizontal, RotateCcw, RotateCw, Trash2 } from 'lucide-react'
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

  const btn = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700'
  const active = 'bg-slate-900 text-white hover:bg-slate-900 border-slate-900'

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
      <div className="mx-auto max-w-[1200px] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className={ `${btn} ${mode === 'pan'
              ? active
              : ''}` }
            onClick={ () => onModeChange('pan') }>
            <Move size={ 16 } />
            {' '}
            平移
          </button>
          <button
            className={ `${btn} ${mode === 'rect'
              ? active
              : ''}` }
            onClick={ () => onModeChange('rect') }>
            <RectangleHorizontal size={ 16 } />
            {' '}
            矩形
          </button>
          <button
            className={ `${btn} ${mode === 'pen'
              ? active
              : ''}` }
            onClick={ () => onModeChange('pen') }>
            <Pencil size={ 16 } />
            {' '}
            画笔
          </button>
          <div className="ml-3 flex items-center gap-2">
            <label className="text-xs text-slate-500">颜色</label>
            <input type="color" value={ penColor } onChange={ e => onPenColorChange(e.target.value) } className="h-7 w-7 p-0 border border-slate-200 rounded" />
            <label className="text-xs text-slate-500 ml-2">粗细</label>
            <input type="range" min={ 1 } max={ 20 } step={ 1 } value={ penWidth } onChange={ e => onPenWidthChange(Number(e.target.value)) } />
            <span className="text-xs text-slate-500 w-6 text-right">{penWidth}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={ btn } onClick={ () => app?.setZoom(zoom * 1.1) }>
            <Plus size={ 16 } />
            {' '}
            放大
          </button>
          <button className={ btn } onClick={ () => app?.setZoom(zoom / 1.1) }>- 缩小</button>
          <button className={ btn } onClick={ onUndo }>
            <RotateCcw size={ 16 } />
            {' '}
            撤销
          </button>
          <button className={ btn } onClick={ onRedo }>
            <RotateCw size={ 16 } />
            {' '}
            重做
          </button>
          <button className={ btn } onClick={ onAddRect }>
            <RectangleHorizontal size={ 16 } />
            {' '}
            添加矩形
          </button>
          <button className={ btn } onClick={ triggerUpload }>
            <ImageIcon size={ 16 } />
            {' '}
            上传图片
          </button>
          <button className={ `${btn} text-red-600 border-red-200 hover:bg-red-50` } onClick={ onClear }>
            <Trash2 size={ 16 } />
            {' '}
            清空
          </button>
          <span className="ml-3 text-slate-500">
            缩放:
            {zoom.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
