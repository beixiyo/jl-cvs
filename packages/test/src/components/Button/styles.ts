import type { ButtonProps, ButtonVariant } from './types'
import type { RoundedStyle, SizeStyle } from '@/types'
import { cva } from 'class-variance-authority'

/**
 * 按钮基础样式变体
 */
export const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500',
        primary: 'bg-primary text-white hover:bg-gray-600 active:bg-gray-600 dark:bg-primary dark:hover:bg-gray-700 dark:active:bg-gray-800',
        success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 dark:active:bg-green-800',
        warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 dark:active:bg-amber-800',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:active:bg-red-800',
        info: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 dark:active:bg-sky-800',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      } as SizeStyle,
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      } as RoundedStyle,
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
    },
  },
)

/**
 * 获取扁平风格按钮样式
 */
export function getFlatStyles(props: Props) {
  const { variant = 'default' } = props
  return buttonVariants({ variant, ...props })
}

/**
 * 获取描边风格按钮样式
 */
export function getOutlinedStyles(props: Props) {
  const { variant = 'default' } = props

  const variantStyles: Record<ButtonVariant, string> = {
    default: 'border border-gray-300 text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600',
    primary: 'border border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-500/20 dark:active:bg-blue-500/30',
    success: 'border border-green-500 text-green-500 hover:bg-green-50 active:bg-green-100 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-500/20 dark:active:bg-green-500/30',
    warning: 'border border-amber-500 text-amber-500 hover:bg-amber-50 active:bg-amber-100 dark:text-amber-400 dark:border-amber-500 dark:hover:bg-amber-500/20 dark:active:bg-amber-500/30',
    danger: 'border border-red-500 text-red-500 hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-500/20 dark:active:bg-red-500/30',
    info: 'border border-sky-500 text-sky-500 hover:bg-sky-50 active:bg-sky-100 dark:text-sky-400 dark:border-sky-500 dark:hover:bg-sky-500/20 dark:active:bg-sky-500/30',
  }

  return buttonVariants({
    ...props,
    variant: undefined,
    className: variantStyles[variant!],
  })
}

/**
 * 获取幽灵风格按钮样式
 */
export function getGhostStyles(props: Props) {
  const { variant = 'default' } = props

  const variantStyles: Record<ButtonVariant, string> = {
    default: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600',
    primary: 'text-blue-500 hover:bg-blue-50 active:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-500/20 dark:active:bg-blue-500/30',
    success: 'text-green-500 hover:bg-green-50 active:bg-green-100 dark:text-green-400 dark:hover:bg-green-500/20 dark:active:bg-green-500/30',
    warning: 'text-amber-500 hover:bg-amber-50 active:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:active:bg-amber-500/30',
    danger: 'text-red-500 hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/20 dark:active:bg-red-500/30',
    info: 'text-sky-500 hover:bg-sky-50 active:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-500/20 dark:active:bg-sky-500/30',
  }

  return buttonVariants({
    ...props,
    variant: undefined,
    className: variantStyles[variant!],
  })
}

/**
 * 获取新拟态风格按钮样式
 * - 浅色模式背景色建议：#e8e8e8
 * - 深色模式背景色建议：#262626
 */
export function getNeumorphicStyles(props: Props) {
  const { variant = 'default' } = props

  // Light Mode Neumorphic Styles
  // Base color: bg-[#f0f0f0]
  // Shadow colors: #d1d1d1 (darker), #ffffff (lighter)
  const baseNeumorphicLight = 'shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] bg-[#f0f0f0] text-gray-700 border-none'
  const activeNeumorphicLight = 'active:shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff]'
  const disabledNeumorphicLight = 'disabled:opacity-70 disabled:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]'
  const hoverNeumorphicLight = 'hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'

  // Dark Mode Neumorphic Styles
  // Base color: bg-neutral-800 (approx #262626 or similar dark gray)
  // Shadow colors: #1c1c1c (very dark), #3a3a3a (slightly lighter dark)
  const baseNeumorphicDark = 'dark:shadow-[5px_5px_10px_#1c1c1c,-5px_-5px_10px_#3a3a3a] dark:bg-[#262626] dark:text-neutral-300'
  const activeNeumorphicDark = 'dark:active:shadow-[inset_5px_5px_10px_#1c1c1c,inset_-5px_-5px_10px_#3a3a3a] dark:active:bg-neutral-900'
  const disabledNeumorphicDark = 'dark:disabled:opacity-70 dark:disabled:shadow-[inset_2px_2px_5px_#1c1c1c,inset_-2px_-2px_5px_#3a3a3a]'
  const hoverNeumorphicDark = 'dark:hover:shadow-[6px_6px_12px_#1c1c1c,-6px_-6px_12px_#3a3a3a] dark:hover:bg-neutral-900'

  const neumorphicBase = `${baseNeumorphicLight} ${activeNeumorphicLight} ${disabledNeumorphicLight} ${hoverNeumorphicLight} ${baseNeumorphicDark} ${activeNeumorphicDark} ${disabledNeumorphicDark} ${hoverNeumorphicDark}`

  const variantTextStyles: Record<string, string> = {
    default: '',
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-sky-600 dark:text-sky-400',
  }

  return buttonVariants({
    ...props,
    variant: undefined,
    className: `${neumorphicBase} ${variantTextStyles[variant!] || ''}`,
  })
}

/**
 * 获取图标按钮样式
 */
export function getIconButtonStyles(size: string) {
  const sizeStyles: Record<string, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return sizeStyles[size] || sizeStyles.md
}

type Props = Pick<ButtonProps, 'variant' | 'size' | 'rounded'>
