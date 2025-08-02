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
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* 基础操作 */ }
          <div className="space-y-4">
            <h3 className="text-xl text-gray-800 font-bold dark:text-white flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
              基础操作
            </h3>
            <div className="grid grid-cols-1 gap-3">
              { SHORTCUT_KEYS.slice(0, 2).map((shortcut, index) => (
                <div
                  key={ index }
                  className="group flex items-center justify-between backdrop-blur-sm bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/30 rounded-xl p-4 hover:shadow-lg transition-all duration-300 dark:from-gray-700/50 dark:to-gray-600/50 dark:border-gray-600/30"
                >
                  <span className="text-gray-700 font-medium dark:text-gray-300">
                    { shortcut.desc }
                  </span>
                  <kbd className="rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 text-sm text-gray-700 font-mono shadow-md group-hover:shadow-lg transition-shadow dark:from-gray-600 dark:to-gray-700 dark:text-gray-300">
                    { shortcut.key }
                  </kbd>
                </div>
              )) }
            </div>
          </div>

          {/* 绘图模式 */ }
          <div className="space-y-4">
            <h3 className="text-xl text-gray-800 font-bold dark:text-white flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-full" />
              绘图模式切换
            </h3>
            <div className="grid grid-cols-2 gap-3">
              { SHORTCUT_KEYS.slice(2, 9).map((shortcut, index) => (
                <div
                  key={ index }
                  className="group flex items-center justify-between backdrop-blur-sm bg-gradient-to-r from-green-50/50 to-teal-50/50 border border-green-200/30 rounded-xl p-3 hover:shadow-lg transition-all duration-300 dark:from-gray-700/50 dark:to-gray-600/50 dark:border-gray-600/30"
                >
                  <span className="text-gray-700 font-medium text-sm dark:text-gray-300">
                    { shortcut.desc }
                  </span>
                  <kbd className="rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 text-xs text-gray-700 font-mono shadow-md group-hover:shadow-lg transition-shadow dark:from-gray-600 dark:to-gray-700 dark:text-gray-300">
                    { shortcut.key }
                  </kbd>
                </div>
              )) }
            </div>
          </div>

          {/* 高级功能 */ }
          <div className="space-y-4">
            <h3 className="text-xl text-gray-800 font-bold dark:text-white flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full" />
              高级功能
            </h3>
            <div className="grid grid-cols-1 gap-3">
              { SHORTCUT_KEYS.slice(9).map((shortcut, index) => (
                <div
                  key={ index }
                  className="group flex items-center justify-between backdrop-blur-sm bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-200/30 rounded-xl p-4 hover:shadow-lg transition-all duration-300 dark:from-gray-700/50 dark:to-gray-600/50 dark:border-gray-600/30"
                >
                  <span className="text-gray-700 font-medium dark:text-gray-300">
                    { shortcut.desc }
                  </span>
                  <kbd className="rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 text-sm text-gray-700 font-mono shadow-md group-hover:shadow-lg transition-shadow dark:from-gray-600 dark:to-gray-700 dark:text-gray-300">
                    { shortcut.key }
                  </kbd>
                </div>
              )) }
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-600">
          <div className="flex items-start gap-4 backdrop-blur-sm bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border border-yellow-200/30 rounded-xl p-4 dark:from-gray-700/50 dark:to-gray-600/50 dark:border-gray-600/30">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="text-gray-800 font-semibold dark:text-white">使用提示</h4>
              <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                快捷键在画板获得焦点时生效，确保鼠标在画板区域内或点击画板后再使用快捷键。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
