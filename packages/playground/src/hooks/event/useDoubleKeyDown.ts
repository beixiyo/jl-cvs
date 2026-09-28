import { doubleKeyDown } from '@jl-org/tool'
import { useEffect } from 'react'
import { useLatestRef } from '../ref'
import type { KeyEnum, ShortCutTarget } from './useShortCutKey'

/**
 * 双击键盘快捷键钩子，在指定间隔内连按同一键触发回调
 * @example
 * ```tsx
 * useDoubleKeyDown({ key: 'f', onDoubleKeyDown: () => console.log('double f') })
 * useDoubleKeyDown({ key: 'Escape', onDoubleKeyDown: onClose, gap: 200 })
 * useDoubleKeyDown({ key: 'd', onDoubleKeyDown: onDelete, enabled: isEditing })
 * ```
 */
export function useDoubleKeyDown(opts: UseDoubleKeyDownOpts) {
  const {
    key,
    onDoubleKeyDown,
    gap = 150,
    el = typeof window !== 'undefined'
      ? window
      : undefined as unknown as ShortCutTarget,
    capture = false,
    enabled = true,
  } = opts

  const handlerRef = useLatestRef(onDoubleKeyDown)

  useEffect(() => {
    if (!enabled || !el) return

    const handler = doubleKeyDown(key, (e: KeyboardEvent) => {
      handlerRef.current(e)
    }, gap)

    el.addEventListener('keydown', handler as EventListener, capture)

    return () => {
      el.removeEventListener('keydown', handler as EventListener, capture)
    }
  }, [key, gap, el, capture, enabled])
}

export type UseDoubleKeyDownOpts = {
  /**
   * 键名（KeyboardEvent.key）
   */
  key: KeyEnum
  /**
   * 双击触发时的回调
   */
  onDoubleKeyDown: (e: KeyboardEvent) => void
  /**
   * 两次按键的最大间隔（ms）
   * @default 150
   */
  gap?: number
  /**
   * 监听目标，默认 window
   */
  el?: ShortCutTarget | null
  /**
   * 是否在捕获阶段监听
   * @default false
   */
  capture?: boolean
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
}
