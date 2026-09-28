import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { modalStore } from '../subcomponents/modalStore'

/**
 * 让单个 Modal 实例接入全局栈管理
 *
 * - 打开时入栈并领取递增 z-index，关闭/卸载时出栈
 * - 返回 `isTop` 标记是否为最上层（用于遮罩去重）
 *
 * @returns `zIndex` 自动分配的层级（未打开时为 undefined）；`isTop` 是否栈顶
 */
export function useModalStack(params: UseModalStackParams) {
  const { open, zIndex: explicitZIndex, requestClose } = params

  const idRef = useRef(0)
  if (idRef.current === 0) {
    idRef.current = modalStore.nextId()
  }
  const id = idRef.current

  const [zIndex, setZIndex] = useState<number>()

  /**
   * 关闭回调经 ref 转一手：宿主每次渲染都可能换一个新函数，直接放进 effect 依赖
   * 会让弹窗每渲染一次就出栈再入栈，栈顶顺序与 z-index 跟着抖
   *
   * 「这一层可不可关」同样只在调用时现查，不作为注册条件：`escToClose` 中途变化
   * 若导致重新入栈，弹窗会领到一个更高的 z-index，反而盖住已经开在它上面的子弹窗
   */
  const requestCloseRef = useRef(requestClose)
  requestCloseRef.current = requestClose

  useEffect(() => {
    if (!open) {
      return
    }
    setZIndex(modalStore.open(id, explicitZIndex, () => {
      const request = requestCloseRef.current
      if (!request) return false

      request()
      return true
    }))
    return () => modalStore.close(id)
  }, [open, id, explicitZIndex])

  const stack = useSyncExternalStore(
    modalStore.subscribe,
    modalStore.getSnapshot,
    modalStore.getSnapshot,
  )
  const isTop = stack.length > 0 && stack[stack.length - 1] === id

  return { zIndex, isTop }
}

interface UseModalStackParams {
  /** 当前是否打开 */
  open: boolean
  /** 显式视觉层级；同时作为键盘层级和 Modal 栈排序依据 */
  zIndex?: number
  /**
   * 代替用户请求关闭本弹窗（语义等同按一次 Esc），供 `closeAllModals` 调用
   *
   * 不可关的弹窗不传：没给 `onClose`，或 `escToClose` 已禁
   */
  requestClose?: () => void
}
