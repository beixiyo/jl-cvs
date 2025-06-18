import type { ReactNode } from 'react'
import type { MessageRef, MessageVariant } from './types'
import { createRef } from 'react'
import { injectReactApp } from '@/utils'
import { Message } from './'
import { DURATION, variantStyles } from './constants'

export function extendMessage() {
  const keys = Object.keys(variantStyles) as MessageVariant[]

  keys.forEach((type) => {
    Message[type] = (content: ReactNode, duration = DURATION) => {
      const messageRef = createRef<MessageRef>()

      const unmount = injectReactApp(
        <Message
          content={ content }
          variant={ type }
          duration={ duration }
          ref={ messageRef }
          onClose={ () => {
            cleanup()
          } }
        />,
        {
          inSandbox: false,
        },
      )

      function cleanup() {
        messageRef.current?.hide()

        setTimeout(() => {
          unmount()
        }, DURATION)
      }

      return cleanup
    }
  })
}
