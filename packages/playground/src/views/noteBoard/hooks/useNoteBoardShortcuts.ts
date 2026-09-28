import { useShortCutKey } from '@/hooks'
import type { NoteBoardMode } from '@jl-org/cvs'
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
    onKeyDown: (e) => {
      e.preventDefault()
      onUndo()
    },
  })

  /** 重做 Ctrl+Shift+Z */
  useShortCutKey({
    key: 'z',
    ctrl: true,
    shift: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onRedo()
    },
  })

  /** 模式切换快捷键 Ctrl+1~6 / Ctrl+0（固定声明次数，符合 Rules of Hooks） */
  useShortCutKey({
    key: '1',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onModeChange(MODE_MAP[1]!)
    },
  })

  useShortCutKey({
    key: '2',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onModeChange(MODE_MAP[2]!)
    },
  })

  useShortCutKey({
    key: '3',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onModeChange(MODE_MAP[3]!)
    },
  })

  useShortCutKey({
    key: '4',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onModeChange(MODE_MAP[4]!)
    },
  })

  useShortCutKey({
    key: '5',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onModeChange(MODE_MAP[5]!)
    },
  })

  useShortCutKey({
    key: '6',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onModeChange(MODE_MAP[6]!)
    },
  })

  useShortCutKey({
    key: '0',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onModeChange(MODE_MAP[0]!)
    },
  })

  /** 导出图片 Ctrl+E */
  useShortCutKey({
    key: 'e',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onExport()
    },
  })

  /** 导出所有图层 Ctrl+Shift+E */
  useShortCutKey({
    key: 'e',
    ctrl: true,
    shift: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onExportAll()
    },
  })

  /** 重置大小 Ctrl+R */
  useShortCutKey({
    key: 'r',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onResetSize()
    },
  })

  /** 清空画布 Ctrl+Delete */
  useShortCutKey({
    key: 'Delete',
    ctrl: true,
    onKeyDown: (e) => {
      e.preventDefault()
      onClear()
    },
  })
}
