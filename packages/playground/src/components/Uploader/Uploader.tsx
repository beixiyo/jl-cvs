'use client'

import { useLatestCallback } from '@/hooks'
import { cn } from '@/utils'
import { motion } from 'motion/react'
import { forwardRef, memo, useEffect, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { useT } from '../../i18n'
import { Border } from '../Border'
import { DragIndicator } from './subcomponents/DragIndicator'
import { PreviewList } from './subcomponents/PreviewList'
import { useGenState } from './subcomponents/state'
import type { RenderPreviewListOptions, UploadAreaRenderContext, UploaderProps, UploaderRef } from './types'
import { getStrokeColor } from './utils'

const InnerUploader = forwardRef<UploaderRef, UploaderProps>((props, ref) => {
  const {
    disabled,
    distinct,
    maxCount,
    maxSize,
    maxPixels,

    mode = 'default',
    onChange,
    onRemove,
    onExceedSize,
    onExceedCount,
    onExceedPixels,
    shouldFilterOut,
    onFiltered,

    pasteEls,
    dragAreaEl,
    dragAreaClickTrigger = false,
    renderChildrenWithDragArea = false,

    showAcceptedTypesText,
    className,
    style,
    previewClassName,
    dragActiveClassName,
    renderUploadArea,
    children,
    previewImgs,
    autoClear,
    previewConfig,
    placeholder,
    ...rest
  } = props

  const t = useT()

  const {
    dragActive,
    dragInvalid,
    inputRef,
    handleDrag,
    handleDrop,
    handleChange,
    handlePaste,
  } = useGenState(props)

  /** 监听自定义粘贴区域 */
  useEffect(
    () => {
      pasteEls?.forEach(({ current }) => {
        current?.addEventListener('paste', handlePaste as any)
      })

      return () => {
        pasteEls?.forEach(({ current }) => {
          current?.removeEventListener('paste', handlePaste as any)
        })
      }
    },
    [pasteEls, handlePaste],
  )

  /** 为外部拖拽区域添加事件监听 */
  useEffect(() => {
    if (!dragAreaEl?.current || disabled) return

    const el = dragAreaEl.current

    el.addEventListener('dragenter', handleDrag as any)
    el.addEventListener('dragleave', handleDrag as any)
    el.addEventListener('dragover', handleDrag as any)
    el.addEventListener('drop', handleDrop as any)

    /** 确保不会触发两次 */
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
  }, [disabled, dragAreaClickTrigger, dragAreaEl, handleDrag, handleDrop, handlePaste, inputRef, pasteEls])

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

  /** 渲染拖拽状态覆盖层 (Portal) */
  const renderDragOverlay = () => {
    if (!dragAreaEl?.current || !dragActive) return null

    return createPortal(
      <div
        className={ cn(
          'absolute inset-0 z-overlay flex items-center justify-center',
          'bg-background/80 backdrop-blur-xs',
          'rounded-lg pointer-events-none',
          'transition-all duration-300',
        ) }
      >
        <DragIndicator
          dragActive={ dragActive }
          dragInvalid={ dragInvalid }
          disabled={ disabled }
          placeholder={ placeholder }
        />
      </div>,
      dragAreaEl.current,
    )
  }

  const isCardMode = mode === 'card'

  const handleTriggerKeyDown = useLatestCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return

    event.preventDefault()
    inputRef.current?.click()
  })

  /** 拖拽/粘贴事件，disabled 时不绑定 */
  const dragHandlers = disabled
    ? {}
    : {
      onDragEnter: handleDrag,
      onDragLeave: handleDrag,
      onDragOver: handleDrag,
      onDrop: handleDrop,
      onPaste: handlePaste,
    }

  const uploadAreaContext: UploadAreaRenderContext = {
    dragActive,
    dragInvalid,
    disabled: disabled ?? false,
    triggerClick: () => inputRef.current?.click(),
    getRootProps: () => ({
      ...dragHandlers as any,
      onClick: () => !disabled && inputRef.current?.click(),
      onKeyDown: handleTriggerKeyDown,
      role: 'button',
      'aria-label': rest['aria-label'] ?? placeholder ?? 'Upload files',
      'aria-disabled': disabled ?? false,
      [DATA_ATTR.dragging]: dragActive,
      [DATA_ATTR.invalid]: dragInvalid,
      tabIndex: disabled
        ? -1
        : 0,
      className: cn(
        'relative flex justify-center items-center gap-4 group transition-all duration-300 ease-in-out',
        !disabled
          ? 'cursor-pointer'
          : 'cursor-not-allowed',
        dragActive && dragActiveClassName,
      ),
    }),
    renderPreviewList: (options?: RenderPreviewListOptions) => (
      <PreviewList
        previewImgs={ previewImgs }
        mode={ mode }
        disabled={ disabled }
        maxCount={ maxCount }
        previewConfig={ options?.previewConfig
          ? { ...previewConfig, ...options.previewConfig }
          : previewConfig }
        onRemove={ onRemove }
        onTriggerClick={ () => inputRef.current?.click() }
        dragActive={ dragActive }
        dragInvalid={ dragInvalid }
        className={ cn(previewClassName, options?.className) }
      />
    ),
  }

  return (
    <div
      className={ cn(
        'w-full flex flex-col Uploader-container',
        !isCardMode && 'h-full',
        'transition-all duration-300',
        { 'opacity-50': disabled && !isCardMode },
        className,
      ) }
      style={ style }
    >
      <input
        type="file"
        ref={ inputRef }
        onChange={ handleChange }
        disabled={ disabled }
        className="hidden"
        { ...rest }
      />

      { renderUploadArea
        ? (
          <>
            { renderUploadArea(uploadAreaContext) }
            { renderDragOverlay() }
            { !isCardMode && (
              <PreviewList
                previewImgs={ previewImgs }
                mode={ mode }
                disabled={ disabled }
                maxCount={ maxCount }
                previewConfig={ previewConfig }
                onRemove={ onRemove }
                className={ previewClassName }
              />
            ) }
          </>
        )
        : isCardMode
        ? (
          <div
            className={ cn('relative w-full', {
              'cursor-pointer': !disabled,
              'cursor-not-allowed': disabled,
            }, dragActive && dragActiveClassName) }
            { ...{
              [DATA_ATTR.dragging]: dragActive,
              [DATA_ATTR.invalid]: dragInvalid,
            } }
            { ...dragHandlers }
          >
            <PreviewList
              previewImgs={ previewImgs }
              mode={ mode }
              disabled={ disabled }
              maxCount={ maxCount }
              previewConfig={ previewConfig }
              onRemove={ onRemove }
              onTriggerClick={ () => inputRef.current?.click() }
              dragActive={ dragActive }
              dragInvalid={ dragInvalid }
              className={ previewClassName }
            />
            { renderDragOverlay() }
          </div>
        )
        : (
          <>
            { (!dragAreaEl || renderChildrenWithDragArea) && (
              <div
                className={ cn(
                  'relative size-full flex justify-center items-center gap-4 group',
                  'transition-all duration-300 ease-in-out',
                  {
                    'cursor-pointer': !disabled,
                    'cursor-not-allowed': disabled,
                  },
                  dragActive && dragActiveClassName,
                ) }
                { ...{
                  [DATA_ATTR.dragging]: dragActive,
                  [DATA_ATTR.invalid]: dragInvalid,
                } }
                { ...dragHandlers }
                role="button"
                aria-disabled={ disabled }
                aria-label={ rest['aria-label'] ?? placeholder ?? 'Upload files' }
                tabIndex={ disabled
                  ? -1
                  : 0 }
                onClick={ () => !disabled && inputRef.current?.click() }
                onKeyDown={ handleTriggerKeyDown }
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
                    strokeColor={ getStrokeColor({ disabled, dragActive, dragInvalid }) }
                    hoverStrokeColor={ getStrokeColor({ disabled, dragActive, dragInvalid, isHover: true }) }
                    animated={ !disabled }
                  >
                    <DragIndicator
                      dragActive={ dragActive }
                      dragInvalid={ dragInvalid }
                      disabled={ disabled }
                      placeholder={ placeholder }
                    />
                  </Border>
                ) }
              </div>
            ) }

            { renderDragOverlay() }

            <PreviewList
              previewImgs={ previewImgs }
              mode={ mode }
              disabled={ disabled }
              maxCount={ maxCount }
              previewConfig={ previewConfig }
              onRemove={ onRemove }
              className={ previewClassName }
            />
          </>
        ) }

      { rest.accept && showAcceptedTypesText && (
        <motion.div
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          transition={ { duration: 0.3, delay: 0.1 } }
          className={ cn(
            'mt-3 shrink-0 text-center px-3 py-2 rounded-md',
            'bg-background2/50',
            'border border-border',
          ) }
        >
          <p className="text-xs text-text2 sm:text-sm">
            <span className="font-medium">{ t('uploader.supportedFileTypes') }</span>
            <span className="ml-1 text-text3 font-mono">
              { rest.accept }
            </span>
          </p>
        </motion.div>
      ) }
    </div>
  )
})

InnerUploader.displayName = 'Uploader'

export const Uploader = memo(InnerUploader) as typeof InnerUploader
