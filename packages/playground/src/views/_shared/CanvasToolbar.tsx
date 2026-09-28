import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { Slider } from '@/components/Slider'
import { Uploader } from '@/components/Uploader'
import { cn } from '@/utils'
import { Image as ImageIcon, Layers, Paintbrush, Redo, RotateCcw, Square, Trash2, Undo, Upload } from 'lucide-react'
import { memo } from 'react'

/**
 * 画布工具栏：模式切换 + 笔刷大小 + 上传 / 导出 / 撤销重做 / 清空
 *
 * 基于新版 Toolbar 原语（Button.Group 风格）重建，供 NoteBoard / 抠图等画布类演示页复用
 */
export const CanvasToolbar = memo(function CanvasToolbar(
  {
    modes,
    activeMode,
    onModeChange,

    brushSize,
    onBrushSizeChange,

    onImageUpload,
    onExport,
    onExportAll,
    onDownload,

    onResetSize,
    onUndo,
    onRedo,
    onClear,

    canUndo = true,
    canRedo = true,
  }: CanvasToolbarProps,
) {
  const iconMap: Record<string, typeof Paintbrush> = {
    brush: Paintbrush,
    erase: Square,
    drag: Layers,
    rect: Square,
    circle: Square,
    arrow: Square,
    none: Square,
  }

  return (
    <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background2/60 p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        { modes?.map((mode) => {
          const Icon = iconMap[mode.value] ?? Paintbrush
          const button = (
            <Button
              key={ mode.value }
              size="sm"
              rounded="lg"
              leftIcon={ <Icon size={ 14 } /> }
              onClick={ () => onModeChange?.(mode.value) }
              variant={ activeMode === mode.value
                ? 'primary'
                : 'ghost' }
            >
              { mode.label }
            </Button>
          )

          if (mode.hasBrushSlider) {
            return (
              <Popover
                key={ mode.value }
                content={ 
                  <div className="w-56 p-3">
                    <div className="mb-2 flex justify-between text-xs text-text2">
                      <span>笔刷大小</span>
                      <span className="font-mono tabular-nums">{ brushSize ?? 1 }</span>
                    </div>
                    <Slider
                      value={ brushSize ?? 1 }
                      onChange={ (v) => onBrushSizeChange?.(v as number) }
                      min={ 1 }
                      max={ 100 }
                    />
                  </div>
                 }
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
            previewImgs={ [] }
            onChange={ onImageUpload }
            className="w-auto"
          >
            <Button
              size="sm"
              rounded="lg"
              leftIcon={ <Upload size={ 14 } /> }
            >
              上传
            </Button>
          </Uploader>
        ) }
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        { onExport && (
          <Button
            size="sm"
            rounded="lg"
            variant="secondary"
            leftIcon={ <ImageIcon size={ 14 } /> }
            onClick={ onExport }
          >
            导出
          </Button>
        ) }

        { onExportAll && (
          <Button
            size="sm"
            rounded="lg"
            variant="secondary"
            leftIcon={ <Layers size={ 14 } /> }
            onClick={ onExportAll }
          >
            导出全部
          </Button>
        ) }

        { onDownload && (
          <Button
            size="sm"
            rounded="lg"
            variant="secondary"
            onClick={ onDownload }
          >
            下载
          </Button>
        ) }

        <span
          className={ cn(
            onUndo
              ? 'opacity-100'
              : 'pointer-events-none opacity-30',
          ) }
        >
          <Button
            size="sm"
            rounded="lg"
            variant="ghost"
            iconOnly
            disabled={ !canUndo }
            onClick={ onUndo }
            aria-label="撤销"
          >
            <Undo size={ 15 } />
          </Button>
        </span>

        <span
          className={ cn(
            onRedo
              ? 'opacity-100'
              : 'pointer-events-none opacity-30',
          ) }
        >
          <Button
            size="sm"
            rounded="lg"
            variant="ghost"
            iconOnly
            disabled={ !canRedo }
            onClick={ onRedo }
            aria-label="重做"
          >
            <Redo size={ 15 } />
          </Button>
        </span>

        { onResetSize && (
          <Button
            size="sm"
            rounded="lg"
            variant="ghost"
            iconOnly
            onClick={ onResetSize }
            aria-label="重置视口"
          >
            <RotateCcw size={ 15 } />
          </Button>
        ) }

        { onClear && (
          <Button
            size="sm"
            rounded="lg"
            variant="ghost"
            iconOnly
            onClick={ onClear }
            aria-label="清空画布"
          >
            <Trash2 size={ 15 } />
          </Button>
        ) }
      </div>
    </div>
  )
})

export interface ToolbarMode {
  value: string
  label: string
  hasBrushSlider?: boolean
}

export type CanvasToolbarProps = {
  modes?: ToolbarMode[]
  activeMode?: string
  onModeChange?: (mode: string) => void

  brushSize?: number
  onBrushSizeChange?: (size: number) => void

  onImageUpload?: (files: File[]) => void
  onExport?: () => void
  onExportAll?: () => void
  onDownload?: () => void

  onResetSize?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onClear?: () => void

  canUndo?: boolean
  canRedo?: boolean
}
