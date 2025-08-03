'use client'

import type { ChangeEvent } from 'react'
import { numFixed } from '@jl-org/tool'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { forwardRef, memo, useCallback, useState } from 'react'
import { useFormField } from '@/components/Form'
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
    precision,
    name,
    ...rest
  } = props

  /** 使用 useFormField hook 处理表单集成 */
  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur: handleFieldBlur,
  } = useFormField<string | number, ChangeEvent<HTMLInputElement>, number | undefined>({
    name,
    value,
    error,
    errorMessage,
    onChange: onChange as any,
    defaultValue: '',
  })

  const min = typeof _min === 'string'
    ? Number.parseFloat(_min)
    : _min
  const max = typeof _max === 'string'
    ? Number.parseFloat(_max)
    : _max

  const [isFocused, setIsFocused] = useState(false)

  /** 处理输入变化 */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val === '') {
        handleChangeVal(0, e)
        return
      }

      const allowNegative = min === undefined || min < 0
      const allowDecimal = precision !== undefined && precision > 0

      let pattern = '\\d*'
      if (allowDecimal) {
        /** 允许一个小数点 */
        pattern = '\\d*\\.?\\d*'
      }

      if (allowNegative) {
        pattern = `-?${pattern}`
      }

      const regex = new RegExp(`^${pattern}$`)

      if (!regex.test(val)) {
        return
      }

      /** 允许输入中间状态，如 '-' 或以 '.' 结尾 */
      if ((allowNegative && val === '-') || (allowDecimal && val.endsWith('.'))) {
        handleChangeVal(val as any, e)
      }
      else {
        const num = Number.parseFloat(val)
        if (!Number.isNaN(num)) {
          handleChangeVal(num, e)
        }
      }
    },
    [handleChangeVal, precision, min],
  )

  /** 处理步进 */
  const handleIncrementOrDecrement = useCallback((type: 'increment' | 'decrement') => {
    if (disabled || readOnly)
      return

    const valStr = (actualValue ?? '').toString()
    if (max !== undefined && Number.parseFloat(valStr) >= max)
      return

    let currentValue = Number.parseFloat(valStr)
    if (Number.isNaN(currentValue))
      currentValue = 0

    const newValue = type === 'increment'
      ? currentValue + step
      : currentValue - step

    let clampedValue = newValue
    if (max !== undefined && clampedValue > max)
      clampedValue = max

    const formattedValue = precision !== undefined
      ? numFixed(clampedValue, precision)
      : clampedValue

    const mockEvent = {
      target: { value: String(formattedValue) },
    } as ChangeEvent<HTMLInputElement>

    handleChangeVal(formattedValue, mockEvent)
  }, [actualValue, step, disabled, readOnly, max, precision, handleChangeVal])

  /** 处理聚焦 */
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }, [onFocus])

  /** 处理失焦 */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    handleFieldBlur()

    let valueToSet: number | undefined
    const valueStr = (actualValue ?? '').toString()

    if (valueStr !== '') {
      /** 如果值是无效的中间状态，则清空 */
      if (valueStr === '-' || valueStr.endsWith('.')) {
        valueToSet = undefined
      }
      else {
        let numValue = Number.parseFloat(valueStr)
        if (!Number.isNaN(numValue)) {
          /** 应用范围限制 */
          if (min !== undefined && numValue < min)
            numValue = min
          if (max !== undefined && numValue > max)
            numValue = max

          /** 格式化精度 */
          valueToSet = precision !== undefined
            ? numFixed(numValue, precision)
            : numValue
        }
        else {
          valueToSet = undefined
        }
      }
    }
    else {
      valueToSet = undefined
    }

    const mockEvent = {
      target: {
        value: valueToSet === undefined
          ? ''
          : String(valueToSet),
      },
    } as ChangeEvent<HTMLInputElement>
    handleChangeVal(valueToSet ?? 0, mockEvent)

    onBlur?.(e)
  }, [onBlur, actualValue, min, max, precision, handleChangeVal, handleFieldBlur])

  /** 处理键盘事件 */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrementOrDecrement('increment')
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleIncrementOrDecrement('decrement')
    }
    else if (e.key === 'Enter' && onPressEnter) {
      onPressEnter(e)
    }
  }, [handleIncrementOrDecrement, onKeyDown, onPressEnter])

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
    'relative w-full flex items-center rounded-lg border',
    sizeClasses[size],
    {
      'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900': !actualError && !disabled,
      'border-rose-500 hover:border-rose-600 focus-within:border-rose-500': actualError && !disabled,
      'border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed': disabled,
      '': isFocused && !actualError && !disabled,
      'hover:border-slate-400 dark:hover:border-slate-600': !isFocused && !actualError && !disabled,
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
        value={ actualValue }
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
        name={ name }
        { ...rest }
      />
      <div className="mr-1 flex flex-col">
        <button
          type="button"
          className={ stepperButtonClasses }
          onClick={ () => handleIncrementOrDecrement('increment') }
          disabled={ disabled || readOnly || (max !== undefined && Number.parseFloat(actualValue?.toString() || '0') >= max) }
          tabIndex={ -1 }
        >
          <ChevronUp size={ stepperSize[size] } />
        </button>
        <button
          type="button"
          className={ stepperButtonClasses }
          onClick={ () => handleIncrementOrDecrement('decrement') }
          disabled={ disabled || readOnly || (min !== undefined && Number.parseFloat(actualValue?.toString() || '0') <= min) }
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
              'text-rose-500': actualError,
            },
          ) }
        >
          { label }
          { required && <span className="ml-1 text-rose-500">*</span> }
        </label>
      ) }
      { renderInput() }
      { actualError && actualErrorMessage && (
        <div className="mt-1 text-sm text-rose-500">
          { actualErrorMessage }
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
