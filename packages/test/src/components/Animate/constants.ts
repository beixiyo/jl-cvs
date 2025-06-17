import type { Variant as VariantItem, Variants } from 'framer-motion'

export const DURTAION = 0.3

export const animateVariants = {
  initial: {
    opacity: 0,
    y: -10,
    height: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    height: 'auto',
  },
  exit: {
    opacity: 0,
    y: -10,
    height: 0,
  },
} satisfies Variants

export interface Variant {
  initial: VariantItem
  animate: VariantItem
  exit: VariantItem
}
