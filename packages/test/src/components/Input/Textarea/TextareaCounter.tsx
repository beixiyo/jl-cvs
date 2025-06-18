import { memo } from 'react'
import { cn } from '@/utils'
import { useTextarea } from './TextareaContext'

export interface TextareaCounterProps {
  /**
   * 计数器文本对齐方式
   * @default 'right'
   */
  position?: 'left' | 'right'
  /**
   * 类名
   */
  className?: string
  /**
   * 自定义显示文本格式，接受当前字数和最大字数作为参数
   */
  format?: (current: number, max?: number) => React.ReactNode
}

export const TextareaCounter = memo<TextareaCounterProps>(
  ({ position = 'right', className, format }) => {
    const { value, maxLength } = useTextarea()
    const count = value.length

    const isNearLimit = maxLength && count > maxLength * 0.8 && count < maxLength
    const isAtLimit = maxLength && count >= maxLength

    const defaultFormat = (current: number, max?: number) => {
      return max
        ? `${current}/${max}`
        : current
    }

    return (
      <div
        className={ cn(
          'text-xs',
          {
            'text-slate-400': !isNearLimit && !isAtLimit,
            'text-amber-500': isNearLimit,
            'text-rose-500': isAtLimit,
            'text-right': position === 'right',
            'text-left': position === 'left',
          },
          className,
        ) }
      >
        { format
          ? format(count, maxLength)
          : defaultFormat(count, maxLength) }
      </div>
    )
  },
)

TextareaCounter.displayName = 'TextareaCounter'
