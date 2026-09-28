import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'

export const DURATION = 3000

/**
 * 堆叠布局相关常量（需与 MessageContainer 的 className 保持一致）
 *
 * - `STACK_TOP_OFFSET`：容器距顶部距离，对应 `top-16`
 * - `STACK_GAP`：相邻消息间距，对应 `gap-3`
 * - `STACK_BOTTOM_MARGIN`：堆叠到底部时预留的安全边距
 */
export const STACK_TOP_OFFSET = 64
export const STACK_GAP = 12
export const STACK_BOTTOM_MARGIN = 16

export const variantStyles = {
  default: {
    accent: 'text-text2',
    bg: 'bg-background text-text',
    icon: Info,
    iconBg: 'bg-background2',
  },
  success: {
    accent: 'text-success',
    bg: 'bg-background text-text',
    icon: CheckCircle,
    iconBg: 'bg-successBg',
  },
  warning: {
    accent: 'text-warning',
    bg: 'bg-background text-text',
    icon: AlertTriangle,
    iconBg: 'bg-warningBg',
  },
  danger: {
    accent: 'text-danger',
    bg: 'bg-background text-text',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  error: {
    accent: 'text-danger',
    bg: 'bg-background text-text',
    icon: AlertCircle,
    iconBg: 'bg-dangerBg',
  },
  info: {
    accent: 'text-info',
    bg: 'bg-background text-text',
    icon: Info,
    iconBg: 'bg-infoBg',
  },
  loading: {
    accent: 'text-background',
    bg: 'bg-text/70',
    icon: Loader2,
    iconBg: '',
  },
  neutral: {
    accent: 'text-background',
    bg: 'bg-text/70',
    icon: Loader2,
    iconBg: '',
  },
} as const
