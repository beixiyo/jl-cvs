'use client'

import { useLatestCallback } from '@/hooks'
import { cn } from '@/utils'
import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { isValidElement, memo } from 'react'
import { AnimateShow } from '../../Animate'
import { StackedCards } from '../../Card'
import type { DropdownItem, DropdownProps, DropdownSection as DropdownSectionType } from '../types'
import { getPreviewMeta, handleDropdownItemKeyDown, resolveCollapsedContent, resolveSectionMaxHeight, resolveVirtualOptions } from '../utils'
import { VirtualItemList } from './VirtualItemList'

export const DropdownSection = memo<DropdownSectionProps>(({
  section,
  sectionLayoutId,
  expanded,
  onToggle,

  selectedId,
  onClick,
  renderItem,

  itemClassName,
  sectionHeaderClassName,
  itemTitleClassName,
  itemDescClassName,
  itemActiveClassName,
  itemInactiveClassName,

  sectionMaxHeight,
  collapsedPreview,
  normalizedCollapsedLayers,
  collapsedPreviewClickable,
  collapsedPreviewClassName,
  renderCollapsedItem,
  renderCollapsedContent,
  collapsedStackedCards,
  virtual,
}) => {
  const maxHeight = resolveSectionMaxHeight(section, sectionMaxHeight)
  const virtualOptions = resolveVirtualOptions(section, virtual)

  /** 不可折叠的分区恒展开：点击头部无效，默认头部也不画箭头 */
  const collapsible = section.collapsible !== false
  const isExpanded = collapsible
    ? expanded
    : true
  const handleToggle = collapsible
    ? onToggle
    : undefined
  const sectionHeaderId = `${sectionLayoutId}-header`
  const sectionContentId = `${sectionLayoutId}-content`

  /** 渲染期直接派生，不能用只保证事件期读到最新值的 useLatestCallback 包装 */
  const getItemInteractionProps = (item: DropdownItem) => ({
    role: onClick
      ? 'button' as const
      : undefined,
    tabIndex: onClick
      ? 0
      : undefined,
    'aria-current': selectedId === item.id
      ? 'true' as const
      : undefined,
    onKeyDown: onClick
      ? (event: ReactKeyboardEvent<HTMLDivElement>) => {
        handleDropdownItemKeyDown(event, () => onClick(item.id))
      }
      : undefined,
  })

  const handleHeaderKeyDown = useLatestCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (handleToggle) handleDropdownItemKeyDown(event, handleToggle)
  })

  const handlePreviewKeyDown = useLatestCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (handleToggle && collapsedPreviewClickable) handleDropdownItemKeyDown(event, handleToggle)
  })

  const defaultRenderItem = (item: DropdownItem) => (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          { item.label && (
            <h3 className={ cn('truncate text-sm font-medium text-text', itemTitleClassName) }>
              { item.label }
            </h3>
          ) }
          { item.timestamp && (
            <span className="text-xs text-text3">
              { new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }) }
            </span>
          ) }
        </div>

        <div className="mt-1 flex items-center gap-2">
          { item.tag && (
            <span
              className={ cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                item.tagColor || 'bg-background2/70 text-text2 border border-border/60',
              ) }
            >
              { item.tag }
            </span>
          ) }
          { item.desc && (
            <p className={ cn('truncate text-sm text-text2', itemDescClassName) }>
              { item.desc }
            </p>
          ) }
        </div>
      </div>
    </div>
  )

  /** 这些函数在渲染期执行，必须读取当前 render 的 props 与选中状态 */
  const renderDropdownItem = (item: DropdownItem) => {
    if (item.customContent) return item.customContent
    if (renderItem) return renderItem(item)
    return defaultRenderItem(item)
  }

  const getItemClassName = (item: DropdownItem) =>
    cn(
      'px-4 py-3 cursor-pointer border-l-4 transition-all duration-300',
      selectedId === item.id
        ? ['bg-brand/10 border-brand', itemActiveClassName]
        : ['border-transparent hover:bg-background2/50 hover:border-border', itemInactiveClassName],
    )

  const defaultHeaderClassName = cn(
    'w-full flex items-center justify-between border-0 bg-transparent px-4 py-3 text-left text-sm text-text2 transition-all duration-300',
    collapsible && 'cursor-pointer hover:opacity-50',
  )

  const defaultHeaderContent = (
    <>
      <span className={ sectionHeaderClassName }>{ section.name }</span>
      { collapsible && (
        <motion.div
          animate={ {
            rotate: isExpanded
              ? 180
              : 0,
          } }
          transition={ { duration: 0.2 } }
        >
          <ChevronDown className="h-4 w-4 text-text3" />
        </motion.div>
      ) }
    </>
  )

  const rawItems = Array.isArray(section.items)
    ? section.items
    : []

  const previewMeta = getPreviewMeta(rawItems, selectedId, collapsedPreview, normalizedCollapsedLayers)
  const previewItemIds = previewMeta.previewItemIds

  const collapsedItems = Array.isArray(section.items)
    ? (section.collapsedPreviewItems ?? section.items)
    : (section.collapsedPreviewItems ?? [])

  const collapsedMeta = getPreviewMeta(collapsedItems, selectedId, collapsedPreview, normalizedCollapsedLayers)
  const previewItems = collapsedMeta.previewItems

  const overrideContent = resolveCollapsedContent(section, renderCollapsedContent)
  const previewLayersContent = overrideContent.length > 0
    ? overrideContent.slice(0, normalizedCollapsedLayers)
    : (previewItems.length > 0
      ? previewItems.map((previewRow, index) => {
        const isTopLayer = index === 0

        return (
          <motion.div
            key={ previewRow.id }
            layout
            layoutId={ `${sectionLayoutId}-${previewRow.id}` }
            className={ cn(
              getItemClassName(previewRow),
              !isTopLayer && 'opacity-0',
            ) }
          >
            { renderCollapsedItem
              ? renderCollapsedItem(previewRow)
              : renderDropdownItem(previewRow) }
          </motion.div>
        )
      })
      : [])

  const previewLayers = previewLayersContent.length

  const content = isValidElement(section.items)
    ? section.items
    : rawItems.length > 0
    ? rawItems.map((rowItem) => {
      const isBoundLayer = collapsedPreview && isExpanded && previewItemIds.has(rowItem.id)
      const layoutId = isBoundLayer
        ? `${sectionLayoutId}-${rowItem.id}`
        : undefined
      const initial = isBoundLayer
        ? false
        : (collapsedPreview
          ? { y: 12, opacity: 0 }
          : { x: -20, opacity: 0 })
      const animate = isBoundLayer
        ? { opacity: 1 }
        : (collapsedPreview
          ? { y: 0, opacity: 1 }
          : { x: 0, opacity: 1 })
      const exit = collapsedPreview
        ? { y: 12, opacity: 0 }
        : { x: -20, opacity: 0 }

      return (
        <motion.div
          key={ rowItem.id }
          { ...getItemInteractionProps(rowItem) }
          layout={ collapsedPreview }
          layoutId={ layoutId }
          initial={ initial }
          animate={ animate }
          exit={ exit }
          transition={ { duration: 0.2 } }
          className={ getItemClassName(rowItem) }
          onClick={ () => onClick?.(rowItem.id) }
        >
          { renderDropdownItem(rowItem) }
        </motion.div>
      )
    })
    : null

  return (
    <div className={ itemClassName }>
      { section.header
        ? (
          <div
            id={ sectionHeaderId }
            role={ collapsible
              ? 'button'
              : undefined }
            tabIndex={ collapsible
              ? 0
              : undefined }
            aria-expanded={ collapsible
              ? isExpanded
              : undefined }
            aria-controls={ collapsible
              ? sectionContentId
              : undefined }
            onClick={ handleToggle }
            onKeyDown={ collapsible
              ? handleHeaderKeyDown
              : undefined }
          >
            { typeof section.header === 'function'
              ? section.header(isExpanded)
              : section.header }
          </div>
        )
        : collapsible
        ? (
          <button
            type="button"
            id={ sectionHeaderId }
            aria-expanded={ isExpanded }
            aria-controls={ sectionContentId }
            onClick={ handleToggle }
            onKeyDown={ handleHeaderKeyDown }
            className={ defaultHeaderClassName }
          >
            { defaultHeaderContent }
          </button>
        )
        : (
          <div
            id={ sectionHeaderId }
            className={ defaultHeaderClassName }
          >
            { defaultHeaderContent }
          </div>
        ) }

      { collapsedPreview && (
        <AnimateShow
          show={ !isExpanded }
          className={ cn('', collapsedPreviewClassName) }
        >
          { previewLayers > 0 && (
            <div
              role={ collapsedPreviewClickable && collapsible
                ? 'button'
                : undefined }
              tabIndex={ collapsedPreviewClickable && collapsible
                ? 0
                : undefined }
              aria-expanded={ collapsedPreviewClickable && collapsible
                ? isExpanded
                : undefined }
              aria-controls={ collapsedPreviewClickable && collapsible
                ? sectionContentId
                : undefined }
              onClick={ () => {
                if (collapsedPreviewClickable) handleToggle?.()
              } }
              onKeyDown={ collapsedPreviewClickable && collapsible
                ? handlePreviewKeyDown
                : undefined }
              className={ cn(
                collapsedPreviewClickable && collapsible && 'cursor-pointer',
              ) }
            >
              <StackedCards
                { ...collapsedStackedCards }
                autoHeight
                layers={ previewLayers as 1 | 2 | 3 }
                layersContent={ previewLayersContent }
              />
            </div>
          ) }
        </AnimateShow>
      ) }

      <AnimateShow
        id={ sectionContentId }
        role={ collapsible
          ? 'region'
          : undefined }
        aria-labelledby={ collapsible
          ? sectionHeaderId
          : undefined }
        aria-hidden={ !isExpanded }
        show={ isExpanded }
        className="overflow-hidden"
        visibilityMode
      >
        { virtualOptions && maxHeight && rawItems.length > 0
          ? (
            <VirtualItemList
              items={ rawItems }
              maxHeight={ maxHeight }
              getRowClassName={ getItemClassName }
              renderRow={ renderDropdownItem }
              onItemClick={ onClick }
              getRowProps={ getItemInteractionProps }
              { ...virtualOptions }
            />
          )
          : !maxHeight
          ? content
          : isValidElement(section.items)
          ? (
            <div style={ { height: maxHeight } }>
              { content }
            </div>
          )
          : (
            <div
              className="overflow-y-auto"
              style={ { maxHeight } }
            >
              { content }
            </div>
          ) }
      </AnimateShow>
    </div>
  )
})

DropdownSection.displayName = 'DropdownSection'

export type DropdownSectionProps = {
  section: DropdownSectionType
  sectionLayoutId: string
  expanded: boolean
  onToggle: () => void

  selectedId: DropdownProps['selectedId']
  onClick: DropdownProps['onClick']
  renderItem: DropdownProps['renderItem']

  itemClassName: DropdownProps['itemClassName']
  sectionHeaderClassName: DropdownProps['sectionHeaderClassName']
  itemTitleClassName: DropdownProps['itemTitleClassName']
  itemDescClassName: DropdownProps['itemDescClassName']
  itemActiveClassName: DropdownProps['itemActiveClassName']
  itemInactiveClassName: DropdownProps['itemInactiveClassName']

  sectionMaxHeight: DropdownProps['sectionMaxHeight']
  collapsedPreview: boolean
  normalizedCollapsedLayers: 1 | 2 | 3
  collapsedPreviewClickable: boolean
  collapsedPreviewClassName: DropdownProps['collapsedPreviewClassName']
  renderCollapsedItem: DropdownProps['renderCollapsedItem']
  renderCollapsedContent: DropdownProps['renderCollapsedContent']
  collapsedStackedCards: DropdownProps['collapsedStackedCards']
  virtual: DropdownProps['virtual']
}
