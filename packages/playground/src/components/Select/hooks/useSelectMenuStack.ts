// oxlint-disable react-hooks/exhaustive-deps
import { useCallback, useEffect, useState } from 'react'
import type { Option } from '../types'

/** 级联模式下管理菜单栈与键盘高亮下标 */
export function useSelectMenuStack(options: Option[]) {
  const [menuStack, setMenuStack] = useState<Option[][]>([options])
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([0])

  useEffect(() => {
    setMenuStack([options])
  }, [options])

  const handleOptionHover = useCallback((option: Option, level: number, idx: number) => {
    if (option.disabled) return

    const newStack = menuStack.slice(0, level + 1)
    if (option.children?.length) {
      newStack.push(option.children)
    }
    setMenuStack(newStack)
    setHighlightedIndices((prev) => [
      ...prev.slice(0, level),
      idx,
      ...(option.children?.length
        ? [findFirstEnabledIndex(option.children)]
        : []),
    ])
  }, [menuStack])

  const resetHighlight = useCallback((direction: 1 | -1 = 1) => {
    setHighlightedIndices([
      direction === -1
        ? findLastEnabledIndex(options)
        : findFirstEnabledIndex(options),
    ])
  }, [options])

  return {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetHighlight,
  }
}

function findFirstEnabledIndex(options: Option[]) {
  const index = options.findIndex((option) => !option.disabled)
  return index >= 0
    ? index
    : -1
}

function findLastEnabledIndex(options: Option[]) {
  for (let index = options.length - 1; index >= 0; index--) {
    if (!options[index]?.disabled) return index
  }
  return -1
}
