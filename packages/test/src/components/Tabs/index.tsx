import type { CSSProperties } from 'react'
import { cn } from '@/utils'
import { memo } from 'react'
import { TabHeader } from './TabHeader'
import { TabItem } from './TabItem'

function InnerTabs<T extends string>(
  {
    style,
    className,
    headerClass,
    headerWrapClass,
    headerStyle,

    tabHeight = 30,
    items,
    activeKey,
    onChange,

    dataId,
  }: TabsProps<T>
) {
  return <div
    className={ cn(
      'size-full',
      className,
    ) }
    style={ style }
  >

    <div
      className={ `flex w-full items-center rounded-md ${headerWrapClass}` }
      style={ {
        height: tabHeight,
        ...headerStyle,
      } }
    >
      { items.map(item => (
        <TabHeader
          key={ item.value }
          onClick={ () => onChange?.(item) }
          item={ item }
          active={ item.active || activeKey === item.value }
          className={ headerClass }
          dataId={ dataId }
        />
      ),
      ) }
    </div>

    { items.map((item, index) => (
      <TabItem
        key={ index }
        item={ item }
        active={ item.active || activeKey === item.value }
        style={ {
          height: `calc(100% - ${tabHeight}px)`,
        } }
        className="size-full"
      />
    ),
    ) }

  </div>
}

export const Tabs = memo(InnerTabs) as typeof InnerTabs
InnerTabs.displayName = 'Tabs'

export interface TabsProps<T extends string> {
  className?: string
  style?: CSSProperties
  headerClass?: string
  headerWrapClass?: string
  headerStyle?: CSSProperties

  tabHeight?: number
  items: TabItemType<T>[]
  activeKey?: T
  onChange?: (item: TabItemType<T>) => void

  dataId?: string
}

export interface TabItemType<T extends string> {
  value: T

  /** 指定为激活状态 */
  active?: boolean
  children?: React.ReactNode
  header?: (item: Omit<TabItemType<T>, 'header'>) => React.ReactNode
}
