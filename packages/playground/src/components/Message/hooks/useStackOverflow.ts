import { useResizeObserver } from '@/hooks'
import type { RefObject } from 'react'
import { useLayoutEffect } from 'react'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { STACK_BOTTOM_MARGIN, STACK_GAP, STACK_TOP_OFFSET } from '../constants'
import { messageStore } from '../subcomponents/messageStore'
import type { MessageItemData } from '../types'

/**
 * 监听堆叠高度，超出窗口可视高度时自动关闭最顶部（最早）的一条消息
 *
 * 触发时机：
 * 1. 列表增删（useLayoutEffect）—— 新消息弹出后立即判断
 * 2. 容器尺寸变化（useResizeObserver）—— 内容动态变更（如 loading 文案）时判断
 *
 * 仅按当前存活的 id 测量，退出动画中的「残影」不计入，避免误删
 *
 * @param containerRef 堆叠容器元素
 * @param items 当前存活的消息列表，用作 effect 依赖
 */
export function useStackOverflow(
  containerRef: RefObject<HTMLDivElement | null>,
  items: MessageItemData[],
) {
  const check = () => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined') {
      return
    }

    const live = messageStore.getSnapshot()
    /** 只剩一条时不再关闭，否则会出现「弹出即消失」 */
    if (live.length <= 1) {
      return
    }

    let total = STACK_TOP_OFFSET + STACK_BOTTOM_MARGIN
    live.forEach((item, index) => {
      const node = el.querySelector(`[${DATA_ATTR.message.id}="${item.id}"]`) as HTMLElement | null
      total += node?.offsetHeight ?? 0
      if (index > 0) {
        total += STACK_GAP
      }
    })

    if (total > window.innerHeight) {
      messageStore.remove(live[0].id)
    }
  }

  useLayoutEffect(check, [items])
  useResizeObserver([containerRef], check)
}
