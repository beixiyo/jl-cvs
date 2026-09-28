'use client'

import { cn } from '@/utils'
import { Download, RefreshCw, RotateCw } from 'lucide-react'
import { memo } from 'react'

/**
 * 预览工具栏里的单个按钮
 *
 * 导出给外部使用：自定义工具栏内容时，用它保持与内置按钮一致的尺寸与配色
 */
export const PreviewToolbarButton = memo<PreviewToolbarButtonProps>(({
  className,
  children,
  ...rest
}) => {
  return (
    <button
      type="button"
      className={ cn(
        'flex shrink-0 items-center justify-center rounded-[10px] p-1.5',
        'text-background transition-colors hover:bg-background/15',
        className,
      ) }
      { ...rest }
    >
      { children }
    </button>
  )
})

PreviewToolbarButton.displayName = 'PreviewToolbarButton'

/**
 * 预览的底部工具栏
 *
 * 内置旋转与重置；`children` 用于追加自定义按钮（删除、下载等），
 * 需要整条替换时用 `PreviewImg` 的 `renderToolbar`
 */
export const ControlButtons = memo<ControlButtonsProps>(({
  onRotate,
  onReset,
  onDownload,
  className,
  children,
}) => {
  return (
    <div
      className={ cn(
        'flex items-center gap-2 rounded-xl bg-text px-2 py-1',
        'shadow-[0px_8px_24px_rgb(0_0_0/0.15)]',
        className,
      ) }
    >
      <PreviewToolbarButton onClick={ onRotate } aria-label="旋转图片">
        <RotateCw size={ 16 } strokeWidth={ 2 } />
      </PreviewToolbarButton>

      <PreviewToolbarButton onClick={ onReset } aria-label="重置图片">
        <RefreshCw size={ 16 } strokeWidth={ 2 } />
      </PreviewToolbarButton>

      <PreviewToolbarButton onClick={ onDownload } aria-label="下载图片">
        <Download size={ 16 } strokeWidth={ 2 } />
      </PreviewToolbarButton>

      { children }
    </div>
  )
})

ControlButtons.displayName = 'ControlButtons'

export type PreviewToolbarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export interface ControlButtonsProps {
  /**
   * 旋转按钮点击回调
   */
  onRotate: (e: React.MouseEvent) => void
  /**
   * 重置按钮点击回调
   */
  onReset: (e: React.MouseEvent) => void
  /**
   * 下载按钮点击回调
   */
  onDownload: (e: React.MouseEvent) => void
  /**
   * 工具栏额外类名
   */
  className?: string
  /**
   * 追加到内置按钮之后的自定义内容
   */
  children?: React.ReactNode
}
