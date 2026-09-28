import { cn } from '@/utils'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { memo } from 'react'

export interface TipButtonProps {
  /** 按钮内容 */
  children: ReactNode
  /** 点击事件处理函数 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** 是否显示呼吸光环动画 */
  showPulse?: boolean
  /** 是否显示右上角红点提示 */
  showBadge?: boolean
  /** 自定义按钮类名 */
  className?: string
  /** 自定义按钮样式 */
  style?: React.CSSProperties
  /** 光环动画颜色（rgba格式） */
  pulseColor?: string
  /** 按钮变体颜色 */
  variant?: 'default' | 'blue' | 'red' | 'green' | 'purple'
  /**
   * 原生 button 的 type，避免在表单中默认触发提交
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'
  /** 是否禁用 */
  disabled?: boolean
  /** 右上角红点提示的自定义类名 */
  badgeClassName?: string
}

export const TipButton = memo(({
  children,
  onClick,
  showPulse = true,
  showBadge = true,
  className = '',
  style,
  pulseColor,
  variant = 'default',
  type = 'button',
  disabled = false,
  badgeClassName,
}: TipButtonProps) => {
  /** 根据变体设置不同的颜色样式 */
  const variantStyles = {
    default: {
      button:
        'border-border2 bg-background/80 text-systemBlue hover:bg-background2 dark:border-border dark:bg-background2/80 dark:text-systemBlue dark:hover:bg-background3',
      pulse: pulseColor || 'rgb(var(--systemBlue) / 0.15)',
      badge: 'bg-danger',
    },
    blue: {
      button:
        'border-border2 bg-background/80 text-systemBlue hover:bg-background2 dark:border-border dark:bg-background2/80 dark:text-systemBlue dark:hover:bg-background3',
      pulse: pulseColor || 'rgb(var(--systemBlue) / 0.15)',
      badge: 'bg-danger',
    },
    red: {
      button:
        'border-danger/20 bg-dangerBg/50 text-danger hover:bg-dangerBg dark:border-danger/30 dark:bg-dangerBg/30 dark:text-danger dark:hover:bg-dangerBg/50',
      pulse: pulseColor || 'rgb(var(--systemRed) / 0.15)',
      badge: 'bg-systemBlue',
    },
    green: {
      button:
        'border-success/20 bg-successBg/50 text-success hover:bg-successBg dark:border-success/30 dark:bg-successBg/30 dark:text-success dark:hover:bg-successBg/50',
      pulse: pulseColor || 'rgb(var(--systemGreen) / 0.15)',
      badge: 'bg-danger',
    },
    purple: {
      button:
        'border-systemPurple/20 bg-systemPurple/10 text-systemPurple hover:bg-systemPurple/20 dark:border-systemPurple/30 dark:bg-systemPurple/20 dark:text-systemPurple dark:hover:bg-systemPurple/30',
      pulse: pulseColor || 'rgb(var(--systemPurple) / 0.15)',
      badge: 'bg-systemYellow',
    },
  }

  const currentStyle = variantStyles[variant]

  return (
    <motion.div
      whileHover={ { scale: 1.02 } }
      whileTap={ { scale: 0.98 } }
      className="relative"
      style={ style }
    >
      { showPulse && (
        <motion.div
          animate={ {
            boxShadow: [
              `0 0 0 0 rgb(var(--systemBlue) / 0)`,
              `0 0 0 2px rgb(var(--systemBlue) / 0.05)`,
              `0 0 0 4px rgb(var(--systemBlue) / 0.1)`,
              `0 0 0 6px ${currentStyle.pulse}`,
              `0 0 0 4px rgb(var(--systemBlue) / 0.1)`,
              `0 0 0 2px rgb(var(--systemBlue) / 0.05)`,
              `0 0 0 0 rgb(var(--systemBlue) / 0)`,
            ],
          } }
          transition={ {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'mirror',
            times: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1],
          } }
          className="rounded-full"
        >
          <button
            type={ type }
            disabled={ disabled }
            onClick={ onClick }
            className={ cn(
              'group flex items-center relative gap-2 overflow-hidden border rounded-full px-4 py-2 backdrop-blur-xs transition-all cursor-pointer',
              currentStyle.button,
              className,
            ) }
          >
            { children }
          </button>
        </motion.div>
      ) }

      { !showPulse && (
        <button
          type={ type }
          disabled={ disabled }
          onClick={ onClick }
          className={ cn(
            'group relative flex gap-2 overflow-hidden border rounded-full px-4 py-2 backdrop-blur-xs transition-all cursor-pointer',
            currentStyle.button,
            className,
          ) }
        >
          { children }
        </button>
      ) }

      { showBadge && (
        <motion.div
          className={ cn(
            'absolute h-2 w-2 rounded-full -right-1 -top-1',
            currentStyle.badge,
            badgeClassName,
          ) }
          animate={ {
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          } }
          transition={ {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'mirror',
          } }
        />
      ) }
    </motion.div>
  )
})

TipButton.displayName = 'TipButton'
