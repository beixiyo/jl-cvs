import { cn } from '@/utils'
import type { Variants } from 'motion/react'
import { motion } from 'motion/react'
import { memo } from 'react'
import type { CheckmarkProps } from '../types'
import { getSizeValue } from '../utils'

/**
 * 动态打勾组件，提供流畅的动画效果和高度可定制性
 * @example
 * <Checkmark
 *   size={80}
 *   strokeWidth={4}
 *   color="rgb(16, 185, 129)"
 *   show={true}
 * />
 */
export const Checkmark = memo<CheckmarkProps>((
  {
    size = 'md',
    strokeWidth = 2,
    borderColor = 'currentColor',
    backgroundColor = 'transparent',
    checkmarkColor = 'currentColor',
    className = '',
    show = true,
    showCircle = true,
    indeterminate = false,
    animationDuration = 3,
    animationDelay = 0,
    ...rest
  },
) => {
  const sizeValue = getSizeValue(size)
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          delay: i * animationDelay,
          type: 'spring',
          duration: animationDuration,
          ease: 'easeInOut',
        },
        opacity: { delay: i * animationDelay, duration: 0.2 },
      },
    }),
  }

  return (
    <motion.svg
      width={ sizeValue }
      height={ sizeValue }
      viewBox="0 0 24 24"
      fill="none"
      initial="hidden"
      animate={ show
        ? 'visible'
        : 'hidden' }
      className={ cn(
        'outline-hidden',
        rest.onClick
          ? 'cursor-pointer'
          : '',
        className,
      ) }
      { ...rest }
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        key={ backgroundColor }
        stroke={ borderColor }
        strokeWidth={ strokeWidth }
        variants={ !showCircle
          ? undefined
          : draw }
        custom={ 0 }
        style={ {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: backgroundColor,
        } }
      />
      { indeterminate
        ? (
          <motion.path
            d="M7 12L17 12"
            stroke={ checkmarkColor }
            strokeWidth={ strokeWidth }
            variants={ draw }
            custom={ 1 }
            style={ {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              fill: 'transparent',
              animationDuration: `${animationDuration}s`,
            } }
          />
        )
        : (
          <motion.path
            d="M7.61 11.88 10.95 16.34 16.4 7.6"
            stroke={ checkmarkColor }
            strokeWidth={ strokeWidth }
            variants={ draw }
            custom={ 1 }
            style={ {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              fill: 'transparent',
              animationDuration: `${animationDuration}s`,
            } }
          />
        ) }
    </motion.svg>
  )
})

Checkmark.displayName = 'Checkmark'
