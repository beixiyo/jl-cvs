import { cn } from '@/utils'
import { Check, ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import type { SelectOptionProps } from '../types'

export const SelectOption = memo(({
  option,
  id,
  selected,
  highlighted,
  onClick,
  onMouseEnter,
  renderExtra,
  className,
  contentClassName,
  labelClassName,
  checkIconClassName,
  chevronIconClassName,
}: SelectOptionProps) => {
  const handleClick = () => {
    if (!option.disabled) {
      onClick(option.value)
    }
  }

  const handleMouseEnter = () => {
    if (!option.disabled) onMouseEnter?.()
  }

  const isSelected = Boolean(selected && !option.children)
  const isHighlighted = Boolean(highlighted && !option.disabled)

  return (
    <div
      id={ id }
      role="option"
      aria-selected={ isSelected }
      aria-disabled={ option.disabled || undefined }
      { ...{
        [DATA_ATTR.selected]: isSelected,
        [DATA_ATTR.highlighted]: isHighlighted,
        [DATA_ATTR.disabled]: Boolean(option.disabled),
      } }
      className={ cn(
        'group flex min-h-9 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-[10px] bg-background px-2 text-text',
        'overflow-hidden transition-all duration-[400ms] ease-out',
        option.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-background3',
        isSelected
          ? 'bg-background2 text-text'
          : '',
        isHighlighted && 'bg-background2',
        className,
      ) }
      onClick={ handleClick }
      onMouseEnter={ handleMouseEnter }
    >
      <div className={ cn('flex flex-1 items-center gap-2', contentClassName) }>
        { option.icon && option.icon }
        <div className={ cn('truncate text-sm', labelClassName) }>{ option.label }</div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        { renderExtra?.(option) }
        { isSelected && <Check className={ cn('h-4 w-4 shrink-0 text-text', checkIconClassName) } /> }
        { option.children && <ChevronRight className={ cn('h-4 w-4 shrink-0 text-text2', chevronIconClassName) } /> }
      </div>
    </div>
  )
})

SelectOption.displayName = 'SelectOption'
