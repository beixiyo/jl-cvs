import React, { forwardRef, memo, useCallback, useId } from 'react'
import { cn } from '@/utils'

export const Radio = memo<RadioProps>(forwardRef<HTMLInputElement, RadioProps>((
  {
    style,
    className,
    containerClassName,
    size = 'md',
    label,
    labelPosition = 'right',
    disabled = false,
    checked = false,
    error = false,
    errorMessage,
    required = false,
    name,
    value,
    onChange,
    ...rest
  },
  ref,
) => {
  const id = useId()
  const errorId = useId()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked, e)
  }, [onChange])

  const sizeClasses = {
    sm: {
      container: 'h-4 w-4',
      label: 'text-sm',
      gap: 'gap-x-2',
    },
    md: {
      container: 'h-5 w-5',
      label: 'text-base',
      gap: 'gap-x-2',
    },
    lg: {
      container: 'h-6 w-6',
      label: 'text-lg',
      gap: 'gap-x-2',
    },
  }

  const radioElement = (
    <div className="relative flex items-center justify-center">
      <input
        id={ id }
        ref={ ref }
        type="radio"
        disabled={ disabled }
        checked={ checked }
        name={ name }
        value={ value }
        required={ required }
        onChange={ handleChange }
        className="peer sr-only"
        aria-invalid={ error }
        aria-describedby={ error
          ? errorId
          : undefined }
        { ...rest }
      />
      <span
        aria-hidden="true"
        className={ cn(
          'box-border flex shrink-0 items-center justify-center rounded-full border-2 p-0.5 transition-colors',
          sizeClasses[size].container,
          // Peer states
          'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:dark:ring-offset-gray-900',
          // Disabled state
          'peer-disabled:cursor-not-allowed peer-disabled:border-gray-200 peer-disabled:bg-gray-100 peer-disabled:dark:border-gray-700 peer-disabled:dark:bg-gray-800',
          // Unchecked state
          {
            'border-gray-400 group-hover:border-blue-500 dark:border-gray-500 dark:group-hover:border-blue-400': !checked && !disabled && !error,
          },
          // Checked state
          {
            'border-blue-500 dark:border-blue-400': checked && !error,
          },
          // Error state
          {
            'border-red-500': error,
          },
        ) }
      >
        <span
          className={ cn(
            'h-3/5 w-3/5 scale-0 rounded-full bg-blue-500 transition-transform dark:bg-blue-400',
            { 'scale-100': checked },
            { 'bg-red-500 dark:bg-red-400': error },
          ) }
        />
      </span>
    </div>
  )

  const labelElement = label
    ? (
        <span
          className={ cn(
            'select-none',
            sizeClasses[size].label,
            disabled
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-800 dark:text-gray-200',
            { 'text-red-500 dark:text-red-400': error },
          ) }
        >
          { label }
          { required && <span className="ml-1 text-red-500 dark:text-red-400">*</span> }
        </span>
      )
    : null

  return (
    <div className={ cn('inline-flex flex-col', containerClassName) }>
      <label
        htmlFor={ id }
        style={ style }
        className={ cn(
          'group inline-flex items-center',
          sizeClasses[size].gap,
          disabled
            ? 'cursor-not-allowed'
            : 'cursor-pointer',
          className,
        ) }
      >
        { labelPosition === 'left' && labelElement }
        { radioElement }
        { labelPosition === 'right' && labelElement }
      </label>
      { error && errorMessage && (
        <p id={ errorId } className="mt-1.5 text-sm text-red-500 dark:text-red-400">
          { errorMessage }
        </p>
      ) }
    </div>
  )
}))

Radio.displayName = 'Radio'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /**
   * 容器类名
   */
  containerClassName?: string
  /**
   * 尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 标签文本
   */
  label?: string
  /**
   * 标签位置
   * @default 'right'
   */
  labelPosition?: 'left' | 'right'
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 是否选中
   * @default false
   */
  checked?: boolean
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
   * 值变化时的回调
   */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void
}
