/**
 * Tooltip 类型声明
 */

import type * as React from 'react'
import type { FloatingArrowConfig } from '../FloatingArrow'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TooltipTrigger = 'hover' | 'focus' | 'click'

export type TooltipProps = {
  /**
   * 触发元素
   */
  children: React.ReactNode
  /**
   * Tooltip 内容
   */
  content?: React.ReactNode
  /**
   * 显示位置
   * @default 'top'
   */
  placement?: TooltipPlacement
  /**
   * 是否显示（受控模式）
   */
  visible?: boolean
  /**
   * 触发方式
   * @default 'hover'
   */
  trigger?: TooltipTrigger
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 目标元素到浮层可见边缘的间距，单位 px
   *
   * 开启箭头时以箭头尖端为准，关闭箭头时以面板边缘为准，两种状态视觉间距一致
   * @default 8
   */
  offset?: number
  /**
   * 容器类名
   */
  className?: string
  /**
   * 内容区域类名
   */
  contentClassName?: string
  /**
   * 是否显示类似对话框的尖尖角（箭头）
   * @default true
   */
  arrow?: FloatingArrowConfig
  /**
   * 内容格式化函数
   */
  formatter?: (value: number) => React.ReactNode
  /**
   * 显示延迟（毫秒）
   * @default 0
   */
  delay?: number
  /**
   * 当触发元素发生尺寸或位置变化时自动隐藏 Tooltip
   * @default false
   */
  autoHideOnResize?: boolean
  /**
   * 是否允许在浮层内部交互（去掉 pointer-events-none）
   * 配合 trigger='click' 在浮层中放可点击内容（链接/按钮）时开启
   * @default false
   */
  interactive?: boolean
  /**
   * 按 Esc 是否关掉浮层
   *
   * 进的是与 Modal / Popover 同一个键盘层栈，优先级取 `z-tooltip`：Tooltip 在视觉上压过一切，
   * 开着时第一下 Esc 只关它，第二下才轮到底下的弹窗。只对非受控生效：`visible` 受控时
   * 可见性归调用方，组件没有回传口，占着栈顶只会把底下的 Esc 永远吃掉
   * @default true
   */
  escToClose?: boolean
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>
