import type { NoteBoardMode } from '@jl-org/cvs'
import { memo } from 'react'
import { Slider } from '@/components/Slider'

/**
 * 使用独立组件包装 Slider，避免在 brushSize 变化时创建新的组件类型，
 * 防止拖拽过程中因组件卸载导致后续无法继续拖动
 */
export const SliderContent = memo<SliderContentProps>((
  {
    mode,
    brushSize,
    onBrushSizeChange,
    onModeChange,
  },
) => (
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
      onChange={ onBrushSizeChange }
      onChangeComplete={ () => {
        mode === 'brush' && onModeChange?.('brush')
        mode === 'erase' && onModeChange?.('erase')
      } }
      tooltip={ false }
    />
  </div>
))

SliderContent.displayName = 'ToolbarSliderContent'

export type SliderContentProps = {
  mode: NoteBoardMode
  brushSize: number
  onBrushSizeChange?: (size: number) => void
  onModeChange?: (mode: NoteBoardMode) => void
}
