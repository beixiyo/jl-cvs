'use client'

import { cn } from '@/utils'
import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useRef } from 'react'
import { INTERNAL_DATA_ATTR } from '../../../constants/dataAttributes'
import type { DropdownItem, DropdownVirtualOptions } from '../types'

/**
 * 分区内的虚拟列表（基于 TanStack Virtual，动态高度自动测量）
 *
 * 仅负责虚拟化渲染，项的内容与样式完全由父级通过 renderRow / getRowClassName 注入
 * 项的间距必须用 padding 而非 margin，否则测量高度会偏小导致滚动漂移
 */
export const VirtualItemList = memo<VirtualItemListProps>((props) => {
  const {
    items,
    maxHeight,
    estimateSize,
    overscan,
    useCachedMeasurements,
    getRowClassName,
    renderRow,
    onItemClick,
    getRowProps,
  } = props

  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    useCachedMeasurements,
    /** id 缺失/重复时回退到 index，避免 TanStack 因 key 冲突导致测量与定位错乱 */
    getItemKey: (index) => items[index].id ?? index,
  })

  return (
    <div
      ref={ scrollRef }
      className="overflow-y-auto"
      style={ { maxHeight } }
    >
      <div
        className="relative w-full"
        style={ { height: virtualizer.getTotalSize() } }
      >
        { virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index]

          return (
            <div
              key={ virtualRow.key }
              data-index={ virtualRow.index }
              { ...{ [INTERNAL_DATA_ATTR.virtual.itemIndex]: virtualRow.index } }
              ref={ virtualizer.measureElement }
              className={ cn('absolute left-0 top-0 w-full', getRowClassName(item)) }
              style={ { transform: `translateY(${virtualRow.start}px)` } }
              { ...getRowProps?.(item) }
              onClick={ () => onItemClick?.(item.id) }
            >
              { renderRow(item) }
            </div>
          )
        }) }
      </div>
    </div>
  )
})

VirtualItemList.displayName = 'VirtualItemList'

export type VirtualItemListProps = {
  items: DropdownItem[]
  /** 滚动容器高度，虚拟化必须有定高容器 */
  maxHeight: string
  /** 项的容器类名（选中态、hover 等样式） */
  getRowClassName: (item: DropdownItem) => string
  /** 项的内容渲染 */
  renderRow: (item: DropdownItem) => React.ReactNode
  onItemClick?: (id: string) => void
  getRowProps?: (item: DropdownItem) => React.HTMLAttributes<HTMLDivElement>
} & Required<DropdownVirtualOptions>
