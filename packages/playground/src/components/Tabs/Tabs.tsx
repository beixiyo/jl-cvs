'use client'

/**
 * Tabs 组件入口
 */
import { useLatestCallback } from '@/hooks'
import { cn } from '@/utils'
import { memo, useId, useMemo } from 'react'
import { MoreTabs } from './subcomponents/MoreTabs'
import { TabHeader } from './subcomponents/TabHeader'
import { TabsContent } from './subcomponents/TabsContent'
import type { TabItemType, TabsProps } from './types'

function InnerTabs<T extends string>(
  {
    style,
    className,
    header,
    headerClass,
    headerWrapClass,
    headerStyle,
    itemClass,
    contentClassName,
    activeClassName,
    inactiveClassName,
    colors,
    headerAfter,
    tabHeight = 56,
    items,
    activeKey,
    onChange,
    mode = 'suspense',
    duration = 0.4,
    dataId,
    maxVisibleTabs,
  }: TabsProps<T>,
) {
  const headerId = useId()
  const isActive = (item: TabItemType<T>) => item.active || activeKey === item.value
  const handleChange = useLatestCallback((item: TabItemType<T>) => {
    onChange?.(item)
  })

  const visibleItems = maxVisibleTabs && items.length > maxVisibleTabs
    ? items.slice(0, maxVisibleTabs)
    : items

  const dropdownItems = maxVisibleTabs && items.length > maxVisibleTabs
    ? items.slice(maxVisibleTabs)
    : []

  const activeItemInDropdown = dropdownItems.some((item) => isActive(item))
  const contentItems = useMemo(
    () =>
      items.map((item, index) => ({
        value: item.value,
        children: item.children,
        tabId: `${headerId}-tab-${index}`,
        panelId: `${headerId}-panel-${index}`,
      })),
    [headerId, items],
  )

  const handleTabKeyDown = useLatestCallback((event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

    event.preventDefault()
    const lastIndex = visibleItems.length - 1
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
      ? lastIndex
      : event.key === 'ArrowRight'
      ? (index + 1) % visibleItems.length
      : (index - 1 + visibleItems.length) % visibleItems.length
    const nextItem = visibleItems[nextIndex]
    if (!nextItem) return

    handleChange(nextItem)
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]')
    tabs?.[nextIndex]?.focus()
  })

  const Header = header || (
    <div
      className={ cn('flex w-full items-center border-b border-border', headerWrapClass) }
      role="tablist"
      style={ {
        height: tabHeight,
        ...headerStyle,
      } }
    >
      { visibleItems.map((item, index) => (
        <TabHeader
          headerId={ headerId }
          key={ item.value }
          onClick={ () => handleChange(item) }
          item={ item }
          active={ isActive(item) }
          id={ `${headerId}-tab-${index}` }
          role="tab"
          aria-selected={ isActive(item) }
          aria-controls={ `${headerId}-panel-${index}` }
          tabIndex={ isActive(item)
            ? 0
            : -1 }
          onKeyDown={ (event) => handleTabKeyDown(event, index) }
          className={ headerClass }
          dataId={ dataId }
          activeClassName={ activeClassName }
          inactiveClassName={ inactiveClassName }
          colors={ colors }
        />
      )) }

      { dropdownItems.length > 0 && (
        <MoreTabs<T>
          items={ dropdownItems }
          onChange={ handleChange }
          active={ activeItemInDropdown }
          activeKey={ activeKey }
          headerId={ headerId }
          headerClass={ headerClass }
          activeClassName={ activeClassName }
          inactiveClassName={ inactiveClassName }
          colors={ colors }
        />
      ) }

      { headerAfter }
    </div>
  )

  return (
    <div
      className={ cn(
        'w-full flex flex-col',
        className,
      ) }
      style={ style }
    >
      { Header }

      <TabsContent
        items={ contentItems }
        activeValue={ activeKey }
        mode={ mode }
        duration={ duration }
        className={ cn('w-full min-h-0', contentClassName) }
        style={ {
          height: `calc(100% - ${tabHeight}px)`,
        } }
        itemClassName={ cn('w-full grow', itemClass) }
      />
    </div>
  )
}

export const Tabs = memo(InnerTabs)
Tabs.displayName = 'Tabs'
