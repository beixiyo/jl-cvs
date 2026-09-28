/**
 * Popover 的策略层：在通用触发器交互之上叠加点击外部关闭、键盘关闭、
 * 打开/关闭回调、焦点恢复与命令式 open / close
 */
import { useClickOutside, useKeyboardLayer, useRestoreFocus } from '@/hooks'
import type { RefObject } from 'react'
import { useEffect, useImperativeHandle, useRef } from 'react'
import { Z } from '../../../constants/z-index'
import { useFloatingTrigger } from '../../../hooks/useFloatingTrigger'
import type { PopoverProps, PopoverRef } from '../types'

export function usePopoverInteractions(options: UsePopoverInteractionsOptions) {
  const {
    popoverRef,
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
  } = options

  const {
    isOpen,
    setOpen,
    open,
    close,
    triggerProps,
    floatingProps,
  } = useFloatingTrigger({
    trigger: trigger === 'command'
      ? 'manual'
      : trigger,
    disabled,
    showDelay,
    hideDelay: removeDelay,
  })

  const wasOpenRef = useRef(false)
  const { activeElementRef: activeElementBeforeOpenRef } = useRestoreFocus(
    isOpen && restoreFocusOnOpen,
  )

  useClickOutside(
    [triggerRef, contentRef] as RefObject<HTMLElement>[],
    close,
    {
      enabled: isOpen && (trigger === 'click' || trigger === 'command') && clickOutsideToClose,
      additionalSelectors: clickOutsideIgnoreSelector
        ? [clickOutsideIgnoreSelector]
        : [],
    },
  )

  /** 键盘优先级与内容层真实 z-index 同源；同时交给内容里的嵌套浮层做宿主基准 */
  const layerPriority = typeof contentStyle?.zIndex === 'number'
    ? contentStyle.zIndex
    : Z.popover

  useKeyboardLayer({
    active: isOpen,
    keys: closeKeys,
    priority: layerPriority,
    allowRepeat: false,
    when: (event) => {
      if (event.key === 'Escape') return true

      const target = event.target as Node | null
      return Boolean(
        target && (
          triggerRef.current?.contains(target)
          || contentRef.current?.contains(target)
        ),
      )
    },
    onKeyDown: close,
  })

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true
      onOpen?.()
    }
    else if (wasOpenRef.current) {
      wasOpenRef.current = false
      onClose?.()
    }
  }, [isOpen, onOpen, onClose])

  useImperativeHandle(popoverRef, () => ({
    open: () => {
      if (disabled || isOpen) return

      if (restoreFocusOnOpen) {
        activeElementBeforeOpenRef.current = document.activeElement as HTMLElement | null
      }
      open()
    },
    close,
  }), [
    activeElementBeforeOpenRef,
    close,
    disabled,
    isOpen,
    open,
    restoreFocusOnOpen,
  ])

  return {
    isOpen,
    setIsOpen: setOpen,
    triggerProps,
    floatingProps,
    layerPriority,
  }
}

type UsePopoverInteractionsOptions = {
  popoverRef: React.ForwardedRef<PopoverRef>
  triggerRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  trigger: NonNullable<PopoverProps['trigger']>
  disabled: PopoverProps['disabled']
  removeDelay: number
  showDelay: number
  clickOutsideToClose: boolean
  closeKeys: string[]
  clickOutsideIgnoreSelector: PopoverProps['clickOutsideIgnoreSelector']
  restoreFocusOnOpen: boolean
  contentStyle: PopoverProps['contentStyle']
  onOpen: PopoverProps['onOpen']
  onClose: PopoverProps['onClose']
}
