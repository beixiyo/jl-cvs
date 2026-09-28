import type { LucideProps } from 'lucide-react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { ModalVariant } from './types'

export const DURATION = 0.3

export const variantStyles: Record<ModalVariant, {
  accent: string
  bg: string
  border: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  iconBg: string
}> = {
  default: {
    accent: 'text-text2',
    bg: 'bg-background text-text',
    border: 'border-border',
    icon: Info,
    iconBg: 'bg-background2',
  },
  success: {
    accent: 'text-success',
    bg: 'bg-background text-text',
    border: 'border-border',
    icon: CheckCircle,
    iconBg: 'bg-successBg',
  },
  warning: {
    accent: 'text-warning',
    bg: 'bg-background text-text',
    border: 'border-border',
    icon: AlertTriangle,
    iconBg: 'bg-warningBg',
  },
  danger: {
    accent: 'text-danger',
    bg: 'bg-background text-text',
    border: 'border-border',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  error: {
    accent: 'text-danger',
    bg: 'bg-background text-text',
    border: 'border-border',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  info: {
    accent: 'text-info',
    bg: 'bg-background text-text',
    border: 'border-border',
    icon: Info,
    iconBg: 'bg-infoBg',
  },
} as const
