import type { CSSProperties, ReactNode } from 'react'
import type { ComponentController, SemanticVariant } from '../../types'

export interface MessageRef {
  hide: () => void
}

export type MessageVariant = SemanticVariant | 'error' | 'loading' | 'neutral'

export interface MessageProps {
  className?: string
  style?: CSSProperties
  variant?: MessageVariant

  /** 消息内容 */
  content: ReactNode
  icon?: (props: any) => ReactNode
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean
  /**
   * 是否显示图标；不传时按 variant 自动判定（neutral 无图标，其余按语义带图标）
   */
  showIcon?: boolean
  /** 自动关闭的延时，单位毫秒，设为 0 则不自动关闭 */
  duration?: number
  /** 消息关闭时的回调 */
  onClose?: () => void
  /** 消息显示时的回调 */
  onShow?: () => void
  /** 消息的 z-index */
  zIndex?: number
}

/**
 * 堆叠仓库中单条消息的数据
 * 由命令式调用（Message.success 等）生成，供 MessageContainer 渲染
 */
export interface MessageItemData {
  /** 仓库自增的唯一标识 */
  id: number
  variant: MessageVariant
  content: ReactNode
  icon?: (props: any) => ReactNode
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean
  /** 是否显示图标；不传时按 variant 自动判定 */
  showIcon?: boolean
  /** 自动关闭的延时，单位毫秒，设为 0 则不自动关闭 */
  duration: number
  className?: string
  style?: CSSProperties
  /** 消息的 z-index */
  zIndex?: number
  /** 消息显示时的回调 */
  onShow?: () => void
  /** 消息关闭时的回调 */
  onClose?: () => void
}

export type MessageType<MessageInstanceType> =
  & MessageInstanceType
  & {
    [key in MessageVariant]: (
      contentOrProps: ReactNode | Partial<MessageProps>,
      duration?: number,
    ) => ComponentController
  }
