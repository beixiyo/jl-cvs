import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { ModalVariant } from './types'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export const DURATION = 0.3

export const variantStyles: Record<ModalVariant, {
  accent: string
  bg: string
  border: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  iconBg: string
}> = {
  default: {
    accent: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-600',
    icon: Info,
    iconBg: 'bg-slate-100 dark:bg-slate-700',
  },
  success: {
    accent: 'text-green-600 dark:text-green-400',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-green-400/50 dark:border-green-600/50',
    icon: CheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/50',
  },
  warning: {
    accent: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-yellow-400/50 dark:border-yellow-600/50',
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
  },
  error: {
    accent: 'text-red-600 dark:text-red-400',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-red-400/50 dark:border-red-600/50',
    icon: AlertCircle,
    iconBg: 'bg-red-100 dark:bg-red-900/50',
  },
  info: {
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-white dark:bg-slate-800 dark:text-slate-200',
    border: 'border-blue-400/50 dark:border-blue-600/50',
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
} as const
