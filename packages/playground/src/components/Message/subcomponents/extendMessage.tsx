import { injectReactApp } from '@/utils'
import { isObj } from '@jl-org/tool'
import type { ReactNode } from 'react'
import { DURATION, variantStyles } from '../constants'
import { Message } from '../Message'
import type { MessageProps, MessageVariant } from '../types'
import { MessageContainer } from './MessageContainer'
import { messageStore } from './messageStore'

let mounted = false

/** 懒挂载全局唯一的堆叠容器（仅首次命令式调用时执行一次） */
function ensureContainer() {
  if (mounted || typeof document === 'undefined') {
    return
  }
  mounted = true
  injectReactApp(<MessageContainer />, { inSandbox: false })
}

export function extendMessage() {
  const keys = Object.keys(variantStyles) as MessageVariant[]

  keys.forEach((type) => {
    Message[type] = (contentOrProps: ReactNode | Partial<MessageProps>, duration?: number) => {
      ensureContainer()

      const hasContent = isObj(contentOrProps) && 'content' in contentOrProps
      const userProps = hasContent
        ? contentOrProps as Partial<MessageProps>
        : { content: contentOrProps as ReactNode }
      const finalDuration = duration ?? userProps.duration ?? (type === 'loading'
        ? 0
        : DURATION)

      const id = messageStore.add({
        variant: type,
        content: userProps.content!,
        icon: userProps.icon,
        showClose: userProps.showClose,
        showIcon: userProps.showIcon,
        duration: finalDuration,
        className: userProps.className,
        style: userProps.style,
        zIndex: userProps.zIndex,
        onShow: userProps.onShow,
        onClose: userProps.onClose,
      })

      return {
        close: () => messageStore.remove(id),
      }
    }
  })
}
