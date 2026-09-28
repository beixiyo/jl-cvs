import { useLatestCallback } from '@/hooks'
import { cn } from '@/utils'
import { MoreHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useRef } from 'react'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import type { PopoverRef } from '../../Popover'
import { Popover } from '../../Popover'
import type { TabItemType } from '../types'

interface MoreTabsProps<T extends string> {
  items: TabItemType<T>[]
  onChange?: (item: TabItemType<T>) => void
  active: boolean
  activeKey?: T
  headerId: string
  headerClass?: string
  activeClassName?: string
  inactiveClassName?: string
  colors?: string[]
}

function InnerMoreTabs<T extends string>({
  items,
  onChange,
  active,
  activeKey,
  headerId,
  headerClass,
  activeClassName,
  inactiveClassName,
  colors = ['rgb(var(--systemBlue) / 1)', 'rgb(var(--systemPurple) / 1)'],
}: MoreTabsProps<T>) {
  const popoverRef = useRef<PopoverRef>(null)
  const handleChange = useLatestCallback((item: TabItemType<T>) => {
    onChange?.(item)
    popoverRef.current?.close()
  })
  const menu = (
    <div role="menu" className="flex flex-col gap-1">
      { items.map((item) => {
        const isActive = Boolean(item.active || activeKey === item.value)

        return (
          <button
            type="button"
            key={ item.value }
            onClick={ () => handleChange(item) }
            role="menuitemradio"
            aria-checked={ isActive }
            { ...{ [DATA_ATTR.selected]: isActive } }
            className={ cn(
              'flex w-full min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] px-2 text-sm text-text',
              'transition-colors hover:bg-background3',
              isActive && 'bg-background2',
            ) }
          >
            { item.icon }
            { item.label }
          </button>
        )
      }) }
    </div>
  )

  return (
    <Popover
      ref={ popoverRef }
      trigger="click"
      contentClassName="p-2"
      content={ menu }
    >
      <button
        type="button"
        aria-label="More tabs"
        aria-haspopup="menu"
        { ...{ [DATA_ATTR.selected]: active } }
        className={ cn(
          'px-4 py-2 cursor-pointer transition-all duration-300 relative shrink-0',
          active
            ? activeClassName
            : inactiveClassName,
          headerClass,
        ) }
      >
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <MoreHorizontal size={ 16 } />
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
    </Popover>
  )
}

InnerMoreTabs.displayName = 'MoreTabs'
export const MoreTabs = memo(InnerMoreTabs) as typeof InnerMoreTabs
