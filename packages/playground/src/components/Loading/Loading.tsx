import { vShow } from '@/hooks'
import { cn } from '@/utils'
import { memo } from 'react'
import { Z } from '../../constants/z-index'
import { Mask } from '../Mask'
import { Skeleton } from '../Skeleton/Skeleton'
import { LoadingIcon } from './subcomponents/LoadingIcon'
import type { LoadingProps } from './types'

export const Loading = memo<LoadingProps>((
  {
    style,
    className,
    loading = true,
    loadingStyle,

    zIndex = Z.overlay,
    size = 50,
    variant = 'spinner',
    iconProps,
    skeletonProps,
    custom,
    children,
  },
) => {
  const renderContent = () => {
    if (variant === 'skeleton') {
      return (
        <Skeleton
          size="full"
          { ...skeletonProps }
          className={ cn('w-full h-full', skeletonProps?.className) }
        />
      )
    }

    if (variant === 'custom') {
      return children || custom
    }

    return (
      <LoadingIcon
        size={ size }
        { ...iconProps }
        style={ {
          ...loadingStyle,
          ...iconProps?.style,
        } }
      />
    )
  }

  return (
    <Mask
      className={ cn(
        'flex justify-center items-center',
        variant !== 'spinner' && 'backdrop-blur-none bg-transparent',
        className,
      ) }
      style={ {
        zIndex,
        ...vShow(loading),
        ...style,
      } }
    >
      { renderContent() }
    </Mask>
  )
})
Loading.displayName = 'Loading'
