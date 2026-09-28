import type { RefObject } from 'react'
import { useEffect } from 'react'
import { useLatestRef } from '../ref'
import type { ClickOutsideOpts } from './types'

/**
 * 检测当前点击区域，是否在元素外部
 * @param refs 需要监听点击的元素
 * @param handler 事件处理函数
 * @param options 配置选项
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: () => void,
  options: ClickOutsideOpts = {},
) {
  const {
    enabled = true,
    trigger = 'mousedown',
    additionalSelectors = [],
  } = options

  const stableHandler = useLatestRef(handler)

  useEffect(() => {
    if (!enabled) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      /** 检查是否点击在指定的 refs 内部 */
      const clickedInRefs = refs.some((ref) => ref.current?.contains(target))
      if (clickedInRefs) return

      /** 检查是否点击在额外的选择器元素内部 */
      if (additionalSelectors.length > 0) {
        const additionalElements = document.querySelectorAll(additionalSelectors.join(', '))
        const clickedInAdditional = Array.from(additionalElements).some((element) => element.contains(target))
        if (clickedInAdditional) return
      }

      /** 如果都不在内部，则触发处理函数 */
      stableHandler.current?.()
    }

    document.addEventListener(trigger, handleClickOutside)
    return () => {
      document.removeEventListener(trigger, handleClickOutside)
    }
  }, [refs, enabled, trigger, additionalSelectors, stableHandler])
}
