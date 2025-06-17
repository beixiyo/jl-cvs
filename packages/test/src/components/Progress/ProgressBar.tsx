import { cn } from '@/utils'
import { memo } from 'react'

export const ProgressBar = memo<ProgressBarProps>((
  {
    style,
    className,
    value,
    fromColor = '#3276F91A',
    toColor = '#01D0BD',
  },
) => {
  if (value < 0 || value > 1) {
    console.error('ProgressBar value should be between 0 and 1')
  }
  const formatVal = Math.min(value, 1) * 100

  return <div
    className={ cn(
      'ProgressBarContainer h-1 w-full',
      className,
    ) }
    style={ style }
  >
    <div
      style={ {
        borderRadius: '4px',
        background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
        height: '100%',
        width: `${formatVal}%`,
        transition: '.3s',
      } }
    >
    </div>
  </div>
})

ProgressBar.displayName = 'ProgressBar'

export type ProgressBarProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  /**
   * Progress value between 0 and 1
   */
  value: number
  /**
   * @default #3276F91A
   */
  fromColor?: string
  /**
   * @default #01D0BD
   */
  toColor?: string
}
