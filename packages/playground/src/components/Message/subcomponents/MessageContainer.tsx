'use client'

import { useLatestCallback } from '@/hooks'
import { AnimatePresence } from 'motion/react'
import { memo, useRef, useSyncExternalStore } from 'react'
import { Z } from '../../../constants/z-index'
import { useStackOverflow } from '../hooks/useStackOverflow'
import { MessageItem } from './MessageItem'
import { messageStore } from './messageStore'

/**
 * 全局唯一的 Message 堆叠容器（首次命令式调用时挂载一次）
 *
 * 自顶向下排列，新消息追加在底部；超出窗口高度时由 useStackOverflow 关闭最顶部一条
 * 容器本身不拦截鼠标事件，仅每条消息可交互
 */
export const MessageContainer = memo(() => {
  const items = useSyncExternalStore(
    messageStore.subscribe,
    messageStore.getSnapshot,
    messageStore.getSnapshot,
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClose = useLatestCallback((id: number) => {
    messageStore.remove(id)
  })

  useStackOverflow(containerRef, items)

  return (
    <div
      ref={ containerRef }
      style={ { zIndex: Z.toast } }
      className="pointer-events-none fixed left-1/2 top-16 flex -translate-x-1/2 flex-col items-center gap-3"
    >
      <AnimatePresence mode="popLayout">
        { items.map((item) => (
          <MessageItem
            key={ item.id }
            item={ item }
            onClose={ handleClose }
          />
        )) }
      </AnimatePresence>
    </div>
  )
})

MessageContainer.displayName = 'MessageContainer'
