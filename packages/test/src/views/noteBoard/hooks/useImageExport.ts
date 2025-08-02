import type { NoteBoard } from '@jl-org/cvs'
import { downloadByUrl } from '@jl-org/tool'
import { type MutableRefObject, useState } from 'react'

export interface ExportImage {
  src: string
  name: string
  type: 'img' | 'mask' | 'all'
}

export function useImageExport(noteBoardRef: MutableRefObject<NoteBoard | undefined>) {
  const [previewImages, setPreviewImages] = useState<ExportImage[]>([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  /** 单独导出图片和绘制内容 */
  const handleExport = async () => {
    const noteBoard = noteBoardRef.current
    if (!noteBoard)
      return

    try {
      const src = await noteBoard.exportImg({ exportOnlyImgArea: true })
      const mask = await noteBoard.exportMask({ exportOnlyImgArea: true })

      const images: ExportImage[] = [
        { src, name: '背景图片', type: 'img' },
        { src: mask, name: '绘制内容', type: 'mask' },
      ]

      setPreviewImages(images)
      setShowPreviewModal(true)
    }
    catch (error) {
      console.error('导出图片失败:', error)
    }
  }

  /** 导出所有图层 */
  const handleExportAll = async () => {
    const noteBoard = noteBoardRef.current
    if (!noteBoard)
      return

    try {
      const src = await noteBoard.exportAllLayer({ exportOnlyImgArea: true })

      const images: ExportImage[] = [
        { src, name: '合成图片', type: 'all' },
      ]

      setPreviewImages(images)
      setShowPreviewModal(true)
    }
    catch (error) {
      console.error('导出所有图层失败:', error)
    }
  }

  /** 下载图片 */
  const handleDownloadImage = (src: string, name: string) => {
    try {
      downloadByUrl(src, `${name}_${Date.now()}.png`)
    }
    catch (error) {
      console.error('下载图片失败:', error)
    }
  }

  /** 关闭预览模态框 */
  const handleClosePreview = () => {
    setShowPreviewModal(false)
    setPreviewImages([])
  }

  /** 打开全屏预览 */
  const handleFullscreenPreview = (src: string) => {
    setFullscreenImage(src)
  }

  /** 关闭全屏预览 */
  const handleCloseFullscreen = () => {
    setFullscreenImage(null)
  }

  /** 切换视图模式 */
  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'grid'
      ? 'list'
      : 'grid')
  }

  return {
    /** 状态 */
    previewImages,
    showPreviewModal,
    viewMode,
    fullscreenImage,

    /** 操作方法 */
    handleExport,
    handleExportAll,
    handleDownloadImage,
    handleClosePreview,
    handleFullscreenPreview,
    handleCloseFullscreen,
    handleToggleViewMode,
  }
}
