import type { SelectProps } from './types'
import { cn } from '@/utils'
import { ChevronDown, Loader2, Search } from 'lucide-react'
import { SelectOption } from './SelectOption'

export const Select = memo(({
  options,
  value,
  defaultValue,
  onChange,
  onClick,
  onClickOutside,

  className,
  placeholderClassName,
  placeholder = 'Select option',
  placeholderIcon,

  showEmpty = true,
  showDownArrow = true,
  disabled = false,
  loading = false,
  multiple = false,
  rotate = true,
  maxSelect,
  searchable = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [internalValue, setInternalValue] = useState<string[]>(() => {
    if (value !== undefined) {
      return Array.isArray(value)
        ? value
        : [value]
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue]
    }
    return []
  })

  const containerRef = useRef<HTMLDivElement>(null)

  // Update internal value when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(Array.isArray(value)
        ? value
        : [value])
    }
  }, [value])

  const filteredOptions = useMemo(() => {
    return options.filter(option =>
      option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [options, searchQuery])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false)
      onClickOutside?.()
    }
  }, [onClickOutside])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const handleOptionClick = useCallback((optionValue: string) => {
    if (disabled)
      return

    const newValues = multiple
      ? internalValue.includes(optionValue)
        ? internalValue.filter(v => v !== optionValue)
        : maxSelect && internalValue.length >= maxSelect
          ? internalValue
          : [...internalValue, optionValue]
      : [optionValue]

    if (!multiple) {
      setIsOpen(false)
    }

    if (value === undefined) {
      setInternalValue(newValues)
    }

    onChange?.(multiple
      ? newValues
      : newValues[0])
  }, [disabled, multiple, maxSelect, onChange, value, internalValue])

  const selectedLabels = useMemo(() => {
    return internalValue
      .map(val => options.find(opt => opt.value === val)?.label)
      .filter(Boolean)
  }, [internalValue, options])

  return (
    <div
      className="relative"
      ref={ containerRef }
      onClick={ () => {
        if (disabled)
          return
        onClick?.()
      } }
    >
      <div
        className={ cn(
          'border rounded-lg px-3 py-2 flex items-center justify-between',
          'transition-colors duration-200 ease-in-out',
          'dark:bg-gray-800 dark:text-gray-200',
          disabled
            ? 'bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700'
            : 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-600',
          isOpen
            ? 'border-slate-300 dark:border-slate-600'
            : 'border-gray-200 dark:border-gray-700',
          { 'cursor-wait': loading },
          className,
        ) }
        onClick={ () => !disabled && !loading && setIsOpen(!isOpen) }
      >
        <div className="flex flex-1 items-center gap-2">
          { loading
            ? <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
            : selectedLabels.length > 0

              ? <span className="truncate">
                  { multiple
                    ? selectedLabels.join(', ')
                    : selectedLabels[0] }
                </span>
              : <div className={ cn(
                  'flex items-center gap-2',
                  { 'mr-2': !!placeholderIcon },
                ) }>
                  <span className={ cn(
                    'mr-2 select-none text-gray-500 dark:text-gray-400',
                    placeholderClassName,
                  ) }>
                    { placeholder }
                  </span>

                  { placeholderIcon && <>{ placeholderIcon }</> }
                </div> }
        </div>

        { showDownArrow && <ChevronDown
          className={ cn(
            'w-5 h-5 transform transition-transform duration-200 ease-in-out text-gray-500 dark:text-gray-400',
            isOpen && rotate
              ? 'rotate-180'
              : 'rotate-0',
          ) }
        /> }
      </div>

      <div
        className={ cn(
          'absolute w-full mt-1 bg-white border-gray-200 rounded-lg shadow-lg z-50',
          'transition-all duration-200 ease-in-out origin-top',
          'dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/70',
          { 'border dark:border-gray-700': showEmpty },
          isOpen
            ? 'opacity-100 scale-y-100 translate-y-0'
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none',
        ) }
        style={ {
          maxHeight: isOpen
            ? '15rem'
            : '0',
          overflow: 'auto',
        } }
      >
        { searchable && (
          <div className="border-b p-2 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 transform text-gray-400 -translate-y-1/2 dark:text-gray-500" />
              <input
                type="text"
                className="w-full border rounded-md py-1 pl-9 pr-3 dark:border-gray-600 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 focus:outline-none dark:focus:border-blue-400"
                placeholder="Search..."
                value={ searchQuery }
                onChange={ e => setSearchQuery(e.target.value) }
                onClick={ e => e.stopPropagation() }
              />
            </div>
          </div>
        ) }

        { filteredOptions.map(option => (
          <SelectOption
            key={ option.value }
            option={ option }
            selected={ internalValue.includes(option.value) }
            onClick={ handleOptionClick }
          />
        )) }

        { filteredOptions.length === 0 && showEmpty && (
          <div className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
            No options found
          </div>
        ) }
      </div>
    </div>
  )
})

Select.displayName = 'Select'
