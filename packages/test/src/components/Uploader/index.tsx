import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

import type { Refs } from '@/hooks'
import { memo } from 'react'
import { cn } from '@/utils'
import { Border } from '../Border'
import { LazyImg } from '../LazyImg'
import { RmBtn } from '../RmBtn'
import { useGenState } from './state'

const InnerUploader = forwardRef<UploaderRef, UploaderProps>((props, ref) => {
  const {
    disabled,
    distinct,
    maxCount,
    maxSize,
    maxPixels,
    onChange,
    onRemove,
    onExceedSize,
    onExceedCount,
    onExceedPixels,
    pasteEls,
    showAcceptedTypesText,
    className,
    style,
    width,
    height,
    previewClassName,
    dragActiveClassName,
    children,
    previewImgs,
    autoClear,
    previewConfig,
    placeholder = 'Drag and drop your images here, or click to select files',
    ...rest
  } = props

  const {
    dragActive,
    inputRef,
    handleDrag,
    handleDrop,
    handleChange,
    handlePaste,
  } = useGenState(props)

  useEffect(
    () => {
      pasteEls?.forEach(({ current }) => {
        // @ts-ignore
        current?.addEventListener('paste', handlePaste)
      })

      return () => {
        pasteEls?.forEach(({ current }) => {
          // @ts-ignore
          current?.removeEventListener('paste', handlePaste)
        })
      }
    },
    [pasteEls],
  )

  useImperativeHandle(ref, () => ({
    clear: () => {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    click: () => {
      inputRef.current?.click()
    },
  }))

  const renderPreview = () => {
    if (!previewImgs?.length)
      return null

    const config = {
      width: 70,
      height: 70,
      ...previewConfig,
    }

    const defaultRenderItem = ({ src, index, onRemove }: { src: string, index: number, onRemove: () => void }) => (
      <div
        key={ index }
        className={ cn(
          'group relative flex items-center justify-center',
          'border border-slate-200 rounded-md dark:border-slate-700',
        ) }
        style={ {
          height,
        } }
      >
        <LazyImg
          lazy={ false }
          src={ src }
          alt="Preview image"
          className="h-full w-full rounded-md object-cover"
          style={ {
            width: config.width,
            height: config.height,
          } }
        />

        <RmBtn onClick={ onRemove } />
      </div>
    )

    return (
      <div
        className={ cn(
          'overflow-auto flex flex-wrap gap-4 mt-3 shrink-0 w-full',
          previewClassName,
        ) }
        style={ {
          height: config.height,
        } }
      >
        { previewImgs.map((base64, index) =>
          config.renderItem
            ? config.renderItem({
                src: base64,
                index,
                onRemove: () => onRemove?.(index),
              })
            : defaultRenderItem({
                src: base64,
                index,
                onRemove: () => onRemove?.(index),
              }),
        ) }
      </div>
    )
  }

  return (
    <div
      className={ cn(
        'w-full h-full flex flex-col Uploader-container',
        className,
      ) }
      style={ {
        ...style,
        width,
        height,
      } }
    >
      <div
        className={ cn(
          'relative size-full',
          'flex justify-center items-center gap-4 cursor-pointer',
          'transition-colors duration-300 ease-in-out',
          {
            [dragActiveClassName || 'opacity-50']: dragActive,
            '!cursor-not-allowed': disabled,
          },
        ) }
        onDragEnter={ handleDrag }
        onDragLeave={ handleDrag }
        onDragOver={ handleDrag }
        onDrop={ handleDrop }
        onPaste={ handlePaste }
        role="button"
        aria-disabled={ disabled }
        onClick={ () => {
          if (disabled)
            return
          inputRef.current?.click()
        } }
      >
        <input
          type="file"
          ref={ inputRef }
          onChange={ handleChange }
          className="hidden"
          { ...rest }
        />

        { children || (
          <Border
            className="relative size-full flex flex-col cursor-pointer items-center justify-center gap-2"
            style={ {
              width,
              height,
            } }
          >
            <svg className="size-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="flex items-center justify-center px-6 text-sm text-gray-500">
              { placeholder }
            </p>
          </Border>
        ) }
      </div>

      {/* Preview section - takes remaining height and scrolls */ }
      { renderPreview() }

      {/* 文件类型提示 */ }
      { rest.accept && showAcceptedTypesText && (
        <div className="mt-2 flex-shrink-0 text-center text-sm text-gray-500">
          <p>
            Accepted types:
            { ' ' }
            { rest.accept }
          </p>
        </div>
      ) }
    </div>
  )
})

InnerUploader.displayName = 'Uploader'
export const Uploader = memo(InnerUploader) as typeof InnerUploader

export type UploaderProps = {
  disabled?: boolean
  /**
   * 单轮选择去重
   */
  distinct?: boolean
  maxCount?: number
  /**
   * 最大文件大小，单位字节
   */
  maxSize?: number
  /**
   * 最大图片像素，文件必须是图片，并且可加载
   */
  maxPixels?: {
    width: number
    height: number
  }

  width?: number
  height?: number

  onChange?: (files: FileItem[]) => void
  onRemove?: (index: number) => void
  onExceedSize?: (size: number) => void
  onExceedCount?: VoidFunction
  onExceedPixels?: (width: number, height: number) => void

  /**
   * 谁可以触发粘贴事件
   */
  pasteEls?: Refs<HTMLElement>
  previewImgs?: string[]
  placeholder?: string
  showAcceptedTypesText?: boolean

  /**
   * 预览配置
   */
  previewConfig?: PreviewConfig

  /**
   * 选择图片后自动清理，适用于单图上传
   * 不设置的话，无法上传相同图片
   * @default false
   */
  autoClear?: boolean

  /** 样式相关 */
  className?: string
  style?: CSSProperties
  previewClassName?: string
  dragActiveClassName?: string

  children?: ReactNode
}
& Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>

export interface FileItem {
  file: File
  base64: string
}

export interface UploaderRef {
  clear: () => void
  click: () => void
}

export type PreviewConfig = {
  /**
   * 预览图片宽度
   * @default 70
   */
  width?: number
  /**
   * 预览图片高度
   * @default 70
   */
  height?: number

  /**
   * 自定义预览组件
   */
  renderItem?: (props: {
    src: string
    index: number
    onRemove: () => void
  }) => ReactNode
}
