'use client'

import { cn } from '@/utils'
import { LayoutGroup } from 'motion/react'
import { memo, useId, useMemo } from 'react'
import { useExpandedSections } from './hooks/useExpandedSections'
import { DropdownSection } from './subcomponents/DropdownSection'
import type { DropdownProps } from './types'
import { normalizeSections } from './utils'

export const Dropdown = memo<DropdownProps>(({
  items,
  selectedId,
  onClick,
  accordion = true,

  className,
  style,
  itemClassName,
  sectionHeaderClassName,
  itemTitleClassName,
  itemDescClassName,
  itemActiveClassName,
  itemInactiveClassName,

  defaultExpanded = [],
  onExpandedChange,
  renderItem,
  sectionMaxHeight,
  collapsedPreview = false,
  collapsedPreviewClickable = true,
  collapsedPreviewClassName,
  renderCollapsedItem,
  renderCollapsedContent,
  collapsedStackedCards,
  virtual,
}) => {
  const layoutBaseId = useId()

  const normalizedSections = useMemo(() => normalizeSections(items), [items])

  const { expandedSections, toggleSection } = useExpandedSections({
    normalizedSections,
    defaultExpanded,
    accordion,
    onExpandedChange,
  })

  const normalizedCollapsedLayers = Math.min(
    Math.max(collapsedStackedCards?.layers ?? 3, 1),
    3,
  ) as 1 | 2 | 3

  return (
    <div
      className={ cn('overflow-y-auto h-full transition-all duration-300', className) }
      style={ style }
    >
      { normalizedSections.map((section) => {
        const sectionLayoutId = `${layoutBaseId}-${section.name}`

        return (
          <LayoutGroup key={ section.name } id={ sectionLayoutId }>
            <DropdownSection
              section={ section }
              sectionLayoutId={ sectionLayoutId }
              expanded={ expandedSections[section.name] }
              onToggle={ () => toggleSection(section.name) }
              selectedId={ selectedId }
              onClick={ onClick }
              renderItem={ renderItem }
              itemClassName={ itemClassName }
              sectionHeaderClassName={ sectionHeaderClassName }
              itemTitleClassName={ itemTitleClassName }
              itemDescClassName={ itemDescClassName }
              itemActiveClassName={ itemActiveClassName }
              itemInactiveClassName={ itemInactiveClassName }
              sectionMaxHeight={ sectionMaxHeight }
              collapsedPreview={ collapsedPreview }
              normalizedCollapsedLayers={ normalizedCollapsedLayers }
              collapsedPreviewClickable={ collapsedPreviewClickable }
              collapsedPreviewClassName={ collapsedPreviewClassName }
              renderCollapsedItem={ renderCollapsedItem }
              renderCollapsedContent={ renderCollapsedContent }
              collapsedStackedCards={ collapsedStackedCards }
              virtual={ virtual }
            />
          </LayoutGroup>
        )
      }) }
    </div>
  )
})

Dropdown.displayName = 'Dropdown'
