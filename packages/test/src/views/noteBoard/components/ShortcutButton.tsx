import { Keyboard } from 'lucide-react'

export interface ShortcutButtonProps {
  onClick: () => void
}

export function ShortcutButton({ onClick }: ShortcutButtonProps) {
  return (
    <div className="fixed z-50 bottom-4 right-4">
      <button
        onClick={ onClick }
        className="group relative flex items-center gap-3 backdrop-blur-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl px-4 py-2 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
      >
        <Keyboard size={ 20 } className="group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-medium">快捷键</span>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </button>
    </div>
  )
}
