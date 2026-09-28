'use client'

import { cn } from '@/utils'
import { motion } from 'motion/react'
import { forwardRef, memo } from 'react'
import { animateVariants, DURATION, variantsMap } from './constants'
import type { AnimateProps } from './types'

const InnerAnimate = forwardRef<HTMLDivElement, AnimateProps>((
  {
    style,
    className,
    children,

    duration = DURATION,
    variants = 'top-bottom',
    ...rest
  },
  ref,
) => {
  return (
    <motion.div
      ref={ ref }
      className={ cn(
        className,
      ) }
      style={ style }
      variants={ typeof variants === 'string'
        ? variantsMap[variants] || animateVariants
        : variants || animateVariants }
      initial="initial"
      animate="animate"
      exit="exit"
      transition={ {
        type: 'tween',
        ease: 'easeInOut',
        duration,
      } }
      { ...rest }
    >
      { children }
    </motion.div>
  )
})

export const Animate = memo<AnimateProps>(InnerAnimate) as typeof InnerAnimate
Animate.displayName = 'Animate'
