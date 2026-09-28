import { cn } from '@/utils'
import { motion } from 'motion/react'
import { memo } from 'react'
import { Skeleton } from '..'
import type { SkeletonCardProps } from '../types'

/**
 * 骨架屏卡片组件
 * 用于展示卡片类型的骨架屏效果
 */
export const SkeletonCard = memo<SkeletonCardProps>((props) => {
  const {
    className,
    style,
    delay = 0,
    showTitle = true,
    showContent = true,
    showTags = true,
    titleWidth = 'w-3/4',
    contentLines = 3,
    tagCount = 2,
    ...rest
  } = props

  return (
    <motion.div
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.4, delay } }
      className={ cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-background2 p-4',
        className,
      ) }
      style={ style }
      { ...rest }
    >
      { /* 标题骨架 */ }
      { showTitle && <Skeleton className={ cn('h-5', titleWidth) } /> }

      { /* 内容骨架 */ }
      { showContent && (
        <div className="space-y-2">
          { Array.from({ length: contentLines }, (_, index) => {
            const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/5', 'w-2/3']
            return (
              <Skeleton
                key={ index }
                className={ cn('h-3', widths[index] || 'w-1/2') }
              />
            )
          }) }
        </div>
      ) }

      { /* 标签骨架 */ }
      { showTags && (
        <div className="flex gap-2">
          { Array.from({ length: tagCount }, (_, index) => (
            <Skeleton
              key={ index }
              className={ cn(
                'h-5 rounded-full',
                index === 0
                  ? 'w-16'
                  : 'w-20',
              ) }
            />
          )) }
        </div>
      ) }
    </motion.div>
  )
})

SkeletonCard.displayName = 'SkeletonCard'
