import { useKeyboardLayer, useLatestCallback } from '@/hooks'
import { focusElement, getTabbableElements, shouldIgnoreParentEnter } from '@/utils/keyboard'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { DATA_ATTR } from '../../../constants/dataAttributes'

/**
 * 管理 Modal 的焦点进入、容器内 Tab 循环和关闭后焦点恢复
 *
 * Escape 使用 useKeyboardLayer 按视觉层级互斥；Tab 由弹窗自身接收，
 * 避免 Modal 打开时拦截组件外部产生的键盘事件
 *
 * 返回的 `onKeyDown` 要挂在**焦点范围**（`focusScopeRef`，即遮罩）上，挂 dialog 不够：
 * 遮罩上的 fixed 关闭按钮是 dialog 的兄弟节点也在 Tab 环里，焦点落到它身上时
 * dialog 收不到事件，下一次 Tab 就走浏览器默认导航跑出弹窗。Enter 另有
 * `container.contains(target)` 把关，不会因此扩大确认范围
 */
export function useModalFocus(
  options: UseModalFocusOptions,
) {
  const {
    open,
    containerRef,
    focusScopeRef,
    priority,
    isTop,
    onClose,
    onOk,
    escToClose,
    enterToConfirm,
    confirmDisabled,
  } = options
  const previousFocusedRef = useRef<HTMLElement | null>(null)

  const handleTab = useLatestCallback((event: KeyboardEvent) => {
    const container = containerRef.current
    if (!container) return

    const focusable = getTabbableElements(focusScopeRef.current ?? container)
    if (focusable.length === 0) {
      focusElement(container)
      return
    }

    const activeElement = document.activeElement as HTMLElement | null
    const currentIndex = activeElement
      ? focusable.indexOf(activeElement)
      : -1
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusable.length - 1
        : currentIndex - 1
      : currentIndex < 0 || currentIndex === focusable.length - 1
      ? 0
      : currentIndex + 1

    focusElement(focusable[nextIndex])
  })

  const handleContainerKeyDown = useLatestCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      handleTab(event.nativeEvent)
      return
    }

    if (
      event.key !== 'Enter'
      || !isTop
      || !shouldConfirmOnEnter(event.nativeEvent, containerRef.current, {
        enabled: enterToConfirm,
        disabled: confirmDisabled,
        hasHandler: !!onOk,
      })
    ) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onOk?.()
  })

  useKeyboardLayer({
    active: open,
    keys: ['Escape'],
    priority,
    allowRepeat: false,
    handlerEnabled: escToClose,
    onKeyDown: () => onClose?.(),
  })

  useEffect(() => {
    if (!open) return

    previousFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    const raf = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return

      /**
       * 宿主可用 `DATA_ATTR.modal.autofocus` 指定初始焦点：按 DOM 顺序取首个可 Tab 元素时，
       * 自绘头部里的关闭按钮往往排在输入框前面，焦点落在它身上再按 Enter 就把弹窗关了
       */
      const target = container.querySelector<HTMLElement>(`[${DATA_ATTR.modal.autofocus}]`)
        ?? getTabbableElements(container)[0]
        ?? container
      focusElement(target)
    })

    return () => {
      cancelAnimationFrame(raf)

      const previous = previousFocusedRef.current
      previousFocusedRef.current = null
      if (previous && document.contains(previous)) focusElement(previous)
    }
  }, [open, containerRef])

  return handleContainerKeyDown
}

function shouldConfirmOnEnter(
  event: KeyboardEvent,
  container: HTMLElement | null,
  options: EnterConfirmOptions,
) {
  if (!options.enabled || options.disabled || !options.hasHandler || !container) return false
  if (event.defaultPrevented || event.repeat || event.isComposing) return false
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return false

  const target = event.target
  if (!(target instanceof Element) || !container.contains(target)) return false

  const owningDialog = target.closest('[role="dialog"]')
  if (owningDialog !== container) return false

  return !shouldIgnoreParentEnter(target)
}

type UseModalFocusOptions = {
  open: boolean
  containerRef: RefObject<HTMLElement | null>
  focusScopeRef: RefObject<HTMLElement | null>
  priority: number
  isTop: boolean
  onClose?: () => void
  onOk?: () => void | false | Promise<void | false>
  escToClose: boolean
  enterToConfirm: boolean
  confirmDisabled: boolean
}

type EnterConfirmOptions = {
  enabled: boolean
  disabled: boolean
  hasHandler: boolean
}
