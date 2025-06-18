import type { CSSProperties } from 'react'
import { isStr } from '@jl-org/tool'
import { memo } from 'react'
import { cn } from '@/utils'

export const LoadingIcon = memo<LoadingIconProps>((
  {
    style,
    className,
    size = 50,
    gradient = false,
    color = '#3b82f6',
  },
) => {
  const getStyle = (): { styles: CSSProperties | undefined, classNames: string } => {
    if (isStr(size)) {
      const sizeMap = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
      }

      return {
        styles: style,
        classNames: sizeMap[size],
      }
    }

    return {
      styles: {
        width: size,
        height: size,
        ...style,
      },
      classNames: '',
    }
  }

  const { styles, classNames } = getStyle()

  return <div
    className={ cn(
      'rounded-full flex items-center justify-center relative overflow-hidden',
      classNames,
      className,
    ) }
    style={ styles }
  >
    { gradient
      ? <div
          className="absolute inset-0 animate-spin rounded-full"
          style={ {
            background: `conic-gradient(from 0deg, transparent, ${color})`,
            mask: 'radial-gradient(circle, transparent 50%, black 58%)',
            WebkitMask: 'radial-gradient(circle, transparent 50%, black 58%)',
          } }
        >
        </div>

      : <div
          className={ cn(
            'border-2 rounded-full size-full animate-spin',
          ) }
          style={ {
            borderColor: color,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
          } }
        /> }
  </div>
})
LoadingIcon.displayName = 'LoadingIcon'

export interface LoadingIconProps {
  className?: string
  style?: CSSProperties
  size?: number | 'sm' | 'md' | 'lg'
  /**
   * Whether to use gradient background.
   * @default false
   */
  gradient?: boolean
  /**
   * The color of the loading icon.
   * @default '#3b82f6'
   */
  color?: string
}
