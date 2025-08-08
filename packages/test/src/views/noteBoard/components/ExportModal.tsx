import type { ExportImage } from '../hooks/useImageExport'
import { motion } from 'framer-motion'
import { Download, Eye, Grid3X3, Image, List, Maximize2, Package } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { cn } from '@/utils'

export interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  images: ExportImage[]
  viewMode: 'grid' | 'list'
  onToggleViewMode: () => void
  onDownloadImage: (src: string, name: string) => void
  onFullscreenPreview: (src: string) => void
}

export function ExportModal({
  isOpen,
  onClose,
  images,
  viewMode,
  onToggleViewMode,
  onDownloadImage,
  onFullscreenPreview,
}: ExportModalProps) {
  return (
    <Modal
      isOpen={ isOpen }
      onClose={ onClose }
      titleText="🎨 导出图像预览"
      width={ 1000 }
      height={ 700 }
      footer={ null }
      bodyClassName="p-0"
    >
      <div className="h-full flex flex-col from-gray-50 to-gray-100 bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
        {/* 工具栏 */ }
        <div className="flex items-center justify-between border-b border-gray-200/50 bg-white/80 p-6 backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl from-blue-500 to-purple-600 bg-gradient-to-r">
                <Image size={ 20 } className="text-white" />
              </div>
              <div>
                <h3 className="text-gray-800 font-semibold dark:text-white">
                  导出结果
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  { images.length }
                  { ' ' }
                  张图片
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 视图切换按钮 */ }
            <button
              onClick={ onToggleViewMode }
              className="flex items-center gap-2 border border-gray-200/50 rounded-xl bg-white/70 px-4 py-2 text-sm text-gray-700 font-medium backdrop-blur-sm transition-all duration-300 dark:border-gray-600/50 dark:bg-gray-700/70 hover:bg-white/90 dark:text-gray-300 dark:hover:bg-gray-700/90"
            >
              { viewMode === 'grid'
                ? <List size={ 16 } />
                : <Grid3X3 size={ 16 } /> }
              { viewMode === 'grid'
                ? '列表视图'
                : '网格视图' }
            </button>

            {/* 批量下载按钮 */ }
            { images.length > 1 && (
              <button
                onClick={ () => {
                  images.forEach((image, index) => {
                    setTimeout(() => {
                      onDownloadImage(image.src, `${image.name}_${index + 1}`)
                    }, index * 100)
                  })
                } }
                className="flex items-center gap-2 rounded-xl from-indigo-500 to-purple-600 bg-gradient-to-r px-4 py-2 text-sm text-white font-medium shadow-lg transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl"
              >
                <Package size={ 16 } />
                批量下载
              </button>
            ) }
          </div>
        </div>

        {/* 图像展示区域 */ }
        <div className="flex-1 overflow-y-auto p-6">
          <div className={ cn(
            'gap-6',
            viewMode === 'grid'
              ? 'grid grid-cols-1 lg:grid-cols-2'
              : 'flex flex-col space-y-6',
          ) }>
            { images.map((image, index) => (
              <motion.div
                key={ `${image.type}-${image.name}-${index}` }
                initial={ { opacity: 0, y: 20 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { delay: index * 0.1 } }
                className="group relative overflow-hidden border border-white/30 rounded-2xl bg-white/70 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] dark:border-gray-700/30 dark:bg-gray-800/70 hover:shadow-2xl"
              >
                {/* 图像头部信息 */ }
                <div className="border-b border-gray-100/50 p-6 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={ cn(
                        'w-4 h-4 rounded-full shadow-lg',
                        image.type === 'img' && 'bg-gradient-to-r from-blue-500 to-blue-600',
                        image.type === 'mask' && 'bg-gradient-to-r from-green-500 to-green-600',
                        image.type === 'all' && 'bg-gradient-to-r from-purple-500 to-purple-600',
                      ) } />
                      <div>
                        <h3 className="text-lg text-gray-900 font-semibold dark:text-white">
                          { image.name }
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          { image.type === 'img' && '背景图片层' }
                          { image.type === 'mask' && '绘制内容层' }
                          { image.type === 'all' && '所有图层合成' }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={ () => onFullscreenPreview(image.src) }
                        className="flex items-center gap-2 border border-gray-200/50 rounded-xl bg-white/70 px-3 py-2 text-sm text-gray-700 font-medium backdrop-blur-sm transition-all duration-300 dark:border-gray-600/50 dark:bg-gray-700/70 hover:bg-white/90 dark:text-gray-300 dark:hover:bg-gray-700/90"
                      >
                        <Eye size={ 14 } />
                        预览
                      </button>
                      <button
                        onClick={ () => onDownloadImage(image.src, image.name) }
                        className="flex items-center gap-2 rounded-xl from-indigo-500 to-purple-600 bg-gradient-to-r px-3 py-2 text-sm text-white font-medium transition-all duration-300 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <Download size={ 14 } />
                        下载
                      </button>
                    </div>
                  </div>
                </div>

                {/* 图像展示区域 */ }
                <div className="relative p-6">
                  <div className="relative min-h-[200px] flex items-center justify-center rounded-2xl from-gray-50/50 to-gray-100/50 bg-gradient-to-br p-6 backdrop-blur-sm dark:from-gray-700/50 dark:to-gray-800/50">
                    <img
                      src={ image.src }
                      alt={ image.name }
                      className="max-h-64 max-w-full cursor-pointer rounded-xl object-contain shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                      style={ {
                        imageRendering: 'pixelated',
                      } }
                      onClick={ () => onFullscreenPreview(image.src) }
                    />

                    {/* 悬浮操作按钮 */ }
                    <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={ () => onFullscreenPreview(image.src) }
                        className="rounded-xl bg-black/20 p-2 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/40"
                      >
                        <Maximize2 size={ 16 } />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) }
          </div>
        </div>
      </div>
    </Modal>
  )
}
