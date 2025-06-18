import type { MotionProps } from 'framer-motion'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { memo } from 'react'
import { cn } from '@/utils'
import { animateVariants, DURTAION } from './constants'

const InnerAnimate = forwardRef<HTMLDivElement, AnimateProps>((
  {
    style,
    className,
    children,

    duration = DURTAION,
    variants,
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

      variants={ variants || animateVariants }
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
      {children}
    </motion.div>
  )
})

export const Animate = memo<AnimateProps>(InnerAnimate) as typeof InnerAnimate
Animate.displayName = 'Animate'

export type AnimateProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode

  duration?: number
}
& MotionProps
