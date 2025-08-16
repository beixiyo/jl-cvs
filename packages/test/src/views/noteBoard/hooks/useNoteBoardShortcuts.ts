import type { NoteBoardMode } from '@jl-org/cvs'
import { useShortCutKey } from '@/hooks'
import { MODE_MAP } from '../constants'

export interface UseNoteBoardShortcutsOptions {
  onUndo: () => void
  onRedo: () => void
  onModeChange: (mode: NoteBoardMode) => void
  onExport: () => void
  onExportAll: () => void
  onResetSize: () => void
  onClear: () => void
}

export function useNoteBoardShortcuts(options: UseNoteBoardShortcutsOptions) {
  const {
    onUndo,
    onRedo,
    onModeChange,
    onExport,
    onExportAll,
    onResetSize,
    onClear,
  } = options

  /** 撤销 Ctrl+Z */
  useShortCutKey({
    key: 'z',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      onUndo()
    },
  })

  /** 重做 Ctrl+Shift+Z */
  useShortCutKey({
    key: 'z',
    ctrl: true,
    shift: true,
    fn: (e) => {
      e.preventDefault()
      onRedo()
    },
  })

  /** 模式切换快捷键 */
  Object.entries(MODE_MAP).forEach(([key, mode]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useShortCutKey({
      key,
      ctrl: true,
      fn: (e) => {
        e.preventDefault()
        onModeChange(mode)
      },
    })
  })

  /** 导出图片 Ctrl+E */
  useShortCutKey({
    key: 'e',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      onExport()
    },
  })

  /** 导出所有图层 Ctrl+Shift+E */
  useShortCutKey({
    key: 'e',
    ctrl: true,
    shift: true,
    fn: (e) => {
      e.preventDefault()
      onExportAll()
    },
  })

  /** 重置大小 Ctrl+R */
  useShortCutKey({
    key: 'r',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      onResetSize()
    },
  })

  /** 清空画布 Ctrl+Delete */
  useShortCutKey({
    key: 'Delete',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      onClear()
    },
  })
}
