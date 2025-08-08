import { Keyboard } from 'lucide-react'

export interface ShortcutButtonProps {
  onClick: () => void
}

export function ShortcutButton({ onClick }: ShortcutButtonProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={ onClick }
        className="group relative flex items-center gap-3 rounded-2xl from-indigo-500 to-purple-600 bg-gradient-to-r px-4 py-2 text-white shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      >
        <Keyboard size={ 20 } className="transition-transform duration-300 group-hover:rotate-12" />
        <span className="font-medium">快捷键</span>
        <div className="absolute inset-0 rounded-2xl from-indigo-600 to-purple-700 bg-gradient-to-r opacity-0 transition-opacity duration-300 -z-10 group-hover:opacity-100" />
      </button>
    </div>
  )
}
