/**
 * Tooltip 的策略层：组合触发器交互与浮层定位，并叠加「触发器尺寸变化时自动隐藏」
 */
import { useKeyboardLayer, useResizeObserver } from '@/hooks'
import { useRef } from 'react'
import { Z } from '../../../constants/z-index'
import { useFloatingTrigger } from '../../../hooks/useFloatingTrigger'
import type { FloatingArrowConfig } from '../../FloatingArrow'
import { useFloatingLayer } from '../../FloatingArrow'
import type { TooltipPlacement, TooltipTrigger } from '../types'

export function useTooltip(options: UseTooltipOptions) {
  const {
    placement = 'top',
    visible,
    trigger = 'hover',
    disabled = false,
    offset = 8,
    arrow,
    delay = 0,
    autoHideOnResize = false,
    escToClose = true,
  } = options

  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const resizeInitializedRef = useRef(false)

  const {
    isOpen,
    close,
    triggerProps,
  } = useFloatingTrigger({
    trigger,
    disabled,
    open: visible,
    showDelay: delay,
  })

  const {
    style,
    arrowProps,
  } = useFloatingLayer(triggerRef, tooltipRef, {
    enabled: isOpen,
    placement,
    offset,
    arrow,
    boundaryPadding: 8,
    /** 启用智能翻面：当首选位置（如 top）空间不足时，自动使用相反方向（如 bottom），反之亦然 */
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  /**
   * Esc 关掉浮层：与 Modal / Popover 共用键盘层栈，优先级取浮层真实的 `z-tooltip`
   *
   * 只在非受控时注册：受控可见性由调用方持有，这里 `close()` 关不掉它，
   * 一个常显的受控 Tooltip 若占着栈顶，底下弹窗的 Esc 会被永远吃掉
   */
  useKeyboardLayer({
    active: isOpen && escToClose && visible === undefined,
    keys: ['Escape'],
    priority: Z.tooltip,
    allowRepeat: false,
    onKeyDown: close,
  })

  /** 使用 ResizeObserver 监听触发元素的变化，自动隐藏 Tooltip */
  useResizeObserver(
    [triggerRef],
    () => {
      /** 跳过初始化时的触发，避免首次显示时立即隐藏 */
      if (!resizeInitializedRef.current) {
        resizeInitializedRef.current = true
        return
      }

      if (autoHideOnResize && isOpen) close()
    },
  )

  return {
    shouldShow: isOpen,
    style,
    arrowProps,
    triggerRef,
    tooltipRef,
    triggerProps,
  }
}

export type UseTooltipOptions = {
  placement?: TooltipPlacement
  visible?: boolean
  trigger?: TooltipTrigger
  disabled?: boolean
  offset?: number
  arrow?: FloatingArrowConfig
  delay?: number
  autoHideOnResize?: boolean
  escToClose?: boolean
}
