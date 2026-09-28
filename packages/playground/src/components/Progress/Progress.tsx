import { cn } from '@/utils'
import { clamp } from '@jl-org/tool'
import { memo } from 'react'
import type { ProgressBarProps } from './types'

export const ProgressBar = memo<ProgressBarProps>((
  {
    style,
    className,
    value,
    colors = ['rgb(var(--brand) / 0.1)', 'rgb(var(--brand) / 1)'],
    height = 5,
    animated = true,
    animationDuration = 0.8,
    animationEase = 'easeOut',
  },
) => {
  const formatVal = clamp(value, 0, 1)

  /** 根据 colors 数组生成渐变背景 */
  const gradientBackground = `linear-gradient(to right, ${colors.join(', ')})`

  return (
    <div className={ cn('ProgressBarContainer w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700', className) }>
      <div
        className={ cn('rounded-full w-full') }
        style={ {
          background: gradientBackground,
          height,
          transition: animated
            ? `${animationDuration}s ${animationEase}`
            : 'none',
          transform: `scaleX(${formatVal})`,
          transformOrigin: 'left center',
          ...style,
        } }
      />
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'
