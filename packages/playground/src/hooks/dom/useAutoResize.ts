import type { RefObject } from 'react'
import { useLayoutEffect, useRef } from 'react'
import { useLatestCallback } from '../memo'

/**
 * 元素自动高度逻辑（适用于 textarea 等可按内容增高的元素）
 *
 * - 根据内容换行自动变高（`autoResize` 为 true 时生效）
 * - 高度封顶在 `maxRows` 行，超出后切换为内部滚动
 * - 受控值外部变化（模板插入、清空、语音转写等）或挂载时自动同步高度
 * - 容器「宽度」变化（如面板折叠后再展开）时自动重算高度
 *
 * 返回的 `adjustHeight` 引用稳定，可在输入事件中直接调用
 */
export function useAutoResize<T extends HTMLElement = HTMLTextAreaElement>(
  {
    inputRef,
    autoResize = false,
    minRows = 1,
    maxRows,
    value,
  }: UseAutoResizeOptions<T>,
) {
  const adjustHeight = useLatestCallback(() => {
    const el = inputRef.current
    if (!el || !autoResize) return

    const cs = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(cs.lineHeight) || Number.parseFloat(cs.fontSize) * 1.5
    const paddingY = Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom)
    const borderY = Number.parseFloat(cs.borderTopWidth) + Number.parseFloat(cs.borderBottomWidth)

    /** 先重置高度，确保 scrollHeight 反映真实内容高度 */
    el.style.height = 'auto'

    /** border-box 下 scrollHeight 不含 border，需补回 */
    const contentHeight = el.scrollHeight + borderY
    const minHeight = minRows * lineHeight + paddingY + borderY

    let target = Math.max(contentHeight, minHeight)
    let overflow = false

    if (maxRows != null) {
      const maxHeight = maxRows * lineHeight + paddingY + borderY
      if (target > maxHeight) {
        target = maxHeight
        overflow = true
      }
    }

    el.style.height = `${target}px`
    el.style.overflowY = overflow
      ? 'auto'
      : 'hidden'
  })

  /** 同步外部值变化与挂载初始高度（useLayoutEffect 在绘制前执行，避免高度跳动） */
  useLayoutEffect(() => {
    if (autoResize) adjustHeight()
  }, [value, autoResize, minRows, maxRows])

  /**
   * 监听元素「宽度」变化后重算高度
   *
   * 面板折叠（宽度变窄/隐藏）期间若按窄宽算过高度，文本会换行成多行、算出过高的高度；
   * 再展开恢复正常宽度时，原有逻辑只在 value 变化才重算，导致高度停留在被撑大的值
   * 这里只在「宽度」真正变化时重算 —— 高度本身的变化（adjustHeight 所致）不触发，避免反馈循环
   */
  const lastWidthRef = useRef(0)
  useLayoutEffect(() => {
    const el = inputRef.current
    if (!el || !autoResize || typeof ResizeObserver === 'undefined') return

    lastWidthRef.current = el.clientWidth

    const ro = new ResizeObserver(() => {
      const width = el.clientWidth
      if (width !== 0 && width !== lastWidthRef.current) {
        lastWidthRef.current = width
        adjustHeight()
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [autoResize])

  return adjustHeight
}

export type UseAutoResizeOptions<T extends HTMLElement = HTMLTextAreaElement> = {
  /** 目标元素 ref（textarea 等可按内容增高的元素） */
  inputRef: RefObject<T | null>
  /**
   * 是否启用自动高度
   * @default false
   */
  autoResize?: boolean
  /**
   * 最小行数
   * @default 1
   */
  minRows?: number
  /** 最大行数，超出后内部滚动 */
  maxRows?: number
  /** 当前文本值，用于在受控更新时重新计算高度 */
  value?: string
}
