'use client'

import { cn } from '@/utils'
import { Activity, memo, useMemo } from 'react'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { KeepAlive } from '../../KeepAlive'
import type { TabsContentProps } from '../types'

/**
 * Tabs 内容区域，具备懒加载、动画切换、缓存等功能
 */
function InnerTabsContent({
  className,
  style,
  items,
  activeValue,
  mode = 'suspense',
  duration = 0.4,
  itemClassName,
  itemStyle,
  suspenseModeForceRender = false,
  ...rest
}: TabsContentProps) {
  const activeIndex = useMemo(() => {
    if (!activeValue) return 0
    const index = items.findIndex((item) => item.value === activeValue)
    return index === -1
      ? 0
      : index
  }, [activeValue, items])

  return (
    <div
      className={ cn('relative w-full h-full min-h-0 overflow-hidden', className) }
      style={ style }
      { ...rest }
    >
      <div
        className="flex w-full h-full transition-transform will-change-transform"
        style={ {
          transform: `translateX(-${activeIndex * 100}%)`,
          transitionDuration: `${duration}s`,
          transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        } }
      >
        { items.map((item) => {
          const isActive = item.value === activeValue
          const props = {
            key: item.key ?? item.value,
            className: cn('size-full shrink-0', itemClassName),
            style: itemStyle,
            role: 'tabpanel',
            id: item.panelId,
            'aria-labelledby': item.tabId,
            [DATA_ATTR.tabs.active]: isActive,
            [DATA_ATTR.selected]: isActive,
            'aria-hidden': !isActive,
            inert: !isActive,
          }

          if (mode === 'suspense') {
            return (
              <div { ...props } key={ item.value }>
                <KeepAlive
                  active={ isActive }
                  uniqueKey={ item.value }
                  forceRender={ suspenseModeForceRender }
                >
                  { item.children }
                </KeepAlive>
              </div>
            )
          }
          else if (mode === 'activity') {
            return (
              <div { ...props } key={ item.value }>
                <Activity
                  mode={ isActive
                    ? 'visible'
                    : 'hidden' }
                >
                  { item.children }
                </Activity>
              </div>
            )
          }

          return (
            <div { ...props } key={ item.value }>
              { isActive && item.children }
            </div>
          )
        }) }
      </div>
    </div>
  )
}

InnerTabsContent.displayName = 'Tabs.Content'

const MemoizedTabsContent = memo(InnerTabsContent)
export function TabsContent(props: TabsContentProps) {
  return <MemoizedTabsContent { ...props } />
}
