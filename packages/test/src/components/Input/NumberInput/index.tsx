import type { ChangeEvent } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { forwardRef, memo, useCallback, useState } from 'react'
import { cn } from '@/utils'

export const NumberInput = memo<NumberInputProps>(forwardRef<HTMLInputElement, NumberInputProps>((
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
    value,
    min: _min,
    max: _max,
    step = 1,
    precision = 0,
    ...rest
  } = props

  const min = typeof _min === 'string'
    ? Number.parseFloat(_min)
    : _min
  const max = typeof _max === 'string'
    ? Number.parseFloat(_max)
    : _max

  const [isFocused, setIsFocused] = useState(false)
  const [internalVal, setInternalVal] = useState('')
  const isControlMode = value !== undefined
  const realValue = isControlMode
    ? value
    : internalVal

  /** 格式化数字 */
  const formatNumber = useCallback((value: string): string => {
    if (!value)
      return ''

    let numValue = Number.parseFloat(value)

    /** 应用最小值和最大值限制 */
    if (min !== undefined && numValue < min)
      numValue = min
    if (max !== undefined && numValue > max)
      numValue = max

    /** 处理精度 */
    if (precision !== undefined) {
      return numValue.toFixed(precision)
    }

    return String(numValue)
  }, [min, max, precision])

  /** 处理值变化 */
  const handleChangeVal = useCallback(
    (val: string, e: ChangeEvent<HTMLInputElement>) => {
      /** 只允许数字和小数点 */
      const regex = /^-?\d*\.?\d*$/
      if (val !== '' && !regex.test(val))
        return

      const formattedVal = val === ''
        ? ''
        : val

      isControlMode
        ? onChange?.(Number(formattedVal), e)
        : setInternalVal(formattedVal)
    },
    [isControlMode, onChange],
  )

  /** 处理输入变化 */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      handleChangeVal(value, e)
    },
    [handleChangeVal],
  )

  /** 处理步进增加 */
  const handleIncrement = useCallback(() => {
    if (disabled || readOnly)
      return

    const currentValue = realValue === ''
      ? 0
      : Number.parseFloat(realValue.toString())
    const newValue = currentValue + (step || 1)
    const formattedValue = formatNumber(String(newValue))

    const mockEvent = {
      target: { value: formattedValue },
    } as ChangeEvent<HTMLInputElement>

    handleChangeVal(formattedValue, mockEvent)
  }, [realValue, step, disabled, readOnly, formatNumber, handleChangeVal])

  /** 处理步进减少 */
  const handleDecrement = useCallback(() => {
    if (disabled || readOnly)
      return

    const currentValue = realValue === ''
      ? 0
      : Number.parseFloat(realValue.toString())
    const newValue = currentValue - (step || 1)
    const formattedValue = formatNumber(String(newValue))

    const mockEvent = {
      target: { value: formattedValue },
    } as ChangeEvent<HTMLInputElement>

    handleChangeVal(formattedValue, mockEvent)
  }, [realValue, step, disabled, readOnly, formatNumber, handleChangeVal])

  /** 处理聚焦 */
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }, [onFocus])

  /** 处理失焦 */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)

    /** 在失焦时格式化数字 */
    if (realValue !== '') {
      const formattedValue = formatNumber(realValue.toString())

      const mockEvent = {
        target: { value: formattedValue },
      } as ChangeEvent<HTMLInputElement>

      handleChangeVal(formattedValue, mockEvent)
    }

    onBlur?.(e)
  }, [onBlur, realValue, formatNumber, handleChangeVal])

  /** 处理键盘事件 */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement()
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement()
    }
    else if (e.key === 'Enter' && onPressEnter) {
      onPressEnter(e)
    }
  }, [onKeyDown, onPressEnter, handleIncrement, handleDecrement])

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  }

  const stepperSize = {
    sm: 14,
    md: 16,
    lg: 18,
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

  const stepperButtonClasses = cn(
    'flex items-center justify-center p-0.5 text-slate-400',
    'hover:text-slate-600 dark:hover:text-slate-300',
    'transition-colors duration-200',
    disabled && 'opacity-50 cursor-not-allowed hover:text-slate-400',
    readOnly && 'opacity-50 cursor-not-allowed hover:text-slate-400',
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
        value={ realValue }
        className={ cn(
          inputClasses,
          prefix
            ? 'pl-2'
            : 'pl-3',
          'pr-2', // 为步进按钮留出空间
        ) }
        disabled={ disabled }
        readOnly={ readOnly }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        onKeyDown={ handleKeyDown }
        onChange={ handleChange }
        inputMode="decimal"
        { ...rest }
      />
      <div className="mr-1 flex flex-col">
        <button
          type="button"
          className={ stepperButtonClasses }
          onClick={ handleIncrement }
          disabled={ disabled || readOnly || (max !== undefined && Number.parseFloat(realValue.toString() || '0') >= max) }
          tabIndex={ -1 }
        >
          <ChevronUp size={ stepperSize[size] } />
        </button>
        <button
          type="button"
          className={ stepperButtonClasses }
          onClick={ handleDecrement }
          disabled={ disabled || readOnly || (min !== undefined && Number.parseFloat(realValue.toString() || '0') <= min) }
          tabIndex={ -1 }
        >
          <ChevronDown size={ stepperSize[size] } />
        </button>
      </div>
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
        'NumberInputContainer',
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

NumberInput.displayName = 'NumberInput'

type Size = 'sm' | 'md' | 'lg'

export type NumberInputProps
  = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size' | 'prefix' | 'type'>
    & {
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
    }
