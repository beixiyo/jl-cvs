import { memo } from 'react'
import { cn } from '@/utils'

export const Card = memo<CardProps>((
  {
    style,
    className,
    children,
    title,
    image,
    footer,
    headerClassName,
    bodyClassName,
    footerClassName,
    imageClassName,
    imageStyle,
    imageAlt = '',
    variant = 'default',
    bordered = true,
    shadow = 'md',
    rounded = 'md',
    headerDivider = false,
    footerDivider = false,
    headerActions,
    elevation = 0,
    hoverEffect = false,
    padding = 'default',
  },
) => {
  const shadowClasses = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
    'xl': 'shadow-xl',
    '2xl': 'shadow-2xl',
    'inner': 'shadow-inner',
  }

  const roundedClasses = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    'full': 'rounded-full',
  }

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    primary: 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100',
    success: 'bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100',
    danger: 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100',
    info: 'bg-sky-50 dark:bg-sky-900/30 text-sky-900 dark:text-sky-100',
    transparent: 'bg-transparent',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  const elevationClasses = elevation > 0
    ? `translate-y-0 hover:-translate-y-${elevation} transition-transform duration-300`
    : ''

  const hoverClasses = hoverEffect
    ? 'transition-all duration-300 hover:shadow-lg hover:border-opacity-50'
    : ''

  return (
    <div
      className={ cn(
        'flex flex-col overflow-hidden',
        variantClasses[variant],
        roundedClasses[rounded],
        shadowClasses[shadow],
        elevationClasses,
        hoverClasses,
        bordered && 'border dark:border-gray-700',
        className,
      ) }
      style={ style }
    >
      {/* 卡片头部 */ }
      { (title || headerActions) && (
        <div className={ cn(
          'px-4 py-3 flex items-center justify-between',
          headerDivider && 'border-b dark:border-gray-700',
          headerClassName,
        ) }>
          { typeof title === 'string'
            ? (
                <h3 className="text-lg font-medium">{ title }</h3>
              )
            : title }

          { headerActions && (
            <div className="flex items-center space-x-2">
              { headerActions }
            </div>
          ) }
        </div>
      ) }

      {/* 卡片图片 */ }
      { image && (
        <div className={ cn(
          'w-full overflow-hidden',
          !title && !headerActions && 'rounded-t-inherit',
          imageClassName,
        ) }>
          { typeof image === 'string'
            ? (
                <img
                  src={ image }
                  alt={ imageAlt }
                  className="h-auto w-full object-cover"
                  style={ imageStyle }
                />
              )
            : image }
        </div>
      ) }

      {/* 卡片内容 */ }
      <div className={ cn(
        'flex-grow',
        padding !== 'none' && paddingClasses[padding],
        bodyClassName,
      ) }>
        { children }
      </div>

      {/* 卡片底部 */ }
      { footer && (
        <div className={ cn(
          'px-4 py-3',
          footerDivider && 'border-t dark:border-gray-700',
          footerClassName,
        ) }>
          { footer }
        </div>
      ) }
    </div>
  )
})

Card.displayName = 'Card'

export type CardProps = {
  /**
   * 卡片标题
   */
  title?: React.ReactNode
  /**
   * 卡片图片，可以是图片URL或React节点
   */
  image?: string | React.ReactNode
  /**
   * 图片alt属性
   * @default ''
   */
  imageAlt?: string
  /**
   * 卡片底部内容
   */
  footer?: React.ReactNode
  /**
   * 卡片变体样式
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'transparent' | 'glass'
  /**
   * 是否显示边框
   * @default true
   */
  bordered?: boolean
  /**
   * 阴影大小
   * @default 'md'
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'
  /**
   * 圆角大小
   * @default 'md'
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  /**
   * 头部是否有分隔线
   * @default false
   */
  headerDivider?: boolean
  /**
   * 底部是否有分隔线
   * @default false
   */
  footerDivider?: boolean
  /**
   * 头部右侧操作区
   */
  headerActions?: React.ReactNode
  /**
   * 头部自定义类名
   */
  headerClassName?: string
  /**
   * 内容区自定义类名
   */
  bodyClassName?: string
  /**
   * 底部自定义类名
   */
  footerClassName?: string
  /**
   * 图片容器自定义类名
   */
  imageClassName?: string
  /**
   * 图片自定义样式
   */
  imageStyle?: React.CSSProperties
  /**
   * 悬浮提升效果（数值为提升的像素）
   * @default 0
   */
  elevation?: 0 | 1 | 2 | 4 | 6 | 8
  /**
   * 鼠标悬浮时显示阴影和边框效果
   * @default false
   */
  hoverEffect?: boolean
  /**
   * 内容区域内边距
   * @default 'default'
   */
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl'
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
