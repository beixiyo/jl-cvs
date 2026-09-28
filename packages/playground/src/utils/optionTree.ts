import type { ReactNode } from 'react'

/** 树形选项通用结构（Select Option / Cascader Option） */
export interface OptionLike {
  value: string
  label: ReactNode
  disabled?: boolean
  children?: OptionLike[]
}

/** 在树形选项中按 value 查找选项 */
export function findOption<T extends OptionLike>(opts: T[], value: string): T | undefined {
  for (const opt of opts) {
    if (opt.value === value) return opt
    if (opt.children?.length) {
      const found = findOption(opt.children as T[], value)
      if (found) return found
    }
  }
  return undefined
}

/** 在树形选项中按 value 查找 label */
export function findLabel<T extends OptionLike>(opts: T[], val: string): ReactNode {
  const opt = findOption(opts, val)
  return opt
    ? opt.label
    : ''
}

/** 在列表中找下一个/上一个非 disabled 的下标，用于键盘上下移动高亮 */
export function getNextHighlightIndex<T extends { disabled?: boolean }>(
  list: T[],
  current: number,
  direction: 1 | -1,
): number {
  if (list.length === 0) return -1
  let next = current + direction
  while (next >= 0 && next < list.length && list[next]?.disabled) next += direction
  if (next < 0) return 0
  if (next >= list.length) return list.length - 1
  return next
}

/** 返回指定方向上的首个可用项；没有可用项时返回 -1 */
export function getEnabledBoundaryIndex<T>(
  list: T[],
  direction: 1 | -1,
  isDisabled: (item: T) => boolean,
): number {
  if (direction === 1) return list.findIndex((item) => !isDisabled(item))

  for (let index = list.length - 1; index >= 0; index -= 1) {
    const item = list[index]
    if (item && !isDisabled(item)) return index
  }

  return -1
}

/** 从当前高亮向前或向后寻找可用项，越过边界时停留在对应端点 */
export function getNextEnabledIndex<T>(
  list: T[],
  current: number,
  direction: 1 | -1,
  isDisabled: (item: T) => boolean,
): number {
  if (list.length === 0) return -1
  if (getEnabledBoundaryIndex(list, 1, isDisabled) === -1) return -1

  const currentItem = list[current]
  if (!currentItem || isDisabled(currentItem)) return getEnabledBoundaryIndex(list, direction, isDisabled)

  let next = current + direction
  while (next >= 0 && next < list.length) {
    const item = list[next]
    if (item && !isDisabled(item)) return next
    next += direction
  }

  return direction === 1
    ? getEnabledBoundaryIndex(list, -1, isDisabled)
    : getEnabledBoundaryIndex(list, 1, isDisabled)
}

/** 保留当前可用索引，否则回退到首个可用项 */
export function normalizeEnabledIndex<T>(
  list: T[],
  current: number,
  isDisabled: (item: T) => boolean,
): number {
  const currentItem = list[current]
  if (currentItem && !isDisabled(currentItem)) return current
  return getEnabledBoundaryIndex(list, 1, isDisabled)
}
