import type { FileItem } from '@/components/Uploader'
import { useState } from 'react'
import { PreviewImg } from '@/components/PreviewImg'
import { Toolbar } from '@/components/Toolbar'
import {
  AddShapeSection,
  CanvasArea,
  ExportModal,
  FeatureSection,
  ShortcutButton,
  ShortcutModal,
} from './components'
import { MODE_OPTIONS } from './constants'
import {
  useImageExport,
  useNoteBoardShortcuts,
} from './hooks'
import { useNoteBoard } from './hooks/useNoteBoard'

export default function NoteBoard2Test() {
  const [showShortcutModal, setShowShortcutModal] = useState(false)

  /** 画板相关逻辑 */
  const {
    noteBoardRef,
    currentMode,
    config,
    viewportState,
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

  /** 重置视口 */
  const handleResetViewport = () => {
    actions.setPan({ x: 0, y: 0 })
    actions.setZoom(1)
  }

  /** 缩放到指定级别 */
  const handleZoomTo = (zoom: number) => {
    /** 以画布中心为锚点缩放 */
    const canvasRect = canvasContainerRef.current?.getBoundingClientRect()
    if (canvasRect) {
      const centerPoint = {
        x: canvasRect.width / 2,
        y: canvasRect.height / 2,
      }
      actions.setZoom(zoom, centerPoint)
    }
    else {
      actions.setZoom(zoom)
    }
  }

  return (
    <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-100 bg-gradient-to-br dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* 背景装饰 */ }
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute h-80 w-80 rounded-full from-blue-400/20 to-purple-600/20 bg-gradient-to-br blur-3xl -right-40 -top-40" />
        <div className="absolute h-80 w-80 rounded-full from-pink-400/20 to-orange-600/20 bg-gradient-to-tr blur-3xl -bottom-40 -left-40" />
      </div>

      <div className="relative z-10 p-6 space-y-8">
        <h1 className="mb-4 text-3xl text-center text-gray-900 font-bold dark:text-white">
          🚀 NoteBoard2 无限画布测试
        </h1>

        {/* 无限画布控制面板 */ }
        <div className="border border-gray-200/50 rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
            {/* 视口状态显示 */ }
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>
                缩放:
                { viewportState.zoom.toFixed(2) }
                x
              </div>
              <div>
                平移: (
                { viewportState.pan.x.toFixed(0) }
                ,
                { viewportState.pan.y.toFixed(0) }
                )
              </div>
            </div>

            {/* 缩放控制 */ }
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">缩放:</span>
              <button
                onClick={ () => handleZoomTo(0.5) }
                className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
              >
                50%
              </button>
              <button
                onClick={ () => handleZoomTo(1) }
                className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
              >
                100%
              </button>
              <button
                onClick={ () => handleZoomTo(2) }
                className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
              >
                200%
              </button>
            </div>

            {/* 重置视口 */ }
            <button
              onClick={ handleResetViewport }
              className="rounded-md bg-purple-500 px-4 py-2 text-sm text-white font-medium transition-colors hover:bg-purple-600"
            >
              重置视口
            </button>
          </div>
        </div>

        {/* 工具栏容器 */ }
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

        {/* 画布区域 */ }
        <CanvasArea
          canvasContainerRef={ canvasContainerRef }
        />

        {/* addShape 方法测试区域 */ }
        <AddShapeSection noteBoardRef={ noteBoardRef } />

        {/* 快捷键提示按钮 */ }
        <ShortcutButton onClick={ () => setShowShortcutModal(true) } />

        {/* 功能说明卡片 */ }
        <div className="border border-gray-200/50 rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
          <h3 className="mb-4 text-lg text-gray-900 font-semibold dark:text-white">
            ✨ NoteBoard2 新功能特性
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400">
            <div>
              <h4 className="mb-2 text-gray-900 font-medium dark:text-white">🎯 核心升级</h4>
              <ul className="space-y-1">
                <li>• 使用 Canvas API 替代 CSS transform</li>
                <li>• 真正的世界坐标系统</li>
                <li>• 鼠标中心缩放</li>
                <li>• 无限平移和缩放</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-gray-900 font-medium dark:text-white">🔧 兼容性</h4>
              <ul className="space-y-1">
                <li>• 保持所有现有功能</li>
                <li>• 可切换无限画布模式</li>
                <li>• API 完全兼容</li>
                <li>• 性能显著提升</li>
              </ul>
            </div>
          </div>
        </div>

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
