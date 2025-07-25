import type { NoteBoardWithBase64Mode } from '@jl-org/cvs'
import { Download, Eraser, Move, PaintbrushVertical, Redo, RotateCcw, Trash2, Undo } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { Slider } from '@/components/Slider'
import { cn } from '@/utils'

export const Toolbar = memo<ToolbarProps>(({
  onDraw,
  onErase,
  onDownload,
  onBrushSizeChange,
  onDrag,
  onResetSize,
  onUndo,
  onRedo,
  onClear,
}) => {
  const [brushSize, setBrushSize] = useState(30)
  const [activeMode, setActiveMode] = useState<NoteBoardWithBase64Mode>('draw')

  // ======================
  // * Handle
  // ======================
  const handleDraw = useCallback(() => {
    onDraw?.()
    setActiveMode('draw')
  }, [onDraw])

  const handleErase = useCallback(() => {
    onErase?.()
    setActiveMode('erase')
  }, [onErase])

  const handleDrag = useCallback(() => {
    onDrag?.()
    setActiveMode('drag')
  }, [onDrag])

  const sliderContent = (props: { mode: NoteBoardWithBase64Mode }) => (
    <div className="w-48 flex items-center justify-center gap-2">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        { brushSize }
        px
      </div>

      <Slider
        min={ 1 }
        max={ 100 }
        step={ 1 }
        value={ brushSize }
        onChange={ setBrushSize }
        onChangeComplete={ (size) => {
          onBrushSizeChange(size)
          props.mode === 'draw' && onDraw?.()
          props.mode === 'erase' && onErase?.()
        } }
        tooltip={ false }
      />
    </div>
  )

  return (
    <div className="mb-4 w-full flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <Popover content={ sliderContent({ mode: 'draw' }) } trigger="hover" position="bottom" removeDelay={ 100 }>
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ handleDraw }
            leftIcon={ <PaintbrushVertical className="h-4 w-4" /> }
            className={ cn(activeMode === 'draw' && '!bg-indigo-500 !text-white') }
          >
            涂抹
          </Button>
        </Popover>

        <Popover content={ sliderContent({ mode: 'erase' }) } trigger="hover" position="bottom" removeDelay={ 100 }>
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ handleErase }
            leftIcon={ <Eraser className="h-4 w-4" /> }
            className={ cn(activeMode === 'erase' && '!bg-indigo-500 !text-white') }
          >
            擦除
          </Button>
        </Popover>

        <Button
          designStyle="neumorphic"
          size="sm"
          rounded="full"
          onClick={ onDownload }
          leftIcon={ <Download className="h-4 w-4" /> }
        >
          下载
        </Button>
      </div>

      <div className="flex items-center gap-2">
        { onDrag && (
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ handleDrag }
            leftIcon={ <Move className="h-4 w-4" /> }
            className={ cn(activeMode === 'drag' && '!bg-indigo-500 !text-white') }
          >
            拖拽
          </Button>
        ) }

        { onResetSize && (
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ onResetSize }
            leftIcon={ <RotateCcw className="h-4 w-4" /> }
          >
            重置大小
          </Button>
        ) }

        { onUndo && (
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ onUndo }
            leftIcon={ <Undo className="h-4 w-4" /> }
          >
            撤回
          </Button>
        ) }

        { onRedo && (
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ onRedo }
            leftIcon={ <Redo className="h-4 w-4" /> }
          >
            重做
          </Button>
        ) }

        { onClear && (
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ onClear }
            leftIcon={ <Trash2 className="h-4 w-4" /> }
          >
            清理
          </Button>
        ) }
      </div>
    </div>
  )
})

Toolbar.displayName = 'Toolbar'

export type ToolbarProps = {
  onDraw?: () => void
  onErase?: () => void

  onDownload: () => void
  onBrushSizeChange: (size: number) => void

  onDrag?: () => void
  onResetSize?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onClear?: () => void
}
