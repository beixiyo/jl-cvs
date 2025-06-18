import type { VariantProps } from 'class-variance-authority'
import type { SizeStyle } from '@/types'
import { cva } from 'class-variance-authority'
import React, { memo, useState } from 'react'
import { cn } from '@/utils'

const switchVariants = cva(
  'relative inline-flex items-center transition-colors duration-300 ease-in-out cursor-pointer',
  {
    variants: {
      variant: {
        default: '',
        disabled: 'cursor-not-allowed opacity-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const trackVariants = cva(
  'rounded-full transition-colors duration-300 ease-in-out',
  {
    variants: {
      size: {
        sm: 'w-9 h-5',
        md: 'w-11 h-6',
        lg: 'w-14 h-7',
      } as SizeStyle,
      checked: {
        true: 'bg-blue-500 dark:bg-blue-600',
        false: 'bg-gray-200 dark:bg-gray-700',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  },
)

const thumbVariants = cva(
  'absolute top-0.5 left-0.5 bg-white dark:bg-gray-100 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
      checked: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'sm',
        checked: true,
        class: 'translate-x-4',
      },
      {
        size: 'md',
        checked: true,
        class: 'translate-x-5',
      },
      {
        size: 'lg',
        checked: true,
        class: 'translate-x-7',
      },
    ],
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  },
)

export const Switch = memo<SwitchProps>(({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  color = '#3b82f6',
}) => {
  const [isChecked, setIsChecked] = useState(checked)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled)
      return
    const newChecked = event.target.checked
    setIsChecked(newChecked)
    onChange?.(newChecked)
  }

  return (
    <label className={ cn(switchVariants({ variant: disabled
      ? 'disabled'
      : 'default' })) }>
      <input
        type="checkbox"
        className="sr-only"
        checked={ isChecked }
        onChange={ handleChange }
        disabled={ disabled }
      />
      <div
        className={ cn(trackVariants({ size, checked: isChecked })) }
        style={ isChecked
          ? { backgroundColor: color }
          : undefined }
      >
        <div className={ cn(thumbVariants({ size, checked: isChecked })) } />
      </div>
    </label>
  )
})

interface SwitchProps extends VariantProps<typeof trackVariants> {
  /**
   * 是否选中
   * @default false
   */
  checked?: boolean
  /**
   * 状态改变时的回调函数
   */
  onChange?: (checked: boolean) => void
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 自定义颜色
   * @default '#3b82f6'
   */
  color?: string
}
