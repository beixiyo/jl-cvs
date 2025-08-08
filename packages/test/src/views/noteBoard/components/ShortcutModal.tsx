import { Modal } from '@/components/Modal'
import { SHORTCUT_KEYS } from '../constants'

export interface ShortcutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutModal({ isOpen, onClose }: ShortcutModalProps) {
  return (
    <Modal
      isOpen={ isOpen }
      onOk={ onClose }
      onClose={ onClose }
      showCloseBtn={ false }
      titleText="⌨️ 快捷键说明"
      width={ 700 }
      height={ 600 }
    >
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            使用以下快捷键可以快速操作画板功能
          </p>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full from-blue-500 to-purple-600 bg-gradient-to-r" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* 基础操作 */ }
          <div className="space-y-4">
            <h3 className="flex items-center gap-3 text-xl text-gray-800 font-bold dark:text-white">
              <div className="h-3 w-3 rounded-full from-blue-500 to-purple-600 bg-gradient-to-r" />
              基础操作
            </h3>
            <div className="grid grid-cols-1 gap-3">
              { SHORTCUT_KEYS.slice(0, 2).map((shortcut, index) => (
                <div
                  key={ index }
                  className="group flex items-center justify-between border border-blue-200/30 rounded-xl from-blue-50/50 to-purple-50/50 bg-gradient-to-r p-4 backdrop-blur-sm transition-all duration-300 dark:border-gray-600/30 dark:from-gray-700/50 dark:to-gray-600/50 hover:shadow-lg"
                >
                  <span className="text-gray-700 font-medium dark:text-gray-300">
                    { shortcut.desc }
                  </span>
                  <kbd className="rounded-lg from-gray-100 to-gray-200 bg-gradient-to-r px-4 py-2 text-sm text-gray-700 font-mono shadow-md transition-shadow dark:from-gray-600 dark:to-gray-700 dark:text-gray-300 group-hover:shadow-lg">
                    { shortcut.key }
                  </kbd>
                </div>
              )) }
            </div>
          </div>

          {/* 绘图模式 */ }
          <div className="space-y-4">
            <h3 className="flex items-center gap-3 text-xl text-gray-800 font-bold dark:text-white">
              <div className="h-3 w-3 rounded-full from-green-500 to-teal-600 bg-gradient-to-r" />
              绘图模式切换
            </h3>
            <div className="grid grid-cols-2 gap-3">
              { SHORTCUT_KEYS.slice(2, 9).map((shortcut, index) => (
                <div
                  key={ index }
                  className="group flex items-center justify-between border border-green-200/30 rounded-xl from-green-50/50 to-teal-50/50 bg-gradient-to-r p-3 backdrop-blur-sm transition-all duration-300 dark:border-gray-600/30 dark:from-gray-700/50 dark:to-gray-600/50 hover:shadow-lg"
                >
                  <span className="text-sm text-gray-700 font-medium dark:text-gray-300">
                    { shortcut.desc }
                  </span>
                  <kbd className="rounded-lg from-gray-100 to-gray-200 bg-gradient-to-r px-3 py-1.5 text-xs text-gray-700 font-mono shadow-md transition-shadow dark:from-gray-600 dark:to-gray-700 dark:text-gray-300 group-hover:shadow-lg">
                    { shortcut.key }
                  </kbd>
                </div>
              )) }
            </div>
          </div>

          {/* 高级功能 */ }
          <div className="space-y-4">
            <h3 className="flex items-center gap-3 text-xl text-gray-800 font-bold dark:text-white">
              <div className="h-3 w-3 rounded-full from-purple-500 to-pink-600 bg-gradient-to-r" />
              高级功能
            </h3>
            <div className="grid grid-cols-1 gap-3">
              { SHORTCUT_KEYS.slice(9).map((shortcut, index) => (
                <div
                  key={ index }
                  className="group flex items-center justify-between border border-purple-200/30 rounded-xl from-purple-50/50 to-pink-50/50 bg-gradient-to-r p-4 backdrop-blur-sm transition-all duration-300 dark:border-gray-600/30 dark:from-gray-700/50 dark:to-gray-600/50 hover:shadow-lg"
                >
                  <span className="text-gray-700 font-medium dark:text-gray-300">
                    { shortcut.desc }
                  </span>
                  <kbd className="rounded-lg from-gray-100 to-gray-200 bg-gradient-to-r px-4 py-2 text-sm text-gray-700 font-mono shadow-md transition-shadow dark:from-gray-600 dark:to-gray-700 dark:text-gray-300 group-hover:shadow-lg">
                    { shortcut.key }
                  </kbd>
                </div>
              )) }
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-600">
          <div className="flex items-start gap-4 border border-yellow-200/30 rounded-xl from-yellow-50/50 to-orange-50/50 bg-gradient-to-r p-4 backdrop-blur-sm dark:border-gray-600/30 dark:from-gray-700/50 dark:to-gray-600/50">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="text-gray-800 font-semibold dark:text-white">使用提示</h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                快捷键在画板获得焦点时生效，确保鼠标在画板区域内或点击画板后再使用快捷键。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
