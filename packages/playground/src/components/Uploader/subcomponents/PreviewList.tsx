import { cn } from '@/utils'
import { Plus } from 'lucide-react'
import { Fragment, memo } from 'react'
import { Border } from '../../Border'
import { CloseBtn } from '../../CloseBtn'
import { LazyImg } from '../../LazyImg'
import type { PreviewConfig, UploaderProps } from '../types'
import { getStrokeColor } from '../utils'

export interface PreviewListProps {
  previewImgs?: string[]
  mode: UploaderProps['mode']
  disabled?: boolean
  maxCount?: number
  previewConfig?: PreviewConfig
  onRemove?: (index: number) => void
  onTriggerClick?: () => void
  dragActive?: boolean
  dragInvalid?: boolean
  className?: string
}

export const PreviewList = memo<PreviewListProps>((props) => {
  const {
    previewImgs,
    mode,
    disabled,
    maxCount,
    previewConfig,
    onRemove,
    onTriggerClick,
    dragActive = false,
    dragInvalid = false,
    className,
  } = props

  const isCardMode = mode === 'card'
  if (!previewImgs?.length && !isCardMode) return null

  const config = {
    width: 70,
    height: 70,
    ...previewConfig,
  }

  const defaultRenderItem = ({ src, index, onRemove }: { src: string; index: number; onRemove: () => void }) => (
    <div
      key={ index }
      className={ cn(
        'relative flex items-center justify-center',
        'overflow-hidden rounded-2xl',
        'transition-all duration-200',
        {
          'hover:shadow-md hover:border-border3': !disabled,
          'opacity-75': disabled,
        },
      ) }
      style={ {
        width: config.width,
        height: config.height,
      } }
    >
      <LazyImg
        lazy={ false }
        src={ src }
        alt={ `预览图片 ${index + 1}` }
        className="h-full w-full rounded-2xl object-cover"
        previewImages={ previewImgs }
      />

      { !disabled && <CloseBtn onClick={ onRemove } size="sm" className="right-1 top-1" variant="filled" /> }
    </div>
  )

  const defaultAddTrigger = () => (
    <button
      type="button"
      key="add-trigger"
      onClick={ onTriggerClick }
      disabled={ disabled }
      aria-label="Add files"
      className={ cn(
        'relative flex items-center justify-center',
        'transition-all duration-200',
        {
          'cursor-pointer': !disabled,
          'cursor-not-allowed opacity-50': disabled,
        },
      ) }
      style={ {
        width: config.width,
        height: config.height,
      } }
    >
      <Border
        borderRadius={ 8 }
        strokeWidth={ 1 }
        animated={ !disabled }
        className="flex items-center justify-center"
        strokeColor={ getStrokeColor({ disabled, dragActive, dragInvalid }) }
        hoverStrokeColor={ disabled
          ? 'rgb(var(--textDisabled) / 1)'
          : 'rgb(var(--brand) / 1)' }
      >
        <Plus
          className={ cn(
            'size-6 transition-colors',
            disabled
              ? 'text-textDisabled'
              : 'text-text4 group-hover:text-text2',
          ) }
        />
      </Border>
    </button>
  )

  const addTriggerProps = {
    onClick: () => onTriggerClick?.(),
    disabled: disabled ?? false,
    width: config.width,
    height: config.height,
    dragActive,
    dragInvalid,
  }

  const renderAddTriggerFn = previewConfig?.renderAddTrigger
  const renderAddTrigger = () =>
    renderAddTriggerFn
      ? <Fragment key="add-trigger">{ renderAddTriggerFn(addTriggerProps) }</Fragment>
      : defaultAddTrigger()

  return (
    <div
      className={ cn(
        'overflow-auto flex flex-wrap gap-3 sm:gap-4 shrink-0 w-full',
        'scrollbar-thin scrollbar-thumb-border3',
        'scrollbar-track-transparent',
        !isCardMode && 'mt-4',
        className,
      ) }
      style={ {
        maxHeight: isCardMode
          ? undefined
          : config.height * 2,
      } }
    >
      { previewImgs?.map((src, index) =>
        config.renderItem
          ? config.renderItem({
            src,
            index,
            onRemove: () => onRemove?.(index),
          })
          : defaultRenderItem({
            src,
            index,
            onRemove: () => onRemove?.(index),
          })
      ) }
      { isCardMode && (!maxCount || (previewImgs?.length || 0) < maxCount) && renderAddTrigger() }
    </div>
  )
})

PreviewList.displayName = 'PreviewList'
