import { cva } from 'class-variance-authority'
import type { SizeStyle } from '../../types'

export const switchVariants = cva(
  'relative inline-flex items-center transition-colors duration-300 ease-in-out cursor-pointer',
  {
    variants: {
      variant: {
        default: '',
        disabled: 'cursor-not-allowed opacity-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export const trackVariants = cva(
  'rounded-full transition-colors duration-300 ease-in-out',
  {
    variants: {
      size: {
        sm: 'w-9 h-5',
        md: 'w-11 h-6',
        lg: 'w-14 h-7',
      },
      checked: {
        true: 'bg-brand',
        false: 'bg-background5',
      },
      withGradient: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        withGradient: true,
        checked: true,
        class: 'bg-linear-to-r from-systemBlue to-systemPurple',
      },
    ],
    defaultVariants: {
      size: 'md',
      checked: false,
      withGradient: false,
    },
  },
)

export const thumbVariants = cva(
  'absolute top-0.5 left-0.5 rounded-full bg-white shadow-2xs transform transition-transform duration-300 ease-in-out flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
      checked: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  },
)

export const switchSizeConfig = {
  sm: {
    trackWidth: 36,
    trackHeight: 20,
    thumbWidth: 16,
    thumbHeight: 16,
    thumbInset: 2,
  },
  md: {
    trackWidth: 44,
    trackHeight: 24,
    thumbWidth: 20,
    thumbHeight: 20,
    thumbInset: 2,
  },
  lg: {
    trackWidth: 56,
    trackHeight: 28,
    thumbWidth: 24,
    thumbHeight: 24,
    thumbInset: 2,
  },
} satisfies Record<keyof SizeStyle, SwitchSizeConfig>

type SwitchSizeConfig = {
  trackWidth: number
  trackHeight: number
  thumbWidth: number
  thumbHeight: number
  thumbInset: number
}
