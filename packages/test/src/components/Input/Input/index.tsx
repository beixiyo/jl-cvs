import { forwardRef, memo, useCallback, useState } from 'react'
import { cn } from '@/utils'

export const Input = memo<InputProps>(forwardRef<HTMLInputElement, InputProps>((
  props,
  ref,
) => {
  const {
    style,
    className,
    containerClassName,
    size = 'md' as Size,
    label,
    labelPosition = 'top',
    disabled = false,
    readOnly = false,
    error = false,
    errorMessage,
    required = false,
    prefix,
    suffix,
    onFocus,
    onBlur,
    onPressEnter,
    onKeyDown,
    onChange,
    ...rest
  } = props
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }, [onFocus])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }, [onBlur])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.key === 'Enter' && onPressEnter) {
      onPressEnter(e)
    }
  }, [onKeyDown, onPressEnter])

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  }

  const inputClasses = cn(
    'w-full outline-none bg-transparent text-slate-800 dark:text-slate-300',
    'transition-all duration-200 ease-in-out',
    disabled && 'cursor-not-allowed text-slate-400 dark:text-slate-500',
    readOnly && 'cursor-default',
  )

  const containerClasses = cn(
    'relative w-full flex items-center rounded-xl border',
    sizeClasses[size],
    {
      'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900': !error && !disabled,
      'border-rose-500 hover:border-rose-600 focus-within:border-rose-500': error && !disabled,
      'border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed': disabled,
      '': isFocused && !error && !disabled,
      'hover:border-slate-400 dark:hover:border-slate-600': !isFocused && !error && !disabled,
    },
  )

  const renderInput = () => (
    <div className={ containerClasses }>
      { prefix && (
        <div className="flex items-center justify-center pl-3 text-slate-400">
          { prefix }
        </div>
      ) }
      <input
        ref={ ref }
        className={ cn(
          inputClasses,
          prefix
            ? 'pl-2'
            : 'pl-3',
          suffix
            ? 'pr-2'
            : 'pr-3',
        ) }
        disabled={ disabled }
        readOnly={ readOnly }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        onKeyDown={ handleKeyDown }
        onChange={ onChange }
        { ...rest }
      />
      { suffix && (
        <div className="flex items-center justify-center pr-3 text-slate-400">
          { suffix }
        </div>
      ) }
    </div>
  )

  return (
    <div
      style={ style }
      className={ cn(
        'InputContainer',
        {
          'flex flex-col gap-1': labelPosition === 'top',
          'flex flex-row items-center gap-2': labelPosition === 'left',
        },
        containerClassName,
      ) }
    >
      { label && (
        <label
          className={ cn(
            'block text-slate-700 dark:text-slate-300',
            {
              'text-sm': size === 'sm',
              'text-base': size === 'md',
              'text-lg': size === 'lg',
              'min-w-24': labelPosition === 'left',
              'text-rose-500': error,
            },
          ) }
        >
          { label }
          { required && <span className="ml-1 text-rose-500">*</span> }
        </label>
      ) }
      { renderInput() }
      { error && errorMessage && (
        <div className="mt-1 text-sm text-rose-500">
          { errorMessage }
        </div>
      ) }
    </div>
  )
}))

Input.displayName = 'Input'

type Size = 'sm' | 'md' | 'lg'

export type InputProps = {
  /**
   * 容器类名
   */
  containerClassName?: string
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
   * 按下回车键时的回调
   */
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}
& Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'prefix'
>
