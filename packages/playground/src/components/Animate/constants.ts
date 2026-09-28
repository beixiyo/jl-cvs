import type { Variant as VariantItem, Variants } from 'motion/react'

export const DURATION = 0.3

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

export const variantsMap = {
  'top-bottom': {
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
  },
  'bottom-top': {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 10,
    },
  },
  'left-right': {
    initial: {
      opacity: 0,
      x: -10,
      height: 0,
    },
    animate: {
      opacity: 1,
      x: 0,
      height: 'auto',
    },
    exit: {
      opacity: 0,
      x: -10,
      height: 0,
    },
  },
  'right-left': {
    initial: {
      opacity: 0,
      x: 10,
      height: 0,
    },
    animate: {
      opacity: 1,
      x: 0,
      height: 'auto',
    },
    exit: {
      opacity: 0,
      x: 10,
      height: 0,
    },
  },
  fade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  },
  scale: {
    initial: {
      opacity: 0,
      scale: 0.95,
      height: 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      height: 'auto',
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      height: 0,
    },
  },
} satisfies Record<string, Variants>

export interface Variant {
  initial: VariantItem
  animate: VariantItem
  exit: VariantItem
}
