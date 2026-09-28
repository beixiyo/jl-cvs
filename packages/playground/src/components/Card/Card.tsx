import { useTheme } from '@/hooks'
import { cn } from '@/utils'
import { forwardRef, memo } from 'react'
import { getRoundedStyles } from '../../utils/roundedUtils'
import type { CardProps } from './types'

export const Card = memo(forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const [theme] = useTheme()
  const {
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
    bordered = theme !== 'light',
    shadow = 'md',
    rounded = 'xl',
    headerDivider = false,
    footerDivider = false,
    headerActions,
    hoverEffect = true,
    padding = 'default',
    titleTag: TitleTag = 'h3',
    ...rest
  } = props

  const shadowClasses = {
    none: '',
    sm: 'shadow-xs',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
  }

  /** 获取阴影样式（使用 text 变量实现主题自适应阴影） */
  const getShadowStyles = () => {
    if (typeof shadow === 'number') {
      const alpha1 = shadow / 100
      const alpha2 = shadow / 150
      return {
        className: undefined,
        style: {
          boxShadow: `0 4px 6px -1px rgb(var(--text) / ${alpha1}), 0 2px 4px -1px rgb(var(--text) / ${alpha2})`,
        },
      }
    }
    return {
      className: shadowClasses[shadow],
      style: undefined,
    }
  }

  const shadowStyles = getShadowStyles()

  const { className: roundedClass, style: roundedStyle } = getRoundedStyles(rounded)

  const variantClasses = {
    default: 'bg-background text-text',
    primary: 'toning-blue toning-blue-border',
    success: 'toning-green toning-green-border',
    warning: 'toning-yellow toning-yellow-border',
    danger: 'toning-red toning-red-border',
    info: 'bg-infoBg text-info',
    transparent: 'bg-transparent',
    glass: 'bg-background/70 backdrop-blur-md text-text',
  }

  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-2',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  const sectionPaddingClass = paddingClasses[padding] ?? padding

  const hoverClasses = hoverEffect
    ? 'transition-all duration-300 hover:shadow-lg hover:border-border2'
    : ''

  return (
    <div
      className={ cn(
        'flex flex-col overflow-hidden',
        variantClasses[variant],
        roundedClass,
        shadowStyles.className,
        hoverClasses,
        bordered && 'border border-border',
        className,
      ) }
      style={ { ...shadowStyles.style, ...roundedStyle, ...style } }
      ref={ ref }
      { ...rest }
    >
      { /* 卡片头部 */ }
      { (title || headerActions) && (
        <div
          className={ cn(
            'flex items-center justify-between',
            sectionPaddingClass,
            headerDivider && 'border-b border-border',
            headerClassName,
          ) }
        >
          { typeof title === 'string'
            ? <TitleTag className="text-lg font-medium">{ title }</TitleTag>
            : title }

          { headerActions && (
            <div className="flex items-center space-x-2">
              { headerActions }
            </div>
          ) }
        </div>
      ) }

      { /* 卡片图片 */ }
      { image && (
        <div
          className={ cn(
            'w-full overflow-hidden',
            !title && !headerActions && 'rounded-t-inherit',
            imageClassName,
          ) }
        >
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

      { /* 卡片内容 */ }
      <div
        className={ cn(
          'grow',
          sectionPaddingClass,
          bodyClassName,
        ) }
      >
        { children }
      </div>

      { /* 卡片底部 */ }
      { footer && (
        <div
          className={ cn(
            sectionPaddingClass,
            footerDivider && 'border-t border-border',
            footerClassName,
          ) }
        >
          { footer }
        </div>
      ) }
    </div>
  )
}))

Card.displayName = 'Card'
