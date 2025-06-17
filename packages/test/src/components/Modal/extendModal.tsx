import type { ModalProps, ModalRef } from './types'
import { injectReactApp } from '@/utils'
import { DURATION, variantStyles } from './constants'
import { Modal } from './Modal'

export function extendModal() {
  const keys = Object.keys(variantStyles) as (keyof typeof variantStyles)[]
  keys.forEach((type) => {
    Modal[type] = (props: Partial<ModalProps>) => {
      const modalRef = createRef<ModalRef>()

      const unmount = injectReactApp(
        <Modal
          { ...props }
          isOpen
          variant={ type }
          ref={ modalRef }
          onClose={ () => {
            props?.onClose?.()
            cleanup()
          } }
          onOk={ () => {
            props?.onOk?.()
            cleanup()
          } }
        />,
        {
          inSandbox: false,
        },
      )

      function cleanup() {
        modalRef.current?.hide()

        setTimeout(() => {
          unmount()
        }, DURATION * 1000)
      }

      return cleanup
    }
  })
}
