import { cn } from '@/utils'
import type { IconSize } from '../types'
import { getIconSizeStyles } from '../utils'

/**
 * 加号 SVG 图标
 */
export function Plus(props: PlusProps) {
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
      <path d="M12 5V19M5 12H19" />
    </svg>
  )
}

export type PlusProps = Omit<React.SVGProps<SVGSVGElement>, 'size'> & {
  /** 图标边长，支持预设尺寸或像素数值 */
  size?: IconSize
}
