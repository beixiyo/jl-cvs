'use client'

import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

import type { Refs } from '@/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { FolderOpen, Upload } from 'lucide-react'
import { forwardRef, memo, useEffect, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
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
    dragAreaEl,
    dragAreaClickTrigger = false,
    renderChildrenWithDragArea = false,

    showAcceptedTypesText,
    className,
    style,
    previewClassName,
    dragActiveClassName,
    children,
    previewImgs,
    autoClear,
    previewConfig,
    placeholder = 'Drag or click to upload',
    ...rest
  } = props

  const {
    dragActive,
    dragInvalid,
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
    [pasteEls, handlePaste],
  )

  /** 为外部拖拽区域添加事件监听 */
  useEffect(() => {
    if (!dragAreaEl?.current || disabled)
      return

    const el = dragAreaEl.current

    el.addEventListener('dragenter', handleDrag as any)
    el.addEventListener('dragleave', handleDrag as any)
    el.addEventListener('dragover', handleDrag as any)
    el.addEventListener('drop', handleDrop as any)

    /**
     * 确保不会触发两次
     */
    !pasteEls?.length && el.addEventListener('paste', handlePaste as any)

    /** 添加点击事件，点击外部区域时触发文件选择 */
    const handleClick = () => {
      if (disabled || !dragAreaClickTrigger) {
        return
      }

      inputRef.current?.click()
    }

    el.addEventListener('click', handleClick)

    return () => {
      el.removeEventListener('dragenter', handleDrag as any)
      el.removeEventListener('dragleave', handleDrag as any)
      el.removeEventListener('dragover', handleDrag as any)
      el.removeEventListener('drop', handleDrop as any)

      !pasteEls?.length && el.removeEventListener('paste', handlePaste as any)
      el.removeEventListener('click', handleClick)
    }
  }, [disabled, dragAreaClickTrigger, dragAreaEl, handleDrag, handleDrop, handlePaste, inputRef])

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
      <motion.div
        key={ index }
        initial={ { scale: 0.8, opacity: 0 } }
        animate={ { scale: 1, opacity: 1 } }
        exit={ { scale: 0.8, opacity: 0 } }
        transition={ { duration: 0.2, delay: index * 0.05 } }
        className={ cn(
          'group relative flex items-center justify-center',
          'border border-slate-200 dark:border-slate-600 rounded-lg',
          'bg-white dark:bg-slate-800 shadow-sm',
          'transition-all duration-200',
          {
            'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500': !disabled,
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
          className="h-full w-full rounded-lg object-cover"
        />

        { !disabled && <RmBtn onClick={ onRemove } /> }
      </motion.div>
    )

    return (
      <motion.div
        initial={ { opacity: 0, y: 10 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.3 } }
        className={ cn(
          'overflow-auto flex flex-wrap gap-3 sm:gap-4 mt-4 shrink-0 w-full',
          'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
          'scrollbar-track-transparent',
          previewClassName,
        ) }
        style={ {
          maxHeight: config.height * 2, // 允许显示两行预览
        } }
      >
        <AnimatePresence>
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
        </AnimatePresence>
      </motion.div>
    )
  }

  /** 渲染拖拽状态指示器 */
  const renderDragIndicator = () => (
    <AnimatePresence mode="wait">
      { dragActive
        ? (
            <motion.div
              key={ dragInvalid
                ? 'drag-invalid'
                : 'drag-active' }
              initial={ { scale: 0.8, opacity: 0 } }
              animate={ { scale: 1, opacity: 1 } }
              exit={ { scale: 0.8, opacity: 0 } }
              transition={ { duration: 0.2 } }
              className="flex flex-col items-center gap-2"
            >
              { dragInvalid
                ? (
                    <>
                      <FolderOpen className="size-12 text-red-500 sm:size-16 dark:text-red-400" />
                      <div className="text-center">
                        <p className="text-sm text-red-600 font-medium sm:text-base dark:text-red-400">
                          Unsupported file type
                        </p>
                        <p className="mt-1 text-xs text-red-500 sm:text-sm dark:text-red-500">
                          Please select a supported file format
                        </p>
                      </div>
                    </>
                  )
                : (
                    <>
                      <FolderOpen className="size-12 text-emerald-500 sm:size-16 dark:text-emerald-400" />
                      <p className="text-sm text-emerald-600 font-medium sm:text-base dark:text-emerald-400">
                        Release to upload
                      </p>
                    </>
                  ) }
            </motion.div>
          )
        : (
            <motion.div
              key="normal"
              initial={ { scale: 0.8, opacity: 0 } }
              animate={ { scale: 1, opacity: 1 } }
              exit={ { scale: 0.8, opacity: 0 } }
              transition={ { duration: 0.2 } }
              className="flex flex-col items-center gap-2 sm:gap-3"
            >
              <div className="relative">
                <Upload className={ cn(
                  'size-8',
                  disabled
                    ? 'text-gray-300 dark:text-gray-600'
                    : 'text-gray-400 dark:text-gray-500',
                ) } />
              </div>
              <div className="px-4 text-center sm:px-6">
                <p className={ cn(
                  'text-sm font-medium sm:text-base',
                  disabled
                    ? 'text-gray-400 dark:text-gray-600'
                    : 'text-gray-600 dark:text-gray-300',
                ) }>
                  { placeholder }
                </p>
              </div>
            </motion.div>
          ) }
    </AnimatePresence>
  )

  /** 当有外部拖拽区域时，为其创建拖拽状态指示器 */
  const renderDragOverlay = () => {
    if (!dragAreaEl?.current || !dragActive)
      return null

    return createPortal(
      <div
        className={ cn(
          'absolute inset-0 z-50 flex items-center justify-center',
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
          'rounded-lg pointer-events-none',
          'transition-all duration-300',
        ) }
      >
        { renderDragIndicator() }
      </div>,
      dragAreaEl.current,
    )
  }

  return (
    <div
      className={ cn(
        'w-full h-full flex flex-col Uploader-container',
        'transition-all duration-300',
        {
          'opacity-50': disabled,
        },
        className,
      ) }
      style={ {
        ...style,
      } }
    >
      {/* 隐藏的文件输入框 */ }
      <input
        type="file"
        ref={ inputRef }
        onChange={ handleChange }
        className="hidden"
        { ...rest }
      />

      {/* 如果没有外部拖拽区域，或者设置了同时渲染children，则渲染默认UI */ }
      { (!dragAreaEl || renderChildrenWithDragArea) && (
        <div
          className={ cn(
            'relative size-full',
            'flex justify-center items-center gap-4',
            'transition-all duration-300 ease-in-out',
            {
              'cursor-pointer': !disabled,
              'cursor-not-allowed': disabled,
            },
          ) }
          onDragEnter={ disabled
            ? undefined
            : handleDrag }
          onDragLeave={ disabled
            ? undefined
            : handleDrag }
          onDragOver={ disabled
            ? undefined
            : handleDrag }
          onDrop={ disabled
            ? undefined
            : handleDrop }
          onPaste={ disabled
            ? undefined
            : handlePaste }
          role="button"
          aria-disabled={ disabled }
          onClick={ () => {
            if (disabled)
              return
            inputRef.current?.click()
          } }
        >
          { children || (
            <Border
              className={ cn(
                'relative size-full flex flex-col items-center justify-center gap-2',
                {
                  'cursor-pointer': !disabled,
                  'cursor-not-allowed': disabled,
                },
              ) }
              strokeColor={
                disabled
                  ? '#9ca3af'
                  : dragActive
                    ? (dragInvalid
                        ? '#ef4444'
                        : '#10b981')
                    : '#d1d5db'
              }
              hoverStrokeColor={
                disabled
                  ? '#9ca3af'
                  : dragActive
                    ? (dragInvalid
                        ? '#dc2626'
                        : '#059669')
                    : '#10b981'
              }
              animated={ !disabled }
            >
              {/* 拖拽状态指示器 */ }
              { renderDragIndicator() }
            </Border>
          ) }
        </div>
      ) }

      {/* 为外部拖拽区域创建的覆盖层 */ }
      { renderDragOverlay() }

      {/* Preview section - takes remaining height and scrolls */ }
      { renderPreview() }

      {/* 文件类型提示 */ }
      { rest.accept && showAcceptedTypesText && (
        <motion.div
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          transition={ { duration: 0.3, delay: 0.1 } }
          className={ cn(
            'mt-3 flex-shrink-0 text-center',
            'px-3 py-2 rounded-md',
            'bg-gray-50 dark:bg-gray-800/50',
            'border border-gray-200 dark:border-gray-700',
          ) }
        >
          <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
            <span className="font-medium">支持的文件类型：</span>
            <span className="ml-1 text-gray-500 font-mono dark:text-gray-500">
              { rest.accept }
            </span>
          </p>
        </motion.div>
      ) }
    </div>
  )
})

InnerUploader.displayName = 'Uploader'

/**
 * 文件上传组件
 *
 * 支持拖拽上传、点击上传、粘贴上传
 *
 * 特性：
 * 1. 支持通过dragAreaEl将拖拽功能附加到外部元素
 * 2. 支持通过pasteEls自定义粘贴区域
 *
 * 示例：
 * ```tsx
 * // 基本使用
 * <Uploader onChange={files => console.log(files)} />
 *
 * // 将拖拽功能附加到外部元素
 * const containerRef = useRef<HTMLDivElement>(null)
 * <div ref={containerRef}>
 *   <Uploader
 *     pasteEls={ [textareaRef] }
 *     dragAreaEl={containerRef}
 *     onChange={files => console.log(files)}
 *   />
 * </div>
 * ```
 */
export const Uploader = memo(InnerUploader) as typeof InnerUploader

export type UploaderProps = {
  /**
   * 是否禁用上传功能
   * @default false
   */
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

  /**
   * 外部拖拽区域的ref
   * 如果提供，将在该元素上添加拖拽事件监听
   */
  dragAreaEl?: React.RefObject<HTMLElement>

  /**
   * 是否在使用外部拖拽区域的同时渲染children
   * @default false
   */
  renderChildrenWithDragArea?: boolean
  /**
   * 是否使用点击外部拖拽区域触发文件选择
   * @default false
   */
  dragAreaClickTrigger?: boolean

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
