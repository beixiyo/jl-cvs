import type { FileItem } from '@/components/Uploader'
import { useState } from 'react'
import { PreviewImg } from '@/components/PreviewImg'
import { Toolbar } from '@/components/Toolbar'
import {
  CanvasArea,
  ExportModal,
  FeatureSection,
  ShortcutButton,
  ShortcutModal,
} from './components'
import { MODE_OPTIONS } from './constants'
import {
  useImageExport,
  useNoteBoard,
  useNoteBoardShortcuts,
} from './hooks'

export default function NoteBoardTest() {
  const [showShortcutModal, setShowShortcutModal] = useState(false)

  /** 画板相关逻辑 */
  const {
    noteBoardRef,
    currentMode,
    config,
    canvasContainerRef,
    handleModeChange,
    updateConfig,
    actions,
  } = useNoteBoard()

  /** 图片导出相关逻辑 */
  const {
    previewImages,
    showPreviewModal,
    viewMode,
    fullscreenImage,
    handleExport,
    handleExportAll,
    handleDownloadImage,
    handleClosePreview,
    handleFullscreenPreview,
    handleCloseFullscreen,
    handleToggleViewMode,
  } = useImageExport(noteBoardRef)

  /** 快捷键 */
  useNoteBoardShortcuts({
    onUndo: actions.undo,
    onRedo: actions.redo,
    onModeChange: handleModeChange,
    onExport: handleExport,
    onExportAll: handleExportAll,
    onResetSize: actions.resetSize,
    onClear: actions.clear,
  })

  /** 上传图片 */
  const handleImageUpload = (file: FileItem[]) => {
    if (file[0]?.base64) {
      actions.drawImg(file[0].base64)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* 背景装饰 */ }
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 space-y-8">
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed dark:text-gray-300">
          🎨 功能完整的 Canvas 画板组件，支持绘图、擦除、拖拽、图形绘制、撤销重做等功能
        </p>

        {/* 工具栏容器 */ }
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-2xl p-6 shadow-xl dark:bg-gray-800/70 dark:border-gray-700/30">
            <Toolbar
              modes={ MODE_OPTIONS }
              activeMode={ currentMode }
              onModeChange={ handleModeChange as any }
              brushSize={ config.lineWidth }
              onBrushSizeChange={ val => updateConfig('lineWidth', val) }
              onImageUpload={ handleImageUpload }
              onExport={ handleExport }
              onExportAll={ handleExportAll }
              onUndo={ actions.undo }
              onRedo={ actions.redo }
              onClear={ actions.clear }
              onResetSize={ actions.resetSize }
            />
          </div>
        </div>

        {/* 画布区域 */ }
        <CanvasArea
          canvasContainerRef={ canvasContainerRef }
        />

        {/* 快捷键提示按钮 */ }
        <ShortcutButton onClick={ () => setShowShortcutModal(true) } />

        {/* 功能说明卡片 */ }
        <FeatureSection />
      </div>

      {/* 图像预览模态框 */ }
      <ExportModal
        isOpen={ showPreviewModal }
        onClose={ handleClosePreview }
        images={ previewImages }
        viewMode={ viewMode }
        onToggleViewMode={ handleToggleViewMode }
        onDownloadImage={ handleDownloadImage }
        onFullscreenPreview={ handleFullscreenPreview }
      />

      {/* 快捷键说明模态框 */ }
      <ShortcutModal
        isOpen={ showShortcutModal }
        onClose={ () => setShowShortcutModal(false) }
      />

      {/* 全屏图像预览 */ }
      { fullscreenImage && (
        <PreviewImg
          src={ fullscreenImage }
          onClose={ handleCloseFullscreen }
        />
      ) }
    </div>
  )
}
