import type { Mode } from '@jl-org/cvs'
import type { FileItem } from '@/components/Uploader'
import {
  Download,
  Image as ImageIcon,
  Layers,
  PaintbrushVertical,
  Redo,
  RotateCcw,
  Trash2,
  Undo,
  Upload,
} from 'lucide-react'

import { memo } from 'react'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { Uploader } from '@/components/Uploader'
import { cn } from '@/utils'
import { ToolbarIconMap } from './constants'
import { SliderContent } from './SliderContent'

export const Toolbar = memo<ToolbarProps>(({
  modes,
  activeMode,
  onModeChange,

  brushSize,
  onBrushSizeChange,

  onDownload,
  onExport,
  onExportAll,
  onImageUpload,

  onResetSize,
  onUndo,
  onRedo,
  onClear,

  canUndo = true,
  canRedo = true,
}) => {
  return (
    <div className="mb-4 w-full flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      <div className="flex flex-wrap items-center gap-3">
        { modes?.map((mode) => {
          const Icon = ToolbarIconMap[mode.value as keyof typeof ToolbarIconMap] || PaintbrushVertical
          const button = (
            <Button
              key={ mode.value }
              designStyle="neumorphic"
              size="sm"
              rounded="full"
              onClick={ () => onModeChange?.(mode.value) }
              leftIcon={ <Icon className="h-4 w-4" /> }
              className={ cn(activeMode === mode.value && '!bg-indigo-500 !text-white') }
            >
              { mode.label }
            </Button>
          )

          if (mode.hasBrushSlider) {
            return (
              <Popover
                key={ mode.value }
                content={ <SliderContent
                  mode={ mode.value }
                  brushSize={ brushSize ?? 1 }
                  onBrushSizeChange={ onBrushSizeChange }
                  onModeChange={ onModeChange }
                /> }
                trigger="hover"
                position="bottom"
                removeDelay={ 100 }
              >
                { button }
              </Popover>
            )
          }

          return button
        }) }

        { onImageUpload && (
          <Uploader
            accept="image/*"
            onChange={ onImageUpload }
            className="w-auto"
          >
            <Button
              designStyle="neumorphic"
              size="sm"
              rounded="full"
              leftIcon={ <Upload className="h-4 w-4" /> }
            >
              上传
            </Button>
          </Uploader>
        ) }

        { onDownload && (
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ onDownload }
            leftIcon={ <Download className="h-4 w-4" /> }
          >
            下载
          </Button>
        ) }

        { onExport && (
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ onExport }
            leftIcon={ <ImageIcon className="h-4 w-4" /> }
          >
            导出图片和遮罩
          </Button>
        ) }

        { onExportAll && (
          <Button
            designStyle="neumorphic"
            size="sm"
            rounded="full"
            onClick={ onExportAll }
            leftIcon={ <Layers className="h-4 w-4" /> }
          >
            导出所有图层
          </Button>
        ) }
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
            disabled={ !canUndo }
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
            disabled={ !canRedo }
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

export type ToolbarMode = {
  value: Mode
  label: string
  /**
   * 是否显示画笔大小调节器
   */
  hasBrushSlider?: boolean
}

export type ToolbarProps = {
  modes?: ToolbarMode[]
  activeMode?: Mode
  onModeChange?: (mode: Mode) => void

  brushSize?: number
  onBrushSizeChange?: (size: number) => void

  onDownload?: () => void
  onExport?: () => void
  onExportAll?: () => void
  onImageUpload?: (files: FileItem[]) => void

  onResetSize?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onClear?: () => void

  canUndo?: boolean
  canRedo?: boolean
}