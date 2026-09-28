import type { Variants } from 'motion/react'
import type { PopoverPosition, PopoverVariantsMap } from './types'

/** 各位置的入场/出场动画变体 */
export const popoverVariants: PopoverVariantsMap = {
  top: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  bottom: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  left: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  },
  right: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  },
} as const

/** 根据 placement 字符串取对应变体（如 'top-start' -> 'top'） */
export function getVariantByPlacement(placement: string): Variants {
  const side = (placement.split('-')[0] || 'top') as PopoverPosition
  return popoverVariants[side]
}
