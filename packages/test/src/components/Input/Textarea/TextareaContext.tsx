import { createContext, useContext } from 'react'

export interface TextareaContextValue {
  id?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
  isFocused?: boolean
  value: string
  maxLength?: number
}

const TextareaContext = createContext<TextareaContextValue | undefined>(undefined)

export function TextareaProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: TextareaContextValue
}) {
  return <TextareaContext.Provider value={ value }>{children}</TextareaContext.Provider>
}

export function useTextarea() {
  const context = useContext(TextareaContext)
  if (!context) {
    throw new Error('useTextarea must be used within a TextareaProvider')
  }
  return context
}
