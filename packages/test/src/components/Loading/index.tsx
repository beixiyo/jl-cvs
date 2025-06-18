import type { CSSProperties } from 'react'
import { memo } from 'react'
import { Mask } from '@/components/Mask'
import { vShow } from '@/hooks/'
import { cn } from '@/utils'
import { LoadingIcon } from './LoadingIcon'

export const Loading = memo<LoadingProps>((
  {
    style,
    className,
    loading,
    loadingStyle,

    zIndex = 50,
    size = 50,
  },
) => {
  return <Mask
    className={ cn(
      'flex justify-center items-center',
      className,
    ) }
    style={ {
      zIndex,
      ...vShow(loading),
      ...style,
    } }
  >
    <LoadingIcon
      size={ size }
      style={ {
        ...loadingStyle,
      } }
    />

  </Mask>
})
Loading.displayName = 'Loading'

export interface LoadingProps {
  className?: string
  style?: CSSProperties
  loadingStyle?: CSSProperties

  loading: boolean
  /**
   * @default 99
   */
  zIndex?: number
  size?: number
}
