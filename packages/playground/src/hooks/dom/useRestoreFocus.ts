import { focusElement } from '@/utils/keyboard'
import { useEffect, useRef } from 'react'

/**
 * Portal 打开后恢复焦点到打开前的元素，避免 createPortal 挂载到 body 时抢焦点
 * （如选中文本工具栏导致编辑器 Ctrl+B 等快捷键失效）
 * 调用方在打开前将当时的 document.activeElement 写入 activeElementRef，本 hook 在打开后下一帧对其执行 focus()
 *
 * @param enabled - 是否启用恢复焦点（如 Popover 的 restoreFocusOnOpen）
 */
export function useRestoreFocus(
  enabled: boolean,
) {
  const activeElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const prev = activeElementRef.current
    activeElementRef.current = null
    if (!prev || typeof prev.focus !== 'function' || !document.contains(prev)) return

    const raf = requestAnimationFrame(() => {
      focusElement(prev)
    })
    return () => cancelAnimationFrame(raf)
  }, [enabled, activeElementRef])

  return {
    activeElementRef,
  }
}
