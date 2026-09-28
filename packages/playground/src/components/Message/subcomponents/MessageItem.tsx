import { motion } from 'motion/react'
import { memo } from 'react'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { useMessageTimer } from '../hooks/useMessageTimer'
import type { MessageItemData } from '../types'
import { MessageView } from './MessageView'

/**
 * 堆叠容器中的单条消息
 * 负责进入 / 退出动画与 layout 位移（其它消息关闭时平滑上移），
 * 视觉渲染委托给 MessageView，定时关闭委托给 useMessageTimer
 */
export const MessageItem = memo<MessageItemProps>((props) => {
  const { item, onClose } = props

  useMessageTimer(item, onClose)

  return (
    <motion.div
      layout
      initial={ { opacity: 0, y: -16, scale: 0.96 } }
      animate={ { opacity: 1, y: 0, scale: 1 } }
      exit={ { opacity: 0, y: -12, scale: 0.96 } }
      transition={ { duration: 0.3, ease: 'easeOut' } }
      style={ { zIndex: item.zIndex, ...item.style } }
      { ...{ [DATA_ATTR.message.id]: item.id } }
      className="pointer-events-auto"
    >
      <MessageView
        variant={ item.variant }
        content={ item.content }
        icon={ item.icon }
        showClose={ item.showClose }
        showIcon={ item.showIcon }
        onClose={ () => onClose(item.id) }
        className={ item.className }
      />
    </motion.div>
  )
})

MessageItem.displayName = 'MessageItem'

export interface MessageItemProps {
  item: MessageItemData
  /** 请求关闭某条消息（按 id） */
  onClose: (id: number) => void
}
