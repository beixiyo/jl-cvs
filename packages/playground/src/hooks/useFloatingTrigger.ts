/**
 * 浮层触发器交互机制：管理开关状态、显示/隐藏延迟，
 * 并产出触发器与浮层自身的事件处理器
 *
 * 只负责「何时打开、何时关闭」这一层机制；点击外部关闭、键盘关闭、
 * 焦点恢复等策略由 Tooltip / Popover 等调用方自行叠加
 *
 * 属于组件库内部约定，不导出到公共入口
 */
import { useLatestCallback } from '@/hooks'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

export function useFloatingTrigger(
  options: UseFloatingTriggerOptions = {},
): UseFloatingTriggerReturn {
  const {
    trigger = 'hover',
    disabled = false,
    open: controlledOpen,
    showDelay = 0,
    hideDelay = 0,
    onOpenChange,
  } = options

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled
    ? controlledOpen
    : uncontrolledOpen

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    clearTimer(showTimerRef)
    clearTimer(hideTimerRef)
  }

  /** 立即写入开关状态，并取消所有未触发的延迟任务 */
  const setOpen = useLatestCallback((next: boolean) => {
    clearTimers()
    if (!isControlled) setUncontrolledOpen(next)
    if (next !== isOpen) onOpenChange?.(next)
  })

  const open = useLatestCallback(() => {
    if (disabled) return
    setOpen(true)
  })

  const close = useLatestCallback(() => {
    setOpen(false)
  })

  const toggle = useLatestCallback(() => {
    if (disabled) return
    setOpen(!isOpen)
  })

  const scheduleOpen = () => {
    clearTimers()
    if (showDelay <= 0) {
      setOpen(true)
      return
    }

    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null
      setOpen(true)
    }, showDelay)
  }

  const scheduleClose = () => {
    clearTimers()
    if (hideDelay <= 0) {
      setOpen(false)
      return
    }

    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null
      setOpen(false)
    }, hideDelay)
  }

  const handleTriggerMouseEnter = useLatestCallback(() => {
    if (disabled || trigger !== 'hover') return
    scheduleOpen()
  })

  /** 关闭路径不看 disabled：打开后才被禁用的浮层也要能随移出 / 失焦收走 */
  const handleTriggerMouseLeave = useLatestCallback(() => {
    if (trigger !== 'hover') return
    scheduleClose()
  })

  const handleTriggerFocus = useLatestCallback(() => {
    if (disabled || trigger !== 'focus') return
    scheduleOpen()
  })

  const handleTriggerBlur = useLatestCallback(() => {
    if (trigger !== 'focus') return
    scheduleClose()
  })

  const handleTriggerClick = useLatestCallback(() => {
    if (disabled || trigger !== 'click') return
    toggle()
  })

  /** hover 模式下鼠标移入浮层取消关闭，允许在浮层内操作 */
  const handleFloatingMouseEnter = useLatestCallback(() => {
    if (disabled || trigger !== 'hover') return
    clearTimer(hideTimerRef)
  })

  const handleFloatingMouseLeave = useLatestCallback(() => {
    if (trigger !== 'hover') return
    scheduleClose()
  })

  /**
   * 打开期间被禁用要立即关闭
   *
   * 典型场景：悬停出 Tooltip 后点击触发器让内容展开、同时把 Tooltip 设为 disabled，
   * 若只拦截打开，已经出现的浮层会一直困在屏幕上
   */
  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  useEffect(() => clearTimers, [])

  const triggerProps = useMemo<FloatingTriggerHandlers>(() => ({
    onMouseEnter: handleTriggerMouseEnter,
    onMouseLeave: handleTriggerMouseLeave,
    onFocus: handleTriggerFocus,
    onBlur: handleTriggerBlur,
    onClick: handleTriggerClick,
  }), [
    handleTriggerBlur,
    handleTriggerClick,
    handleTriggerFocus,
    handleTriggerMouseEnter,
    handleTriggerMouseLeave,
  ])

  const floatingProps = useMemo<FloatingLayerHandlers>(() => ({
    onMouseEnter: handleFloatingMouseEnter,
    onMouseLeave: handleFloatingMouseLeave,
  }), [handleFloatingMouseEnter, handleFloatingMouseLeave])

  return {
    isOpen,
    setOpen,
    open,
    close,
    toggle,
    triggerProps,
    floatingProps,
  }
}

function clearTimer(timerRef: RefObject<ReturnType<typeof setTimeout> | null>) {
  if (!timerRef.current) return

  clearTimeout(timerRef.current)
  timerRef.current = null
}

/**
 * 触发方式
 * - `hover`：移入打开、移出关闭，移入浮层可取消关闭
 * - `click`：点击切换
 * - `focus`：聚焦打开、失焦关闭
 * - `manual`：不绑定任何触发事件，只通过返回的 open / close / setOpen 控制
 */
export type FloatingTriggerMode = 'hover' | 'click' | 'focus' | 'manual'

export interface UseFloatingTriggerOptions {
  /**
   * 触发方式
   * @default 'hover'
   */
  trigger?: FloatingTriggerMode
  /**
   * 禁用只拦打开：触发事件与 open / toggle 不再生效；移出 / 失焦仍会关闭，
   * 且禁用瞬间已打开的浮层会立即关闭，close 始终可用
   * @default false
   */
  disabled?: boolean
  /** 受控的打开状态；传入后内部不再维护状态，仅通过 onOpenChange 通知 */
  open?: boolean
  /**
   * 触发打开到真正打开的延迟，单位 ms
   * @default 0
   */
  showDelay?: number
  /**
   * 触发关闭到真正关闭的延迟，单位 ms；hover 模式下用于给鼠标移入浮层留出时间
   * @default 0
   */
  hideDelay?: number
  /** 打开状态变化时的回调，受控与非受控模式都会触发 */
  onOpenChange?: (open: boolean) => void
}

/** 绑定到触发器元素上的事件处理器 */
export interface FloatingTriggerHandlers {
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocus: () => void
  onBlur: () => void
  onClick: () => void
}

/** 绑定到浮层元素上的事件处理器 */
export interface FloatingLayerHandlers {
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export interface UseFloatingTriggerReturn {
  /** 当前是否打开（受控模式下即为传入的 open） */
  isOpen: boolean
  /** 立即设置打开状态，并取消未触发的延迟任务 */
  setOpen: (open: boolean) => void
  /** 立即打开，禁用时忽略 */
  open: () => void
  /** 立即关闭 */
  close: () => void
  /** 切换打开状态，禁用时忽略 */
  toggle: () => void
  /** 触发器元素的事件处理器 */
  triggerProps: FloatingTriggerHandlers
  /** 浮层元素的事件处理器 */
  floatingProps: FloatingLayerHandlers
}
