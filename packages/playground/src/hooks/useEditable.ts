import type React from 'react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getNextHighlightIndex } from '../utils/optionTree'

/**
 * 可编辑下拉选择器通用 Hook（combobox 模式）
 *
 * - 输入时实时过滤选项（匹配 value 或字符串 label）
 * - ArrowUp / ArrowDown 在下拉选项间移动高亮
 * - Enter 选中高亮项（若有），否则以当前文本提交
 * - Escape 回退至上次提交的值
 * - blur 时以当前文本提交
 * - 点击选项时，需在 dropdown 容器加 onMouseDown preventDefault 阻止 input blur
 */
export function useEditable(
  actualValue: string | undefined,
  options: EditableOption[],
  handleChangeVal: (value: string, meta: any) => void,
  setOpen: (open: boolean) => void,
) {
  const [inputText, setInputText] = useState(
    typeof actualValue === 'string'
      ? actualValue
      : '',
  )
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  /** 受控模式：外部 value 变化时同步 input */
  useEffect(() => {
    if (typeof actualValue === 'string') {
      setInputText(actualValue)
    }
  }, [actualValue])

  /** 根据输入实时过滤选项（value 或字符串 label） */
  const editableFilteredOptions = useMemo(() => {
    if (!inputText.trim()) return options
    const q = inputText.toLowerCase()
    return options.filter((o) =>
      o.value.toLowerCase().includes(q)
      || (typeof o.label === 'string' && o.label.toLowerCase().includes(q))
    )
  }, [options, inputText])

  /** 输入变化时重置高亮 */
  const handleInputChange = useCallback((text: string) => {
    setInputText(text)
    setHighlightedIndex(-1)
    setOpen(true)
  }, [setOpen])

  const handleInputFocus = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  /** blur 时以当前文本提交 */
  const handleInputBlur = useCallback(() => {
    handleChangeVal(inputText, {})
    setHighlightedIndex(-1)
    setOpen(false)
  }, [handleChangeVal, inputText, setOpen])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => getNextHighlightIndex(editableFilteredOptions, prev, 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => getNextHighlightIndex(editableFilteredOptions, prev, -1))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const highlighted = editableFilteredOptions[highlightedIndex]
      if (highlighted && !highlighted.disabled) {
        setInputText(highlighted.value)
        handleChangeVal(highlighted.value, {})
      }
      else {
        handleChangeVal(inputText, {})
      }
      setHighlightedIndex(-1)
      setOpen(false)
      return
    }
    if (e.key === 'Escape') {
      setInputText(actualValue ?? '')
      setHighlightedIndex(-1)
      setOpen(false)
    }
  }, [actualValue, handleChangeVal, inputText, setOpen, editableFilteredOptions, highlightedIndex])

  /** 点击选项时：写入 input + 提交 + 关闭（dropdown 容器需 preventDefault mousedown） */
  const handleOptionSelectEditable = useCallback((value: string) => {
    setInputText(value)
    handleChangeVal(value, {})
    setHighlightedIndex(-1)
    setOpen(false)
  }, [handleChangeVal, setOpen])

  return {
    inputText,
    highlightedIndex,
    setHighlightedIndex,
    editableFilteredOptions,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleInputKeyDown,
    handleOptionSelectEditable,
  }
}

type EditableOption = {
  value: string
  label: ReactNode
  disabled?: boolean
}
