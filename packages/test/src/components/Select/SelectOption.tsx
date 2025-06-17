import type { Option } from './types'
import { cn } from '@/utils'
import { Check } from 'lucide-react'

export const SelectOption = memo(({ option, selected, onClick }: SelectOptionProps) => {
  const handleClick = () => {
    if (!option.disabled) {
      onClick(option.value)
    }
  }

  return (
    <div
      className={ cn(
        'flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 ease-in-out',
        { 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100': selected },
        'dark:bg-gray-800 dark:text-gray-200',
        option.disabled
          ? 'opacity-50 cursor-not-allowed dark:opacity-100'
          : 'hover:bg-slate-100 dark:hover:bg-slate-700',
      ) }
      onClick={ handleClick }
    >
      <div className="flex flex-1 items-center gap-2">
        { option.icon && <span className="h-5 w-5">{ option.icon }</span> }
        <span className="truncate">{ option.label }</span>
      </div>

      { selected && (
        <Check className="h-4 w-4 flex-shrink-0 text-blue-500" />
      ) }
    </div>
  )
})

SelectOption.displayName = 'SelectOption'

interface SelectOptionProps {
  option: Option
  selected: boolean
  onClick: (value: string) => void
}
