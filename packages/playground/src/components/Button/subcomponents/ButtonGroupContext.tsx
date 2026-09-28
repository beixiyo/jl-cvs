import { createContext, use } from 'react'

/**
 * ButtonGroup Context 类型
 */
export interface ButtonGroupContextValue {
  /**
   * 当前选中的值
   */
  active?: string

  /**
   * 值变化时的回调
   */
  onChange?: (value: string) => void
  /**
   * 按钮注册函数，组件挂载时调用以向父组件注册自身 DOM 节点
   */
  register?: (name: string, el: HTMLElement | null) => void
  /**
   * 注销函数，组件卸载时调用
   */
  unregister?: (name: string) => void
}

/**
 * ButtonGroup Context
 */
export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null)

/**
 * 使用 ButtonGroup Context 的 Hook
 */
export function useButtonGroup() {
  return use(ButtonGroupContext)
}
