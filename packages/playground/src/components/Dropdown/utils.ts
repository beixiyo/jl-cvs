import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { DropdownItem, DropdownProps, DropdownSection, DropdownVirtualOptions } from './types'

export function normalizeSections(items: DropdownProps['items']): DropdownSection[] {
  return Array.isArray(items)
    ? items
    : Object.entries(items).map(([name, items]) => ({ name, items }))
}

export function getDesiredExpandedSections(normalizedSections: DropdownSection[], defaultExpanded: string[], accordion: boolean): Record<string, boolean> {
  const desired: Record<string, boolean> = {}

  if (accordion) {
    const firstMatchingSection = normalizedSections.find((section) => defaultExpanded.includes(section.name))?.name

    normalizedSections.forEach((section) => {
      desired[section.name] = section.name === firstMatchingSection
    })

    return desired
  }

  normalizedSections.forEach((section) => {
    desired[section.name] = defaultExpanded.includes(section.name)
  })

  return desired
}

export function getPreviewMeta(items: DropdownItem[], selectedId: DropdownProps['selectedId'], collapsedPreview: boolean, maxLayers: 1 | 2 | 3) {
  if (items.length === 0) {
    return {
      previewItem: null as DropdownItem | null,
      previewItems: [] as DropdownItem[],
      previewItemIds: new Set<string>(),
      previewOrderedItems: items,
    }
  }

  const previewItem = selectedId
    ? items.find((item) => item.id === selectedId) ?? items[0]
    : items[0]

  const previewOrderedItems = (collapsedPreview && previewItem && items[0]?.id !== previewItem.id)
    ? [previewItem, ...items.filter((item) => item.id !== previewItem.id)]
    : items

  const previewItems = previewOrderedItems.slice(0, Math.min(maxLayers, previewOrderedItems.length))
  const previewItemIds = new Set(previewItems.map((item) => item.id))

  return {
    previewItem,
    previewItems,
    previewItemIds,
    previewOrderedItems,
  }
}

export function resolveSectionMaxHeight(section: DropdownSection, sectionMaxHeight: DropdownProps['sectionMaxHeight']): string | undefined {
  if (section.maxHeight !== undefined) {
    return typeof section.maxHeight === 'number'
      ? `${section.maxHeight}px`
      : section.maxHeight
  }

  if (!sectionMaxHeight) {
    return undefined
  }

  if (typeof sectionMaxHeight === 'string' || typeof sectionMaxHeight === 'number') {
    return typeof sectionMaxHeight === 'number'
      ? `${sectionMaxHeight}px`
      : sectionMaxHeight
  }

  const height = sectionMaxHeight[section.name]
  if (height !== undefined) {
    return typeof height === 'number'
      ? `${height}px`
      : height
  }

  return undefined
}

/**
 * 解析分区的虚拟滚动配置，未启用时返回 null
 * 分区级配置优先于全局配置
 */
export function resolveVirtualOptions(
  section: DropdownSection,
  virtual: DropdownProps['virtual'],
): Required<DropdownVirtualOptions> | null {
  const raw = section.virtual ?? virtual
  if (!raw) {
    return null
  }

  const options = typeof raw === 'boolean'
    ? {}
    : raw

  return {
    estimateSize: options.estimateSize ?? 64,
    overscan: options.overscan ?? 5,
    useCachedMeasurements: options.useCachedMeasurements ?? false,
  }
}

export function resolveCollapsedContent(section: DropdownSection, renderCollapsedContent: DropdownProps['renderCollapsedContent'] | undefined) {
  const content = section.collapsedPreviewContent ?? (renderCollapsedContent
    ? renderCollapsedContent(section)
    : null)
  if (!content) return []

  const normalized = Array.isArray(content)
    ? content
    : [content]

  return normalized.filter((item) => item !== null && item !== undefined && item !== false)
}

/** 判断键盘事件是否来自项目内部的原生交互控件，避免自定义内容被父项目重复激活 */
export function isNestedDropdownInteractiveTarget(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.target === event.currentTarget) return false

  const target = event.target as HTMLElement | null
  const interactive = target?.closest('a, button, input, select, textarea, [contenteditable="true"]')
  return !!interactive && interactive !== event.currentTarget
}

/** 为默认项目和虚拟项目复用 Enter / Space 激活语义 */
export function handleDropdownItemKeyDown(
  event: ReactKeyboardEvent<HTMLElement>,
  onActivate: () => void,
) {
  if (isNestedDropdownInteractiveTarget(event)) return
  if (event.key !== 'Enter' && event.key !== ' ') return

  event.preventDefault()
  onActivate()
}
