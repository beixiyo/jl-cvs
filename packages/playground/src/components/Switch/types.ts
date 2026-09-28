import type { VariantProps } from 'class-variance-authority'
import type React from 'react'
import type { trackVariants } from './styles'

/** Switch 组件属性 */
export interface SwitchProps
  extends
    VariantProps<typeof trackVariants>,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'disabled' | 'name' | 'onChange' | 'size'> {
  /**
   * 尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | null
  /**
   * 是否选中（受控模式）
   * @default false
   */
  checked?: boolean
  /** 状态改变时的回调函数（受控模式） */
  onChange?: (checked: boolean) => void
  /**
   * 默认是否选中（非受控模式）
   * @default false
   */
  defaultChecked?: boolean
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 自定义选中背景，支持颜色或 CSS background 表达式
   * @default 'rgb(var(--brand) / 1)'
   */
  background?: string
  /** 选中状态的图标 */
  checkedIcon?: React.ReactElement
  /** 未选中状态的图标 */
  uncheckedIcon?: React.ReactElement
  /**
   * 中心图标（无论选中与否都显示）
   * 优先级高于 checkedIcon / uncheckedIcon：传入 icon 后将忽略后两者
   */
  icon?: React.ReactElement
  /**
   * 是否使用渐变背景
   * @default false
   */
  withGradient?: boolean
  /** 表单字段名称 */
  name?: string
  /** 容器类名 */
  containerClassName?: string
  /**
   * 错误状态
   * @default false
   */
  error?: boolean
  /** 错误信息 */
  errorMessage?: string
  /** 轨道宽度，单位 px */
  trackWidth?: number
  /** 轨道高度，单位 px */
  trackHeight?: number
  /** 轨道自定义类名 */
  trackClassName?: string
  /** 滑块宽度，单位 px */
  thumbWidth?: number
  /** 滑块高度，单位 px */
  thumbHeight?: number
  /**
   * 滑块距离轨道边缘的内缩距离，单位 px
   * @default 2
   */
  thumbInset?: number
  /** 滑块自定义类名 */
  thumbClassName?: string
  /** 开关标签文本 */
  label?: string
  /** 标签类名 */
  labelClassName?: string
  /** 无障碍标签。未传时若 label 为字符串会自动用作 aria-label */
  ariaLabel?: string
}
