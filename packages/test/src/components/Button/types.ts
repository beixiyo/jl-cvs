import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import type { buttonVariants } from './styles'

/**
 * 按钮设计风格
 */
export type ButtonDesignStyle = 'flat' | 'neumorphic' | 'outlined' | 'ghost'

/**
 * 按钮变体
 */
export type ButtonVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * 按钮属性
 */
export type ButtonProps = React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>
  & VariantProps<typeof buttonVariants> & {
    /**
     * 按钮左侧图标
     */
    leftIcon?: ReactNode

    /**
     * 按钮右侧图标
     */
    rightIcon?: ReactNode

    /**
     * 仅显示图标的按钮
     */
    iconOnly?: boolean

    /**
     * 加载状态
     * @default false
     */
    loading?: boolean

    /**
     * 加载状态时显示的文本
     */
    loadingText?: string

    /**
     * 禁用状态
     * @default false
     */
    disabled?: boolean

    /**
     * 设计风格
     * @default 'flat'
     */
    designStyle?: ButtonDesignStyle

    /**
     * 是否为块级元素（占满容器宽度）
     * @default false
     */
    block?: boolean

    /**
     * hover 状态类名
     */
    hoverClassName?: string

    /**
     * 激活状态类名
     */
    activeClassName?: string

    /**
     * 禁用状态类名
     */
    disabledClassName?: string

    /**
     * 加载状态类名
     */
    loadingClassName?: string

    /**
     * 图标类名
     */
    iconClassName?: string

    /**
     * 点击回调
     */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void

    asChild?: boolean
  }
