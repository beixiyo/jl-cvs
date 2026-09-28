import { cn } from '@/utils'
import type { IconSize } from '../types'
import { getIconSizeStyles } from '../utils'

/**
 * X 形 SVG 图标
 */
export function X(props: XProps) {
  const { size, className, style, 'aria-hidden': ariaHidden, ...rest } = props
  const sizeStyles = size === undefined
    ? undefined
    : getIconSizeStyles(size)

  return (
    <svg
      { ...rest }
      className={ cn(sizeStyles?.className, className) }
      style={ { ...sizeStyles?.style, ...style } }
      aria-hidden={ ariaHidden ?? 'true' }
      viewBox={ props.viewBox ?? '0 0 24 24' }
      fill={ props.fill ?? 'none' }
      stroke={ props.stroke ?? 'currentColor' }
      strokeLinecap={ props.strokeLinecap ?? 'round' }
      strokeLinejoin={ props.strokeLinejoin ?? 'round' }
    >
      <path d="M18 6L6 18M6 6L18 18" />
    </svg>
  )
}

export type XProps = Omit<React.SVGProps<SVGSVGElement>, 'size'> & {
  /** 图标边长，支持预设尺寸或像素数值 */
  size?: IconSize
}
