import { injectReactApp } from '@/utils'
import { createRef } from 'react'
import { DURATION, variantStyles } from '../constants'
import { Modal } from '../Modal'
import type { ModalProps, ModalRef } from '../types'

/**
 * 命令式入口只负责挂载与卸载
 *
 * `onOk` 的 loading、自动关闭与「返回 false 保持打开」都在 `Modal` 本体里，
 * 声明式与命令式同一套语义；这里只把「关闭」接到卸载上
 */
export function extendModal() {
  const keys = Object.keys(variantStyles) as (keyof typeof variantStyles)[]
  keys.forEach((type) => {
    Modal[type] = (props: Partial<ModalProps>) => mount({ ...props, variant: type })
  })

  /**
   * 强化命令式调用：支持 Modal.show(Component, props)
   */
  Modal.show = (Component: any, props: Partial<ModalProps> = {}) => mount(props, <Component />)
}

function mount(props: Partial<ModalProps>, children?: React.ReactNode) {
  const modalRef = createRef<ModalRef>()

  const unmount = injectReactApp(
    <Modal
      { ...props }
      ref={ modalRef }
      isOpen
      onClose={ () => {
        props.onClose?.()
        cleanup()
      } }
    >
      { children ?? props.children }
    </Modal>,
    { inSandbox: false },
  )

  let isCleaned = false
  function cleanup() {
    if (isCleaned) return
    isCleaned = true
    modalRef.current?.hide()

    /** 等退出动画播完再卸载；`DURATION` 是 motion 的秒，这里要毫秒 */
    setTimeout(() => {
      unmount()
    }, DURATION * 1000)
  }

  return {
    close: cleanup,
  }
}
