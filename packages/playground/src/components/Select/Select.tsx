'use client'

import { useKeyboardLayer, useLatestCallback, useTheme } from '@/hooks'
import { cn } from '@/utils'
import { ChevronDown, Inbox, Loader2, Search } from 'lucide-react'
import type React from 'react'
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { Z } from '../../constants/z-index'
import { useNestedLayerPriority } from '../../hooks/useKeyboardLayerHost'
import { findOption } from '../../utils/optionTree'
import { CloseBtn } from '../CloseBtn'
import { useFormField } from '../Form/hooks/useFormField'
import { Input } from '../Input'
import { useSelectEditable, useSelectKeyboard, useSelectMenuStack, useSelectOpen } from './hooks'
import { SelectOption } from './subcomponents/SelectOption'
import type { SelectProps } from './types'

function InnerSelect<T extends string | string[] = string>(props: SelectProps<T>) {
  const [theme] = useTheme()
  const {
    options,
    value,
    defaultValue,
    onChange,
    onClick,
    onClickOutside,

    className,
    placeholderClassName,
    optionClassName,
    optionContentClassName,
    optionLabelClassName,
    optionCheckIconClassName,
    optionChevronIconClassName,
    placeholder = 'Select option',
    placeholderIcon,
    prefixIcon,
    clearable = false,
    onClear,
    dropdownHeight = 150,
    dropdownMaxHeight,

    showEmpty = true,
    showDownArrow = true,
    disabled = false,
    loading = false,
    multiple = false,
    rotate = true,
    maxSelect,
    searchable = false,
    required = false,
    editable = false,
    editableInputClassName,
    dropdownClassName,
    onSearch,
    renderOptionExtra,

    name,
    error,
    errorMessage,
    bordered = theme !== 'light',
    shadowed = true,
  } = props

  const isCascading = useMemo(() => options.some((opt) => opt.children && opt.children.length > 0), [options])
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isTriggerHovered, setIsTriggerHovered] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const pendingOpenDirectionRef = useRef<1 | -1 | null>(null)
  const selectId = useId().replaceAll(':', '')

  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<T>({
    name,
    value,
    defaultValue: (defaultValue ?? (multiple
      ? []
      : '')) as T,
    error,
    errorMessage,
    onChange,
  })

  const { isOpen, setIsOpen } = useSelectOpen(containerRef, {
    onClickOutside,
    handleBlur,
  })

  /** 下拉不走 Portal，嵌在弹窗里时要压过弹窗，否则 Esc 关掉的是整个弹窗 */
  const layerPriority = useNestedLayerPriority(Z.dropdown)

  useKeyboardLayer({
    active: isOpen && !disabled && !loading,
    keys: ['Escape'],
    priority: layerPriority,
    allowRepeat: false,
    when: (event) => {
      const target = event.target as HTMLElement | null
      return target?.tagName !== 'INPUT' && target?.tagName !== 'BUTTON'
    },
    onKeyDown: () => setIsOpen(false),
  })

  const openSelect = useLatestCallback((direction: 1 | -1) => {
    pendingOpenDirectionRef.current = direction
    setIsOpen(true)
  })

  const {
    inputText,
    highlightedIndex: editableHighlightedIndex,
    setHighlightedIndex: setEditableHighlightedIndex,
    editableFilteredOptions,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleInputKeyDown,
    handleOptionSelectEditable,
  } = useSelectEditable(actualValue as string | undefined, options, handleChangeVal as any, setIsOpen)

  const {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetHighlight,
  } = useSelectMenuStack(options)

  /**
   * 选中值只从 actualValue 派生，不另存一份乐观状态：
   * 非受控 / 表单态由 useFormField 持有并在 handleChangeVal 里更新；
   * 受控态由父级决定，父级收到 onChange 后不改 value（例如二次确认被取消）时，显示值必须留在原值
   */
  const internalValue = useMemo<T>(() => {
    if (actualValue === undefined) return [] as unknown as T
    return (Array.isArray(actualValue)
      ? actualValue
      : [actualValue]) as T
  }, [actualValue])

  const filteredOptions = useMemo(() => {
    if (isCascading) return options
    return options.filter((option) => option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  }, [options, searchQuery, isCascading])

  useEffect(() => {
    if (isOpen) {
      const openDirection = pendingOpenDirectionRef.current
      pendingOpenDirectionRef.current = null
      if (isCascading) {
        resetHighlight(openDirection ?? 1)
      }
      else {
        const first = openDirection === -1
          ? findLastEnabledIndex(filteredOptions)
          : filteredOptions.findIndex((opt) => !opt.disabled)
        setHighlightedIndex(
          first,
        )
      }
    }
    else {
      setHighlightedIndex(-1)
      if (searchQuery) {
        setSearchQuery('')
        onSearch?.('')
      }
    }
  }, [isOpen, isCascading, filteredOptions, resetHighlight])

  const handleOptionClick = useCallback(
    (optionValue: string) => {
      if (disabled) return

      if (isCascading) {
        const option = findOption(options, optionValue)
        if (option && !option.children) {
          handleChangeVal(optionValue as T, {} as any)
          setIsOpen(false)
        }
        return
      }

      const newValues = multiple
        ? internalValue.includes(optionValue)
          ? (internalValue as any[]).filter((v) => v !== optionValue)
          : maxSelect && internalValue.length >= maxSelect
          ? internalValue
          : [...internalValue, optionValue]
        : [optionValue]

      if (!multiple) setIsOpen(false)

      handleChangeVal(
        (multiple
          ? newValues
          : newValues[0]) as T,
        {} as any,
      )
    },
    [disabled, multiple, maxSelect, handleChangeVal, internalValue, isCascading, options, setIsOpen],
  )

  const handleKeyDown = useSelectKeyboard({
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
  })

  const selectedLabels = useMemo(
    () =>
      (internalValue as string[])
        .map((val) => findOption(options, val)?.label)
        .filter(Boolean),
    [internalValue, options],
  )

  const clearConfig = typeof clearable === 'object'
    ? clearable
    : null
  const canClear = !!clearable && !editable && !disabled && !loading && selectedLabels.length > 0

  const handleClear = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!canClear) return

    handleChangeVal(
      (multiple
        ? []
        : '') as T,
      {} as any,
    )
    setIsOpen(false)
    onClear?.()
  }, [canClear, handleChangeVal, multiple, onClear, setIsOpen])

  const getOptionId = (level: number, index: number) => `${selectId}-option-${level}-${index}`
  const listboxIds = isCascading
    ? menuStack.map((_, level) => `${selectId}-listbox-${level}`).join(' ')
    : `${selectId}-listbox`
  const activeLevel = isCascading
    ? highlightedIndices.length - 1
    : 0
  const activeIndex = isCascading
    ? highlightedIndices[activeLevel] ?? -1
    : editable
    ? editableHighlightedIndex
    : highlightedIndex
  const activeOptions = isCascading
    ? menuStack[activeLevel] ?? []
    : editable
    ? editableFilteredOptions
    : filteredOptions
  const activeOption = activeOptions[activeIndex]
  const activeDescendantId = isOpen && activeOption && !activeOption.disabled && activeIndex >= 0
    ? getOptionId(activeLevel, activeIndex)
    : undefined
  const triggerStateProps = {
    [DATA_ATTR.state]: isOpen
      ? 'open'
      : 'closed',
    [DATA_ATTR.selected]: selectedLabels.length > 0,
    [DATA_ATTR.disabled]: disabled,
    [DATA_ATTR.invalid]: Boolean(actualError),
  }

  const renderDropdown = () => {
    if (isCascading) {
      return (
        <div
          { ...{
            [DATA_ATTR.state]: isOpen
              ? 'open'
              : 'closed',
          } }
          className={ cn(
            'absolute w-auto mt-1 flex gap-2 bg-background rounded-[20px] p-2 z-dropdown text-text',
            'transition-all duration-200 ease-in-out origin-top',
            shadowed && 'shadow-card',
            bordered && 'border border-border',
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0'
              : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none',
            dropdownClassName,
          ) }
          aria-hidden={ !isOpen }
        >
          { menuStack.map((menuOptions, level) => (
            <div
              key={ level }
              id={ `${selectId}-listbox-${level}` }
              role="listbox"
              aria-multiselectable={ multiple || undefined }
              className="overflow-auto"
              style={ { maxHeight: dropdownHeight } }
            >
              <div className="flex min-w-40 flex-col gap-1">
                { menuOptions.map((option, idx) => (
                  <SelectOption
                    key={ option.value }
                    id={ getOptionId(level, idx) }
                    option={ option }
                    selected={ internalValue.includes(option.value) }
                    highlighted={ idx === (highlightedIndices[level] ?? -1) }
                    onClick={ handleOptionClick }
                    onMouseEnter={ () => {
                      handleOptionHover(option, level, idx)
                    } }
                    renderExtra={ renderOptionExtra }
                    className={ optionClassName }
                    contentClassName={ optionContentClassName }
                    labelClassName={ optionLabelClassName }
                    checkIconClassName={ optionCheckIconClassName }
                    chevronIconClassName={ optionChevronIconClassName }
                  />
                )) }
              </div>
            </div>
          )) }
        </div>
      )
    }

    return (
      <div
        { ...{
          [DATA_ATTR.state]: isOpen
            ? 'open'
            : 'closed',
        } }
        className={ cn(
          'absolute w-full mt-1 flex flex-col bg-background rounded-[20px] p-2 z-dropdown text-text',
          'transition-all duration-200 ease-in-out origin-top',
          shadowed && 'shadow-card',
          bordered && 'border border-border',
          isOpen
            ? 'opacity-100 scale-y-100 translate-y-0'
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none',
          dropdownClassName,
        ) }
        aria-hidden={ !isOpen }
        style={ dropdownMaxHeight != null
          ? { maxHeight: dropdownMaxHeight }
          : { height: dropdownHeight } }
        onMouseDown={ editable
          ? (e: React.MouseEvent) => e.preventDefault() // 防止 input blur 早于 option click
          : undefined }
      >
        { searchable && !isCascading && (
          <div className="shrink-0 px-2 pb-1">
            <Input
              size="sm"
              variant="underlined"
              prefix={ <Search size={ 16 } /> }
              placeholder="Search..."
              value={ searchQuery }
              onChange={ (query) => {
                setSearchQuery(query)
                onSearch?.(query)
              } }
              onClick={ (e) => e.stopPropagation() }
              onKeyDown={ (e) => {
                if (e.key === 'Escape') setIsOpen(false)
                e.stopPropagation()
              } }
            />
          </div>
        ) }

        <div
          id={ `${selectId}-listbox` }
          role="listbox"
          aria-multiselectable={ multiple || undefined }
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto"
        >
          { (editable
            ? editableFilteredOptions
            : filteredOptions).map((option, idx) => (
              <SelectOption
                key={ option.value }
                id={ getOptionId(0, idx) }
                option={ option }
                selected={ internalValue.includes(option.value) }
                highlighted={ editable
                  ? idx === editableHighlightedIndex
                  : idx === highlightedIndex }
                onClick={ editable
                  ? handleOptionSelectEditable
                  : handleOptionClick }
                onMouseEnter={ () =>
                  editable
                    ? setEditableHighlightedIndex(idx)
                    : setHighlightedIndex(idx) }
                renderExtra={ renderOptionExtra }
                className={ optionClassName }
                contentClassName={ optionContentClassName }
                labelClassName={ optionLabelClassName }
                checkIconClassName={ optionCheckIconClassName }
                chevronIconClassName={ optionChevronIconClassName }
              />
            )) }

          { (editable
                ? editableFilteredOptions
                : filteredOptions).length === 0 && showEmpty && (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-text2">
              <Inbox size={ 48 } />
              <span className="text-xs">No matching options</span>
            </div>
          ) }
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        { ...triggerStateProps }
        className="relative"
        ref={ containerRef }
        role="combobox"
        aria-expanded={ isOpen }
        aria-haspopup="listbox"
        aria-controls={ isOpen
          ? listboxIds
          : undefined }
        aria-activedescendant={ activeDescendantId }
        aria-autocomplete={ editable
          ? 'list'
          : undefined }
        aria-disabled={ disabled || undefined }
        tabIndex={ disabled || editable
          ? undefined
          : 0 }
        onClick={ () => {
          if (disabled) return
          onClick?.()
        } }
        onKeyDown={ handleKeyDown }
      >
        <div
          { ...triggerStateProps }
          className={ cn(
            'flex min-h-9 items-center justify-between rounded-xl bg-background px-3 py-1.5 text-sm text-text',
            'transition-colors duration-200 ease-in-out',
            disabled
              ? 'cursor-not-allowed bg-background2 opacity-50'
              : editable
              ? 'cursor-text'
              : 'cursor-pointer hover:bg-background2',
            isOpen && 'bg-background2',
            actualError && 'ring-1 ring-inset ring-danger',
            { 'cursor-wait': loading },
            className,
          ) }
          onMouseDown={ (event) => {
            const target = event.target as HTMLElement
            if (!disabled && target.tagName !== 'INPUT' && target.tagName !== 'BUTTON') containerRef.current?.focus()
          } }
          onClick={ editable
            ? undefined
            : () => !disabled && !loading && setIsOpen(!isOpen) }
          onMouseEnter={ () => setIsTriggerHovered(true) }
          onMouseLeave={ () => setIsTriggerHovered(false) }
        >
          <div className="flex flex-1 items-center gap-2 min-w-0">
            { prefixIcon && <span className="flex shrink-0 items-center">{ prefixIcon }</span> }
            { loading
              ? <Loader2 className="h-5 w-5 animate-spin text-text2" />
              : editable
              ? (
                <input
                  value={ inputText }
                  onChange={ (e) => handleInputChange(e.target.value) }
                  onFocus={ handleInputFocus }
                  onBlur={ handleInputBlur }
                  onKeyDown={ handleInputKeyDown }
                  disabled={ disabled }
                  placeholder={ placeholder }
                  className={ cn('bg-transparent outline-none w-full min-w-0', editableInputClassName) }
                />
              )
              : selectedLabels.length > 0
              ? (
                <span className="truncate">
                  { multiple
                    ? selectedLabels.join(', ')
                    : selectedLabels[0] }
                </span>
              )
              : (
                <div className={ cn('flex items-center gap-2', { 'mr-2': !!placeholderIcon }) }>
                  <span className={ cn('mr-2 select-none text-text2', placeholderClassName) }>
                    { placeholder }
                    { required && <span className="ml-1 text-danger">*</span> }
                  </span>
                  { placeholderIcon && <>{ placeholderIcon }</> }
                </div>
              ) }
          </div>

          { (showDownArrow || (canClear && isTriggerHovered)) && (
            <span className="flex size-5 shrink-0 items-center justify-center">
              { canClear && isTriggerHovered
                ? (
                  <CloseBtn
                    mode="static"
                    size={ 20 }
                    iconSize={ 13 }
                    strokeWidth={ 3 }
                    aria-label="Clear selection"
                    className="rounded-md"
                    onClick={ handleClear }
                  >
                    { clearConfig?.clearIcon }
                  </CloseBtn>
                )
                : showDownArrow && (
                  <ChevronDown
                    className={ cn(
                      'size-4 transform transition-transform duration-200 ease-in-out text-text2',
                      isOpen && rotate
                        ? 'rotate-180'
                        : 'rotate-0',
                    ) }
                  />
                ) }
            </span>
          ) }
        </div>

        { renderDropdown() }
      </div>

      { actualError && actualErrorMessage && (
        <div className="mt-1 text-xs text-danger">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )
}

InnerSelect.displayName = 'Select'

export const Select = memo(InnerSelect) as typeof InnerSelect

function findLastEnabledIndex(options: SelectProps['options']) {
  for (let index = options.length - 1; index >= 0; index--) {
    if (!options[index]?.disabled) return index
  }
  return -1
}
