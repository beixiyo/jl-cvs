import { cn } from '@/utils'
import { memo } from 'react'
import { badgeVariants } from './styles'
import type { BadgeProps } from './types'

/**
 * 徽章：支持附着在子元素角上（数字/圆点/content），或 `standalone` 单独展示胶囊文案
 */
export const Badge = memo(({
  className,
  variant,
  size,
  count,
  dot = false,
  maxCount = 99,
  showZero = false,
  content,
  badgeClassName,
  badgeStyle,
  style,
  children,
  ...props
}: BadgeProps) => {
  const displayCount = count && count > maxCount
    ? `${maxCount}+`
    : count

  if (dot) {
    return (
      <div
        className={ cn(
          'relative inline-flex',
          className,
        ) }
        style={ style }
        { ...props }
      >
        <div
          className={ cn(
            badgeVariants({ variant, size }),
            'absolute right-0 top-0 h-2 w-2 translate-x-1/2 -translate-y-1/2 p-0',
            badgeClassName,
          ) }
          style={ badgeStyle }
        />
        { children }
      </div>
    )
  }

  if (!count && !showZero && !content) {
    return <>{ children }</>
  }

  return (
    <div
      className={ cn(
        'relative inline-flex',
        className,
      ) }
      style={ style }
      { ...props }
    >
      { children }
      <div
        className={ cn(
          badgeVariants({ variant, size }),
          'absolute right-0 top-0 translate-x-1/2 -translate-y-1/2',
          badgeClassName,
        ) }
        style={ badgeStyle }
      >
        { content || displayCount }
      </div>
    </div>
  )
})

Badge.displayName = 'Badge'
