'use client'

import { useTheme } from '@/hooks'
import { cn } from '@/utils'
import { isObj } from '@jl-org/tool'
import { forwardRef, memo, useRef } from 'react'
import { KeyboardLayerHostContext } from '../../hooks/useKeyboardLayerHost'
import { AnimateShow } from '../Animate'
import { CloseBtn } from '../CloseBtn'
import { FloatingArrow, useFloatingLayer } from '../FloatingArrow'
import { SafePortal } from '../SafePortal'
import { usePopoverInteractions } from './hooks/usePopoverInteractions'
import { useScrollPortal } from './hooks/useScrollPortal'
import { getVariantByPlacement } from './styles'
import type { PopoverCloseBtnConfig, PopoverProps, PopoverRef } from './types'

const DEFAULT_CLOSE_KEYS = ['Escape']

/**
 * Popover 组件，用于在触发器元素旁边显示浮动内容
 */
export const Popover = memo(forwardRef<PopoverRef, PopoverProps>((
  props,
  ref,
) => {
  const [theme] = useTheme()
  const {
    style,
    className,
    contentClassName,
    contentStyle,

    children,
    content,
    position = 'top',
    align = 'center',
    trigger = 'hover',
    disabled,
    removeDelay = 200,
    showDelay = 0,
    offset: offsetProp = 8,

    clickOutsideToClose = true,
    closeKeys = DEFAULT_CLOSE_KEYS,
    closeBtn = false,
    onOpen,
    onClose,

    virtualReferenceRect,
    clickOutsideIgnoreSelector,
    followScroll = false,
    restoreFocusOnOpen = false,
    exitSetMode = false,
    bordered = theme !== 'light',
    arrow = true,
  } = props
  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const {
    isOpen,
    setIsOpen,
    triggerProps,
    floatingProps,
    layerPriority,
  } = usePopoverInteractions({
    popoverRef: ref,
    triggerRef,
    contentRef,
    trigger,
    disabled,
    removeDelay,
    showDelay,
    clickOutsideToClose,
    closeKeys,
    clickOutsideIgnoreSelector,
    restoreFocusOnOpen,
    contentStyle,
    onOpen,
    onClose,
  })

  const { scrollPortalTarget, scrollContainerRef } = useScrollPortal(
    triggerRef,
    followScroll,
    isOpen,
  )

  const showCloseBtn = !!closeBtn
  const {
    className: closeBtnClassName,
    size: closeBtnSize,
    corner: closeBtnCorner = 'top-right',
    ...closeBtnProps
  } = isObj(closeBtn)
    ? closeBtn
    : {} as PopoverCloseBtnConfig

  /** 默认偏移跟随 corner，换到左上角时不会残留右侧定位 */
  const closeBtnPosClass = cn(
    closeBtnCorner.startsWith('top')
      ? 'top-3'
      : 'bottom-3',
    closeBtnCorner.endsWith('right')
      ? 'right-4'
      : 'left-4',
  )

  const {
    style: floatingStyle,
    placement: actualPosition,
    arrowProps,
  } = useFloatingLayer(triggerRef, contentRef, {
    enabled: isOpen,
    placement: align === 'center'
      ? position
      : `${position}-${align}`,
    offset: offsetProp,
    arrow,
    bordered,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
    virtualReferenceRect,
    containerRef: followScroll
      ? scrollContainerRef
      : undefined,
  })

  const variants = getVariantByPlacement(actualPosition)
  return (
    <>
      <div
        style={ style }
        ref={ triggerRef }
        className={ className }
        { ...triggerProps }
      >
        { children }
      </div>

      <SafePortal
        target={ followScroll
          ? scrollPortalTarget
          : undefined }
      >
        <AnimateShow
          show={ isOpen }
          ref={ contentRef }
          className={ cn(
            'z-popover rounded-2xl bg-background drop-shadow-card',
            bordered && 'border border-border',
            contentClassName,
            arrowProps && 'overflow-visible',
          ) }
          style={ {
            ...floatingStyle,
            ...contentStyle,
          } }
          variants={ variants }
          exitSetMode={ exitSetMode }
          { ...floatingProps }
        >
          { showCloseBtn && (
            <CloseBtn
              { ...closeBtnProps }
              onClick={ () => {
                setIsOpen(false)
              } }
              mode="absolute"
              corner={ closeBtnCorner }
              className={ cn(closeBtnPosClass, 'z-popover', closeBtnClassName) }
              size={ closeBtnSize ?? 'md' }
              aria-label={ closeBtnProps['aria-label'] ?? 'Close popover' }
            />
          ) }

          { arrowProps && <FloatingArrow { ...arrowProps } /> }

          { /* 气泡里的 Select 等嵌套浮层据此把键盘优先级抬到气泡之上，Esc 先关它们再关气泡 */ }
          <KeyboardLayerHostContext.Provider value={ layerPriority }>
            { content }
          </KeyboardLayerHostContext.Provider>
        </AnimateShow>
      </SafePortal>
    </>
  )
}))

Popover.displayName = 'Popover'
