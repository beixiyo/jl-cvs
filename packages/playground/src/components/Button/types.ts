import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import type { Rounded, SemanticVariant, Size } from '../../types'
import type { AuroraGlowProps } from '../AuroraGlow'
import type { TooltipProps } from '../Tooltip'
import type { buttonVariants } from './styles'

/**
 * 按钮组属性
 */
export type ButtonGroupProps =
  & {
    /**
     * 当前选中的值
     */
    active?: string

    /**
     * 值变化时的回调
     */
    onChange?: (value: any) => void

    /**
     * 子元素（嵌套 Button 组件，Button 需要提供 name 属性）
     */
    children?: React.ReactNode

    /**
     * 自定义类名
     */
    className?: string

    /**
     * 自定义样式
     */
    style?: React.CSSProperties

    /**
     * 滑动指示器（选中项背景）自定义类名
     *
     * 用于覆盖默认的 `bg-button`，例如浅色分段控件需要白色滑块
     */
    thumbClassName?: string

    /**
     * 圆角大小
     * @default 'full'
     */
    rounded?: Rounded | number

    /**
     * 是否显示外描边
     *
     * 关掉时连 1px 边框占位一起去掉，而不是只把颜色改成透明；
     * 容器高度扣掉边框后放不下 thumb 时，会让 thumb 上下间距不对称
     * @default true
     */
    bordered?: boolean

    /**
     * 强制重新计算滑块位置的标识位
     * 当该值变化时，ButtonGroup 会重新执行 getBoundingClientRect 计算
     */
    updateId?: string | number | boolean
  }
  & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>

/**
 * 按钮设计风格
 */
export type ButtonDesignStyle = 'default' | 'neumorphic'

/**
 * 按钮变体
 *
 * - 复用通用语义变体 SemanticVariant（default / success / warning / info / danger）
 * - Button 自己额外扩展 primary / secondary / link / ghost
 */
export type ButtonVariant = SemanticVariant | 'primary' | 'secondary' | 'link' | 'ghost'

/**
 * 按钮属性
 */
export type ButtonProps =
  & React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>
  & Omit<VariantProps<typeof buttonVariants>, 'size'>
  & {
    /**
     * 按钮尺寸
     * @default 'md'
     */
    size?: Size
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
     * @default 'default'
     */
    designStyle?: ButtonDesignStyle

    /**
     * 是否显示边框（仅对 default / secondary 等自带描边的 variant 生效）
     *
     * 所有 variant 始终保留 1px 透明边框占位，开关此项只改边框颜色，不影响盒子尺寸
     * @default false
     */
    bordered?: boolean

    /**
     * 是否为块级元素（占满容器宽度）
     * @default false
     */
    block?: boolean

    /**
     * 图标类名
     */
    iconClassName?: string

    /**
     * 按钮名称（用于 ButtonGroup 中标识按钮）
     */
    name?: string

    /**
     * 点击回调
     */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void

    asChild?: boolean
    as?: React.ElementType
    /**
     * 是否开启彩色辉光（AuroraGlow），用于强调态 / 悬浮入口按钮
     * @default false
     */
    glow?: boolean
    /**
     * 辉光细节配置（仅 `glow` 为 true 时生效），透传给 AuroraGlow
     * 不传 `radius` 时会按按钮的 `rounded` 自动推导
     */
    glowProps?: Omit<AuroraGlowProps, 'children'>
    /**
     * Tooltip 增强显示配置，传入时按钮会被 Tooltip 包裹作为触发元素
     *
     * - 如果传入 ReactNode，会被当作 Tooltip 的 content
     * - 如果传入对象，会被视作 TooltipProps（除 children 外）
     */
    tooltip?: ReactNode | Omit<TooltipProps, 'children'>
  }
