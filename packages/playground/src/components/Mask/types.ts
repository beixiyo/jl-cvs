/**
 * Mask 类型声明
 */

import type { MotionProps } from 'motion/react'
import type { CSSProperties, HTMLAttributes } from 'react'
export type MaskBgProps =
  & {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode
  }
  & MotionProps
  & HTMLAttributes<HTMLDivElement>
