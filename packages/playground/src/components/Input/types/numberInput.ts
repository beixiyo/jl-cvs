import type * as React from 'react'
import type { ChangeEvent } from 'react'
import type { Rounded, Size } from '../../../types'

export type NumberInputProps =
  & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size' | 'prefix' | 'type'>
  & {
    /**
     * 容器类名（作用于输入框边框容器）
     */
    containerClassName?: string
    /**
     * 标签类名
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
     * 后缀内容
     */
    suffix?: React.ReactNode
    /**
     * 圆角大小
     * @default 'md'
     */
    rounded?: Rounded | number
    /**
     * 输入值（受控模式）
     */
    value?: string | number
    /**
     * 最小值
     */
    min?: number | string
    /**
     * 最大值
     */
    max?: number | string
    /**
     * 步进值
     * @default 1
     */
    step?: number
    /**
     * 精度（小数位数）
     * @default 0
     */
    precision?: number
    /**
     * 是否允许空值。为 true 时清空输入框会保留空状态而非归零，
     * 用于表达「未填写」语义；为 false 时保持原有清空即归零行为
     * @default false
     */
    allowEmpty?: boolean
    /**
     * 输入内容变化时的回调
     */
    onChange?: (value: number, e: ChangeEvent<HTMLInputElement>) => void
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
    /**
     * 步进按钮点击时的回调，可用于阻止事件传播
     */
    onStepperClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  }
