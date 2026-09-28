/** 键盘层宿主上下文：让嵌在弹窗 / 抽屉 / 气泡里的浮层拿到「压过宿主」的键盘优先级 */

import { createContext, useContext } from 'react'

/**
 * 宿主（Modal / Drawer / Popover）把自己的键盘层优先级放进来，嵌套浮层据此抬高自己
 *
 * `useKeyboardLayer` 的契约是 priority 与视觉 z-index 一致，但 Select 下拉、ChatInput 面板、
 * ContextMenu 这类浮层不走 Portal，它们的 `z-dropdown`（1000）只在宿主的层叠上下文里有意义，
 * 拿到全局栈里就比 Modal（1400 起）低。表现是：弹窗里的下拉开着按 Esc，关掉的是整个弹窗
 *
 * 视觉上它们就在宿主之上、任何后开的宿主之下，优先级也该落在这个区间，见 {@link useNestedLayerPriority}
 */
export const KeyboardLayerHostContext = createContext<number | null>(null)

/**
 * 嵌套浮层相对宿主抬高的步进
 *
 * 宿主之间的最小间隔是 1（Modal 栈的 z-index 自增），取一半保证落在「本宿主之上、下一个宿主之下」：
 * 弹窗 A 里的下拉不会压过后开的弹窗 B
 */
export const NESTED_LAYER_STEP = 0.5

/**
 * 计算嵌套浮层的键盘层优先级
 *
 * 没有宿主时原样返回 `base`；有宿主时至少抬到宿主之上。`base` 更高（调用方显式给了更大的 z-index）
 * 则尊重调用方，它对自己的层级更有发言权
 */
export function useNestedLayerPriority(base: number): number {
  const host = useContext(KeyboardLayerHostContext)

  return host === null
    ? base
    : Math.max(base, host + NESTED_LAYER_STEP)
}
