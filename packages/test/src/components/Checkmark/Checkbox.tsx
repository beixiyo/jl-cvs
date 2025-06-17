import type { CheckmarkProps } from './Checkmark'
import { primaryColor } from '@/styles/variable'
import { cn } from '@/utils'
import { memo } from 'react'
import { Checkmark } from './Checkmark'

/**
 * 交互式复选框组件，基于 Checkmark 组件构建
 * @example
 * <Checkbox
 *   checked={isChecked}
 *   onChange={setIsChecked}
 *   label="同意条款"
 * />
 */
export const Checkbox = memo<CheckboxProps>(({
  checked = false,
  onChange,
  disabled = false,
  className,
  size = 24,
  strokeWidth = 6,
  color = primaryColor,
  fill,
  label,
  labelPosition = 'right',
  labelClassName,
  indeterminate = false,
  hoverEffect = true,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (!disabled && onChange) {
      onChange(!checked, e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onChange(!checked, e as unknown as React.MouseEvent)
    }
  }

  const checkboxElement = (
    <Checkmark
      size={ size }
      strokeWidth={ strokeWidth }
      color={ color }
      fill={ fill }
      show={ checked || indeterminate }
      showCircle={ false }
      animationDuration={ 0.6 }
      className={ cn(
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : '',
        className,
      ) }
      role="checkbox"
      aria-checked={ indeterminate
        ? 'mixed'
        : checked }
      aria-disabled={ disabled }
      tabIndex={ disabled
        ? -1
        : 0 }
      hoverEffect={ hoverEffect && !disabled }
      { ...rest }
      onClick={ handleClick }
      onKeyDown={ handleKeyDown }
    />
  )

  /** 如果有标签，则渲染带标签的组件 */
  if (label) {
    return (
      <label
        className={ cn(
          'flex items-center gap-2',
          labelPosition === 'left'
            ? 'flex-row-reverse'
            : '',
          'cursor-pointer',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : '',
          labelClassName,
        ) }
        onClick={ e => !disabled && onChange && onChange(!checked, e) }
      >
        { checkboxElement }
        { label }
      </label>
    )
  }

  return checkboxElement
})

Checkbox.displayName = 'Checkbox'

export type CheckboxProps = {
  /**
   * 复选框是否被选中
   * @default false
   */
  checked?: boolean
  /**
   * 复选框状态改变时的回调函数
   */
  onChange?: (checked: boolean, e: React.MouseEvent | React.KeyboardEvent) => void
  /**
   * 是否禁用复选框
   * @default false
   */
  disabled?: boolean
  /**
   * 复选框标签文本
   */
  label?: React.ReactNode
  /**
   * 标签位置
   * @default 'right'
   */
  labelPosition?: 'left' | 'right'
  /**
   * 标签自定义类名
   */
  labelClassName?: string
  /**
   * 是否为不确定状态（半选）
   * @default false
   */
  indeterminate?: boolean
  /**
   * 是否启用悬停效果
   * @default true
   */
  hoverEffect?: boolean
}
& Omit<CheckmarkProps, 'show' | 'onChange' | 'disabled' | 'showCircle'>
