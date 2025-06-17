import type { CSSProperties, ReactNode } from 'react'

export interface MessageRef {
  hide: () => void
}

export type MessageVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'loading'

export interface MessageProps {
  className?: string
  style?: CSSProperties
  variant?: MessageVariant

  /** 消息内容 */
  content: ReactNode
  icon?: (props: any) => ReactNode
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 自动关闭的延时，单位毫秒，设为 0 则不自动关闭 */
  duration?: number
  /** 是否显示加载动画 */
  loading?: boolean
  /** 消息关闭时的回调 */
  onClose?: () => void
  /** 消息显示时的回调 */
  onShow?: () => void
  /** 消息的 z-index */
  zIndex?: number
}

export type MessageType<MessageInstanceType> = MessageInstanceType & {
  [key in MessageVariant]: (content: ReactNode, duration?: number) => () => void
}
