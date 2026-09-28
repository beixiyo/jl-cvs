import type { HTMLMotionProps } from 'motion/react'
import type * as React from 'react'
import type { ChangeEvent } from 'react'
import type { Rounded, Size } from '../../../types'

export type InputProps =
  & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size' | 'prefix'>
  & {
    /**
     * 容器类名
     */
    containerClassName?: string
    /**
     * 最外层容器类名
     */
    wrapperClassName?: string
    /**
     * label 类名（用于自定义 label 样式）
     */
    labelClassName?: string
    /**
     * 禁用时的类名
     */
    disabledClass?: string
    /**
     * 禁用时的容器类名
     */
    disabledContainerClass?: string
    /**
     * 聚焦时的类名
     */
    focusClass?: string
    /**
     * 聚焦时的容器类名
     */
    focusContainerClass?: string
    /**
     * 错误时的类名
     */
    errorClass?: string
    /**
     * 错误时的容器类名
     */
    errorContainerClass?: string
    /**
     * 尺寸
     * @default 'md'
     */
    size?: Size
    /**
     * 标签文本
     */
    label?: string
    /**
     * 标签位置
     * @default 'top'
     */
    labelPosition?: 'top' | 'left'
    /**
     * 输入框视觉样式
     * @default 'default'
     */
    variant?: 'default' | 'underlined'
    /**
     * 下划线变体的聚焦动画配置，仅在 variant 为 underlined 时生效
     */
    underlineTransition?: HTMLMotionProps<'div'>['transition']
    /**
     * 是否显示方框边框；下划线变体始终保留底线
     * @default true
     */
    bordered?: boolean
    /**
     * 是否显示阴影
     * @default false
     */
    shadowed?: boolean
    /**
     * 是否禁用
     * @default false
     */
    disabled?: boolean
    /**
     * 是否为只读
     * @default false
     */
    readOnly?: boolean
    /**
     * 错误状态
     * @default false
     */
    error?: boolean
    /**
     * 错误信息
     */
    errorMessage?: string
    /**
     * 是否必填
     * @default false
     */
    required?: boolean
    /**
     * 前缀内容
     */
    prefix?: React.ReactNode
    /**
     * 前缀容器类名
     */
    prefixClassName?: string
    /**
     * 后缀内容
     */
    suffix?: React.ReactNode
    /**
     * 后缀容器类名
     */
    suffixClassName?: string
    /**
     * 圆角大小
     * @default 'md'
     */
    rounded?: Rounded | number
    /**
     * 输入值（受控模式）
     */
    value?: string
    /**
     * 输入内容变化时的回调
     */
    onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void
    /**
     * 聚焦时的回调
     */
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
    /**
     * 失焦时的回调
     */
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    /**
     * 按下键盘时的回调
     */
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    /**
     * 按下回车键时的回调
     */
    onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  }
