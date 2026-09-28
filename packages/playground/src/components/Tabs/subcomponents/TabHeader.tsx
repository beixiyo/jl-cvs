import { cn } from '@/utils'
import { motion } from 'motion/react'
import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { memo } from 'react'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import type { TabItemType } from '../types'

function InnerTabHeader<T extends string>(
  {
    style,
    className,
    headerId,
    item,
    active,
    dataId,
    activeClassName,
    inactiveClassName,
    colors = ['rgb(var(--systemBlue) / 1)', 'rgb(var(--systemPurple) / 1)'],
    ...rest
  }: TabHeaderProps<T>,
) {
  if (item.header) {
    return item.header(item)
  }

  return (
    <button
      type="button"
      className={ cn(
        'px-4 py-2 cursor-pointer transition-all duration-300 relative shrink-0',
        active
          ? activeClassName
          : inactiveClassName,
        className,
      ) }
      style={ style }
      { ...rest }
      { ...{ [DATA_ATTR.selected]: active } }
      { ...{ [DATA_ATTR.tabs.id]: dataId ?? '' } }
    >
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        { item.icon }
        <span>{ item.label }</span>
      </div>

      { active && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 w-full"
          layoutId={ headerId }
          style={ {
            background: colors.length > 1
              ? `linear-gradient(to right, ${colors.join(', ')})`
              : colors[0],
          } }
          transition={ {
            type: 'spring',
            stiffness: 500,
            damping: 30,
          } }
        />
      ) }
    </button>
  )
}

InnerTabHeader.displayName = 'TabHeader'
export const TabHeader = memo(InnerTabHeader) as typeof InnerTabHeader

/**
 * Tabs Header 属性
 * @default {}
 */
export type TabHeaderProps<T extends string> =
  & {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode
    headerId?: string

    active: boolean
    item: TabItemType<T>
    dataId?: string
    activeClassName?: string
    /** 非活跃标签的类名 */
    inactiveClassName?: string
    /** 底部横条的渐变色数组 */
    colors?: string[]
  }
  & ButtonHTMLAttributes<HTMLButtonElement>
