import { PreviewImg } from '@/components/PreviewImg'
import { useLatestCallback } from '@/hooks'
import { useState } from 'react'
import { CanvasToolbar } from '../_shared/CanvasToolbar'
import { AddShapeSection, CanvasArea, ExportModal, FeatureSection, ShortcutButton, ShortcutModal } from './components'
import { MODE_OPTIONS } from './constants'
import { useImageExport, useNoteBoardShortcuts } from './hooks'
import { useNoteBoard } from './hooks/useNoteBoard'

export default function NoteBoard2Test() {
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
  const handleImageUpload = useLatestCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => actions.drawImg(reader.result as string)
    reader.readAsDataURL(file)
  })

  /** 传入 memo 组件的回调保持引用稳定 */
  const handleBrushSizeChange = useLatestCallback((val: number) => updateConfig('lineWidth', val))
  const handleOpenShortcutModal = useLatestCallback(() => setShowShortcutModal(true))
  const handleCloseShortcutModal = useLatestCallback(() => setShowShortcutModal(false))

  return (
    <div className="mx-auto w-full max-w-360 px-5 py-7 lg:px-8 lg:py-9">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">无限画布</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-text2">
          世界坐标系与视口变换的高性能画布，支持无限平移、缩放与丰富的图形交互
        </p>
      </header>

      { /* 工具栏容器 */ }
      <CanvasToolbar
        modes={ MODE_OPTIONS }
        activeMode={ currentMode }
        onModeChange={ handleModeChange as any }
        brushSize={ config.lineWidth }
        onBrushSizeChange={ handleBrushSizeChange }
        onImageUpload={ handleImageUpload }
        onExport={ handleExport }
        onExportAll={ handleExportAll }
        onUndo={ actions.undo }
        onRedo={ actions.redo }
        onClear={ actions.clear }
        onResetSize={ actions.resetSize }
      />

      { /* 画布区域 */ }
      <CanvasArea
        canvasContainerRef={ canvasContainerRef }
      />

      { /* addShape 方法测试区域 */ }
      <AddShapeSection noteBoardRef={ noteBoardRef } />

      { /* 快捷键提示按钮 */ }
      <ShortcutButton onClick={ handleOpenShortcutModal } />

      <FeatureSection />

      { /* 图像预览模态框 */ }
      <ExportModal
        isOpen={ showPreviewModal }
        onClose={ handleClosePreview }
        images={ previewImages }
        viewMode={ viewMode }
        onToggleViewMode={ handleToggleViewMode }
        onDownloadImage={ handleDownloadImage }
        onFullscreenPreview={ handleFullscreenPreview }
      />

      { /* 快捷键说明模态框 */ }
      <ShortcutModal
        isOpen={ showShortcutModal }
        onClose={ handleCloseShortcutModal }
      />

      { /* 全屏图像预览 */ }
      { fullscreenImage && (
        <PreviewImg
          src={ fullscreenImage }
          onClose={ handleCloseFullscreen }
        />
      ) }
    </div>
  )
}
