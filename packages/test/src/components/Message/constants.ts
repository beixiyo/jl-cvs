import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'

export const DURATION = 2000

export const variantStyles = {
  default: {
    accent: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-white dark:bg-slate-800',
    icon: Info,
    iconBg: 'bg-slate-100 dark:bg-slate-700',
  },
  success: {
    accent: 'text-green-600 dark:text-green-400',
    bg: 'bg-white dark:bg-slate-800',
    icon: CheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
  },
  warning: {
    accent: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-white dark:bg-slate-800',
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  error: {
    accent: 'text-red-600 dark:text-red-400',
    bg: 'bg-white dark:bg-slate-800',
    icon: AlertCircle,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
  },
  info: {
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-white dark:bg-slate-800',
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  loading: {
    accent: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-white dark:bg-slate-800',
    icon: Loader2,
    iconBg: 'bg-slate-100 dark:bg-slate-700',
  },
} as const
