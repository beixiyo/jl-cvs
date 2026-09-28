import { useLatestCallback } from '@/hooks'
import { useEffect } from 'react'
import type { MessageItemData } from '../types'

/**
 * 单条堆叠消息的生命周期副作用：
 * 挂载时触发 onShow，并在 duration > 0 时启动自动关闭定时器
 *
 * @param item 当前消息数据（引用稳定，仅在该条消息存活期间不变）
 * @param onClose 请求关闭的回调，接收消息 id
 */
export function useMessageTimer(
  item: MessageItemData,
  onClose: (id: number) => void,
) {
  const close = useLatestCallback(() => onClose(item.id))
  const onShow = useLatestCallback(() => item.onShow?.())

  useEffect(() => {
    onShow()

    if (item.duration > 0) {
      const timer = setTimeout(close, item.duration)
      return () => clearTimeout(timer)
    }
  }, [item.duration])
}
