import { cn } from '@/utils'
import type { IconButtonVariant, IconSize } from '../types'
import { getIconButtonSizeStyles } from '../utils'

/**
 * icon 按钮的内部通用实现，不对外暴露
 */
export function IconButton(props: IconButtonProps) {
  const {
    style,
    className,
    icon: Icon,
    iconSize,
    iconColor,
    iconClassName,
    iconProps,
    size = props.mode === 'absolute'
      ? 'sm'
      : 'md',
    mode = 'absolute',
    variant = 'default',
    corner = 'top-right',
    stopPropagation = true,
    strokeWidth = 2.5,
    children,
    'aria-label': ariaLabel,
    onClick,
    ...rest
  } = props
  const sizeStyles = getIconButtonSizeStyles(size, variant)
  const resolvedIconSize = iconSize ?? sizeStyles.iconSize

  let positionClass = ''
  if (mode !== 'static') {
    const offset = mode === 'absolute'
      ? '2'
      : '4'
    const vertical = corner.startsWith('top')
      ? `top-${offset}`
      : `bottom-${offset}`
    const horizontal = corner.endsWith('right')
      ? `right-${offset}`
      : `left-${offset}`
    positionClass = cn(mode, vertical, horizontal)
  }

  const variantClass = variant === 'filled'
    ? 'bg-text text-background hover:bg-text2'
    : 'text-text2 hover:text-text'
  const filledNumericPadding = variant === 'filled' && typeof size === 'number'
    ? 'p-0.5'
    : ''

  return (
    <button
      type="button"
      aria-label={ ariaLabel }
      onClick={ (event) => {
        if (stopPropagation) event.stopPropagation()
        onClick?.(event)
      } }
      className={ cn(
        'inline-flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer',
        '[-webkit-app-region:no-drag]',
        variantClass,
        sizeStyles.className,
        filledNumericPadding,
        positionClass,
        className,
      ) }
      style={ { ...sizeStyles.style, ...style } }
      { ...rest }
    >
      { children ?? (
        <Icon
          { ...iconProps }
          className={ cn(iconProps?.className, iconClassName) }
          width={ iconProps?.width ?? resolvedIconSize }
          height={ iconProps?.height ?? resolvedIconSize }
          stroke={ iconProps?.stroke ?? iconColor ?? 'currentColor' }
          strokeWidth={ iconProps?.strokeWidth ?? strokeWidth }
        />
      ) }
    </button>
  )
}

export type IconButtonProps =
  & {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    iconSize?: number
    iconColor?: string
    iconClassName?: string
    iconProps?: React.SVGProps<SVGSVGElement>
    strokeWidth?: number
    size?: IconSize
    mode?: 'absolute' | 'fixed' | 'static'
    variant?: IconButtonVariant
    corner?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    stopPropagation?: boolean
  }
  & React.PropsWithChildren<Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>>
