import { useLatestCallback } from '@/hooks'
import type { Option } from '../types'

type SelectKeyboardOptions = {
  disabled: boolean
  loading: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  openSelect: (direction: 1 | -1) => void
  isCascading: boolean
  menuStack: Option[][]
  setMenuStack: React.Dispatch<React.SetStateAction<Option[][]>>
  highlightedIndices: number[]
  setHighlightedIndices: React.Dispatch<React.SetStateAction<number[]>>
  highlightedIndex: number
  setHighlightedIndex: (n: number) => void
  filteredOptions: Option[]
  handleOptionClick: (value: string) => void
}

/** Select 非 editable trigger 的键盘导航 */
export function useSelectKeyboard(options: SelectKeyboardOptions) {
  const {
    disabled,
    loading,
    isOpen,
    setIsOpen,
    openSelect,
    isCascading,
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    highlightedIndex,
    setHighlightedIndex,
    filteredOptions,
    handleOptionClick,
  } = options

  return useLatestCallback((e: React.KeyboardEvent) => {
    if (disabled || loading) return

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openSelect(
          e.key === 'ArrowUp'
            ? -1
            : 1,
        )
      }
      return
    }

    /** input 元素（editable / search）自行处理按键，不拦截 */
    if ((e.target as HTMLElement).tagName === 'INPUT') return

    if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      return
    }

    if (isCascading) {
      const level = highlightedIndices.length - 1
      const currentOptions = menuStack[level] ?? []
      const idx = highlightedIndices[level] ?? -1
      const option = currentOptions[idx]

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const next = getAdjacentEnabledIndex(
          currentOptions,
          idx,
          e.key === 'ArrowDown'
            ? 1
            : -1,
        )
        if (next !== idx) setHighlightedIndices((prev) => [...prev.slice(0, level), next])
        return
      }

      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        const next = e.key === 'Home'
          ? getFirstEnabledIndex(currentOptions)
          : getLastEnabledIndex(currentOptions)
        if (next !== idx) setHighlightedIndices((prev) => [...prev.slice(0, level), next])
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        if (option?.disabled) return

        const children = option?.children
        if (children?.length) {
          const newStack = menuStack.slice(0, level + 1).concat([children])
          setMenuStack(newStack)
          setHighlightedIndices((prev) => [
            ...prev.slice(0, level + 1),
            getFirstEnabledIndex(children),
          ])
        }
        else if (option) {
          handleOptionClick(option.value)
        }
        return
      }

      if (e.key === 'ArrowLeft' && level > 0) {
        e.preventDefault()
        setMenuStack((prev) => prev.slice(0, level))
        setHighlightedIndices((prev) => prev.slice(0, level))
        return
      }

      return
    }

    const list = filteredOptions
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = getAdjacentEnabledIndex(
        list,
        highlightedIndex,
        e.key === 'ArrowDown'
          ? 1
          : -1,
      )
      if (next !== highlightedIndex) setHighlightedIndex(next)
      return
    }

    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      const next = e.key === 'Home'
        ? getFirstEnabledIndex(list)
        : getLastEnabledIndex(list)
      if (next !== highlightedIndex) setHighlightedIndex(next)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const option = list[highlightedIndex]
      if (option && !option.disabled) handleOptionClick(option.value)
    }
  })
}

function getAdjacentEnabledIndex(
  list: Option[],
  current: number,
  direction: 1 | -1,
) {
  if (list.length === 0) return -1

  const start = current >= 0 && current < list.length
    ? current + direction
    : direction === 1
    ? 0
    : list.length - 1

  for (let index = start; index >= 0 && index < list.length; index += direction) {
    if (!list[index]?.disabled) return index
  }

  if (current >= 0 && current < list.length && !list[current]?.disabled) return current

  return direction === 1
    ? getFirstEnabledIndex(list)
    : getLastEnabledIndex(list)
}

function getFirstEnabledIndex(list: Option[]) {
  return list.findIndex((option) => !option.disabled)
}

function getLastEnabledIndex(list: Option[]) {
  for (let index = list.length - 1; index >= 0; index--) {
    if (!list[index]?.disabled) return index
  }
  return -1
}
