import type { CSSProperties } from 'react'
import type { TabItemType } from './index'
import { vShow } from '@/hooks'
import { cn } from '@/utils'
import { memo } from 'react'
import { KeepAlive } from '../KeepAlive'

function InnerTabItem<T extends string>(
  {
    style,
    className,
    item,
    active,
  }: TabItemProps<T>
) {
  return <div
    className={ cn(className) }
    style={ {
      ...vShow(active, { visibility: true }),
      ...style,
    } }
  >
    <KeepAlive active={ active }>
      { item.children }
    </KeepAlive>
  </div>
}

InnerTabItem.displayName = 'InnerTabItem'
export const TabItem = memo(InnerTabItem) as typeof InnerTabItem


export interface TabItemProps<T extends string> {
  className?: string
  style?: CSSProperties

  item: TabItemType<T>
  active: boolean
}
