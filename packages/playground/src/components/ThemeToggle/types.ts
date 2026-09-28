/**
 * ThemeToggle 类型声明
 */

import type { Theme } from '@jl-org/tool'
import type * as React from 'react'

export type ThemeToggleProps = {
  /**
   * 当前的主题，用于决定显示太阳还是月亮
   */
  theme?: Theme
  /**
   * 切换器的宽度，高度会根据比例自动计算
   * @default 80
   */
  size?: number
  /**
   * 点击事件的回调，通常用于触发主题切换逻辑
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  /**
   * 自定义容器的 className
   */
  className?: string
  /**
   * 无障碍 aria-label，便于多语言 / i18n 项目本地化
   *
   * 可传字符串，或传函数根据当前是否暗色返回不同文案
   * 不传则使用内置中文默认文案（保持向后兼容）
   * @default isDark => isDark ? '切换到浅色模式' : '切换到深色模式'
   */
  ariaLabel?: string | ((isDark: boolean) => string)
  /**
   * 受控模式回调：传入后组件进入「受控」分支
   *
   * 此时点击只会播放过渡动画并回调 `onChange(next)`，由父组件自行管理主题来源，
   * 组件内部不再调用 `useTheme` 写全局主题，避免与父组件的主题来源双写冲突
   * 不传则保持原有行为：点击直接切换组件库内置的全局主题
   */
  onChange?: (next: Theme) => void
}
