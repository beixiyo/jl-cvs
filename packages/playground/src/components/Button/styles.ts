import { cva } from 'class-variance-authority'
import type { RoundedStyle, SizeStyle } from '../../types'
import type { ButtonProps, ButtonVariant } from './types'

/**
 * 按钮基础样式变体
 */
export const buttonVariants = cva(
  /**
   * base 统一带 1px 透明边框，保证所有 variant 盒子尺寸一致，开关边框只改颜色不改尺寸
   *
   * 禁用态是设计规范的固定观感「5% 底色 + 30% 文字」，不再用 `opacity-50` 整体压透明：
   * 后者对深色实心按钮（primary / danger）会压成「中灰底 + 糊掉的白字」，与规范方向不同
   * 底色和文字色都挂 `disabled:` 修饰符，特异性高于各 variant 的常态 `bg-*` / `text-*`，
   * 因此无需在每个 variant 上重复声明
   */
  'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-hidden disabled:cursor-not-allowed disabled:bg-button/5 disabled:text-text4 border border-transparent',
  {
    variants: {
      variant: {
        default: 'bg-button3 text-text hover:bg-background3 active:bg-background3',
        secondary: 'bg-button2 text-text hover:bg-background3 active:bg-background5',
        primary: 'bg-button text-button3 hover:opacity-90 active:opacity-80',
        success: 'bg-success text-white hover:opacity-90 active:opacity-80',
        warning: 'bg-warning text-white hover:opacity-90 active:opacity-80',
        danger: 'bg-danger text-white hover:opacity-90 active:opacity-80',
        info: 'bg-info text-white hover:opacity-90 active:opacity-80',
        link: 'bg-transparent text-info hover:underline active:text-info',
        ghost: 'bg-transparent text-text hover:bg-background3 active:bg-background5',
      } as Record<ButtonVariant, string>,
      size: {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      } as SizeStyle,
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-xs',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      } as RoundedStyle,
      /** 是否显示边框，仅对自带描边的 variant（default / secondary）生效 */
      bordered: {
        true: '',
        false: '',
      },
    },
    /** 仅在 bordered 开启时，为 default / secondary 上描边颜色（含 hover / active 态） */
    compoundVariants: [
      {
        variant: 'default',
        bordered: true,
        class: 'border-border hover:border-border2 active:border-border3',
      },
      {
        variant: 'secondary',
        bordered: true,
        class: 'border-border hover:border-border2 active:border-border3',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
      bordered: false,
    },
  },
)

/**
 * 获取扁平风格按钮样式
 */
export function getDefaultStyles(props: Props) {
  const { variant = 'default', size, ...rest } = props
  /** 如果 size 是 number，不传递给 cva（cva 不支持 number） */
  if (typeof size === 'number') {
    return buttonVariants({ variant, ...rest })
  }
  return buttonVariants({ variant, size, ...rest })
}

/**
 * 获取新拟态风格按钮样式
 * - 浅色模式背景色建议：#e8e8e8
 * - 深色模式背景色建议：#262626
 */
export function getNeumorphicStyles(props: Props) {
  const { variant = 'default' } = props

  /**
   * Light Mode Neumorphic Styles
   * Base color: bg-[#f0f0f0]
   * Shadow colors: #d1d1d1 (darker), #ffffff (lighter)
   */
  const baseNeumorphicLight = 'shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] bg-[#f0f0f0] text-gray-700 border-none'
  const activeNeumorphicLight = 'active:shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] active:bg-[#e8e8e8]'
  /** 新拟态自带一套禁用观感（压透明 + 内阴影），把 base 的禁用底色和文字色还原回来 */
  const disabledNeumorphicLight =
    'disabled:opacity-70 disabled:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff] disabled:bg-[#f0f0f0] disabled:text-gray-700'
  const hoverNeumorphicLight = 'hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:bg-[#f0f0f0]'

  /**
   * Dark Mode Neumorphic Styles
   * Base color: bg-neutral-800 (approx #262626 or similar dark gray)
   * Shadow colors: #1c1c1c (very dark), #3a3a3a (slightly lighter dark)
   */
  const baseNeumorphicDark = 'dark:shadow-[5px_5px_10px_#1c1c1c,-5px_-5px_10px_#3a3a3a] dark:bg-[#262626] dark:text-neutral-300'
  const activeNeumorphicDark = 'dark:active:shadow-[inset_5px_5px_10px_#1c1c1c,inset_-5px_-5px_10px_#3a3a3a] dark:active:bg-neutral-900'
  const disabledNeumorphicDark =
    'dark:disabled:opacity-70 dark:disabled:shadow-[inset_2px_2px_5px_#1c1c1c,inset_-2px_-2px_5px_#3a3a3a] dark:disabled:bg-[#262626] dark:disabled:text-neutral-300'
  const hoverNeumorphicDark = 'dark:hover:shadow-[6px_6px_12px_#1c1c1c,-6px_-6px_12px_#3a3a3a] dark:hover:bg-neutral-900'

  const neumorphicBase =
    `${baseNeumorphicLight} ${activeNeumorphicLight} ${disabledNeumorphicLight} ${hoverNeumorphicLight} ${baseNeumorphicDark} ${activeNeumorphicDark} ${disabledNeumorphicDark} ${hoverNeumorphicDark}`

  const variantTextStyles: Record<string, string> = {
    default: 'text-neutral-900 dark:text-neutral-100',
    primary: 'text-neutral-900 dark:text-neutral-100',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
    link: 'text-blue-600 dark:text-blue-400 hover:underline',
    ghost: 'text-gray-600 dark:text-gray-400',
  }

  const { size, ...restProps } = props
  /** 如果 size 是 number，不传递给 cva（cva 不支持 number） */
  const cvaProps = typeof size === 'number'
    ? restProps
    : { size, ...restProps }

  return buttonVariants({
    ...cvaProps,
    variant: undefined,
    className: `${neumorphicBase} ${variantTextStyles[variant!] || ''}`,
  })
}

/**
 * 获取图标按钮样式
 */
export function getIconButtonStyles(size: string | number) {
  if (typeof size === 'number') {
    return undefined // 返回 undefined，使用行内样式
  }
  const sizeStyles: Record<string, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return sizeStyles[size] || sizeStyles.md
}

type Props = Pick<ButtonProps, 'variant' | 'size' | 'rounded' | 'bordered'>
