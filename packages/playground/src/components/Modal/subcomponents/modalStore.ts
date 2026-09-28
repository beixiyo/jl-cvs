import { Z } from '../../../constants/z-index'

/**
 * 全局 Modal 栈管理
 *
 * 解决多层 Modal 叠加的三个问题：
 * 1. z-index 自增 —— 每次打开分配一个递增层级（基于项目的 createZIndexStore），后开的一定在上层
 * 2. 栈顶感知 —— 仅栈顶 Modal 响应 ESC、显示遮罩，避免「一次 ESC 全关」与「遮罩越叠越黑」
 *
 * 组件库不依赖 signal，这里用最小化的发布订阅 + useSyncExternalStore 对接
 */

let stack: ModalEntry[] = []
let snapshot: number[] = []
let seed = 0
let activationOrder = 0
let autoZIndex = Z.modal
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export const modalStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /** 返回稳定引用，仅在栈变化时生成新数组 */
  getSnapshot(): number[] {
    return snapshot
  },

  /** 为一个 Modal 实例申请唯一 id（组件挂载期间固定不变） */
  nextId() {
    return ++seed
  },

  /**
   * 打开：入栈并分配一个递增的 z-index（已在栈中则仅刷新层级到最高）
   *
   * @param requestClose 代替用户请求关闭这一层的回调（语义等同按一次 Esc），
   * 给 {@link closeAllModals} 用。返回是否真的发出了关闭请求：不可关的弹窗
   * （无 `onClose` 或禁了 Esc）返回 `false`。可关性由回调自己每次现查，
   * 不体现在是否注册上——否则中途改 `escToClose` 会让弹窗重新入栈领新层级
   */
  open(id: number, explicitZIndex?: number, requestClose?: () => boolean) {
    stack = stack.filter((item) => item.id !== id)
    const zIndex = explicitZIndex ?? Math.min(++autoZIndex, Z.popover - 1)
    stack = [
      ...stack,
      { id, zIndex, order: ++activationOrder, requestClose },
    ].sort((a, b) => a.zIndex - b.zIndex || a.order - b.order)
    snapshot = stack.map((item) => item.id)
    emit()
    return zIndex
  },

  /** 关闭：出栈 */
  close(id: number) {
    if (!stack.some((item) => item.id === id)) {
      return
    }
    stack = stack.filter((item) => item.id !== id)
    snapshot = stack.map((item) => item.id)
    if (stack.length === 0) autoZIndex = Z.modal
    emit()
  },

  /** 是否为当前栈顶（最上层）Modal */
  isTop(id: number) {
    return snapshot.length > 0 && snapshot[snapshot.length - 1] === id
  },
}

/**
 * 只读订阅当前是否有任意 Modal 处于打开状态
 *
 * 给 Modal 之外的模块用（如宿主应用判断「有弹窗时不要往被盖住的界面注入内容」），
 * 暴露的只有「有没有」，不暴露栈内容与开关方法。栈按 `open` 状态记账：关闭动画
 * 期间节点仍在 DOM 里，但这里已经视为无弹窗
 *
 * @returns 取消订阅函数
 */
export function subscribeModalPresence(listener: (hasOpenModal: boolean) => void): () => void {
  let last = hasOpenModal()
  return modalStore.subscribe(() => {
    const next = hasOpenModal()
    if (next === last) return

    last = next
    listener(next)
  })
}

/** 当前是否有任意 Modal 打开 */
export function hasOpenModal(): boolean {
  return snapshot.length > 0
}

/**
 * 替用户把当前所有打开的 Modal 逐层关掉
 *
 * 给「要把内容注入到被弹窗盖住的界面」这类流程用（如宿主要在被弹窗盖住的界面里
 * 展开侧栏）：不关的话侧栏在弹窗背后展开，用户看到的是「点了没反应」
 *
 * 语义等同从栈顶到栈底对每一层按一次 Esc，所以走的是各弹窗自己的 `onClose`：
 * 宿主定的规则原样保留（有草稿的会先弹二次确认，禁了 Esc 或没给 `onClose` 的原地不动）
 * 这里不直接改栈：Modal 是受控组件，出栈由宿主翻 `isOpen` 后自然发生
 *
 * 逐层同步调用，不等宿主状态落地：`onClose` 只是请求，本函数返回时弹窗可能仍在
 *
 * @returns `closed` 收到关闭请求的层数，`blocked` 不可关而留下的层数
 */
export function closeAllModals(): { closed: number; blocked: number } {
  let closed = 0
  let blocked = 0

  /** 先拷贝再遍历：`onClose` 同步 setState 时栈可能立刻变化 */
  for (const entry of [...stack].reverse()) {
    if (entry.requestClose?.()) closed += 1
    else blocked += 1
  }

  return { closed, blocked }
}

type Listener = () => void

interface ModalEntry {
  id: number
  zIndex: number
  order: number
  /** 代替用户请求关闭这一层；返回是否真的发出了请求，不可关时返回 false */
  requestClose?: () => boolean
}
