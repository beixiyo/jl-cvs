import type { MotionProps } from 'framer-motion'
import type { CSSProperties, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

export function Mask({
  style,
  className,
  children,
  ...rest
}: MaskBgProps) {
  return (
    <motion.div
      initial={ { opacity: 0 } }
      animate={ { opacity: 1 } }
      exit={ { opacity: 0 } }
      transition={ { duration: 0.3 } }
      className={ cn(
        'fixed inset-0 backdrop-blur-md bg-black/50',
        'flex items-center justify-center z-[99]',
        className,
      ) }
      style={ style }
      { ...rest }
    >
      { children }
    </motion.div>
  )
}

Mask.displayName = 'Mask'

export type MaskBgProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}
& MotionProps
& HTMLAttributes<HTMLDivElement>
