import type { ReactNode } from 'react'

export interface Option {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface SelectProps {
  options: Option[]
  value?: string | string[]
  defaultValue?: string | string[]
  onClick?: () => void
  onChange?: (value: string | string[]) => void
  onClickOutside?: () => void
  placeholder?: string
  placeholderIcon?: ReactNode

  disabled?: boolean
  showDownArrow?: boolean
  rotate?: boolean
  loading?: boolean
  showEmpty?: boolean
  multiple?: boolean
  maxSelect?: number
  searchable?: boolean

  className?: string
  placeholderClassName?: string
}
