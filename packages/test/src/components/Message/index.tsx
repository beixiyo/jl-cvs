import type { MessageProps, MessageRef, MessageType } from './types'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from '@/utils'
import { DURATION, variantStyles } from './constants'
import { extendMessage } from './extendMessage'

const InnerMessage = forwardRef<MessageRef, MessageProps>((props, ref) => {
  const {
    className,
    style,
    variant = 'default',
    content,
    icon,
    showClose = false,
    duration = DURATION,
    onClose,
    onShow,
    zIndex = 50,
  } = props

  const [visible, setVisible] = useState(true)
  const timerRef = useRef<NodeJS.Timeout>()

  const styles = variantStyles[variant]
  const Icon = icon || styles.icon

  useImperativeHandle(ref, () => ({
    hide: () => {
      setVisible(false)
    },
  }))

  useEffect(() => {
    onShow?.()

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false)
      }, duration)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [duration, onShow])

  const handleClose = () => {
    setVisible(false)
    onClose?.()
  }

  return (
    <AnimatePresence>
      { visible && (
        <motion.div
          initial={ { opacity: 0, y: -20, scale: 0.95 } }
          animate={ { opacity: 1, y: 0, scale: 1 } }
          exit={ { opacity: 0, y: -20, scale: 0.95 } }
          transition={ { duration: 0.3, ease: 'easeOut' } }
          style={ { zIndex, ...style } }
          className={ cn(
            'fixed left-1/2 top-4 -translate-x-1/2',
            'flex items-center gap-3 px-4 py-3',
            'rounded-lg shadow-lg',
            styles.bg,
            className,
          ) }
        >
          <div className={ cn(
            'flex size-5 items-center justify-center rounded-full',
            styles.iconBg,
            variant === 'loading' && 'animate-spin',
          ) }>
            <Icon className={ cn(
              'size-full',
              styles.accent,
              variant === 'loading' && 'size-4',
            ) } />
          </div>
          <div className={ cn('text-sm', styles.accent) }>{ content }</div>
          { showClose && (
            <button
              onClick={ handleClose }
              className={ cn(
                'ml-2 flex h-5 w-5 items-center justify-center rounded-full',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'transition-colors',
              ) }
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          ) }
        </motion.div>
      ) }
    </AnimatePresence>
  )
})

export const Message = memo(InnerMessage) as unknown as MessageType<typeof InnerMessage>
Message.displayName = 'Message'

extendMessage()
