import type { FileItem } from '@/components/Uploader'
import { type Mode, NoteBoard } from '@jl-org/cvs'
import { downloadByUrl } from '@jl-org/tool'
import { motion } from 'framer-motion'
import { Download, Eye, Grid3X3, Image, Keyboard, List, Maximize2, Package } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Modal } from '@/components/Modal'
import { PreviewImg } from '@/components/PreviewImg'
import { Toolbar, type ToolbarMode } from '@/components/Toolbar'
import { BRUSH_COLOR, DEFAULT_STROKE_WIDTH } from '@/config'
import { onMounted, useGetState, useShortCutKey } from '@/hooks'
import { cn } from '@/utils'

export default function NoteBoardTest() {
  const [noteBoard, setNoteBoard] = useState<NoteBoard | null>(null)
  const [currentMode, setCurrentMode] = useState<Mode>('draw')
  const [config, setConfig] = useGetState({
    strokeStyle: BRUSH_COLOR,
    lineWidth: DEFAULT_STROKE_WIDTH,
    lineCap: 'round' as CanvasLineCap,
  }, true)

  /** 图像预览相关状态 */
  const [previewImages, setPreviewImages] = useState<Array<{
    src: string
    name: string
    type: 'img' | 'mask' | 'all'
  }>>([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [showShortcutModal, setShowShortcutModal] = useState(false)

  const isFirstRender = useRef(true)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  const width = 800
  const height = 600

  /** 模式选项 */
  const modeOptions: ToolbarMode[] = [
    { value: 'draw', label: '绘制', hasBrushSlider: true },
    { value: 'erase', label: '擦除', hasBrushSlider: true },
    { value: 'drag', label: '拖拽' },
    { value: 'rect', label: '矩形' },
    { value: 'circle', label: '圆形' },
    { value: 'arrow', label: '箭头' },
    { value: 'none', label: '无操作' },
  ]

  /** 快捷键配置 */
  const shortcutKeys = [
    { key: 'Ctrl + Z', desc: '撤销' },
    { key: 'Ctrl + Shift + Z', desc: '重做' },
    { key: 'Ctrl + 1', desc: '绘制模式' },
    { key: 'Ctrl + 2', desc: '擦除模式' },
    { key: 'Ctrl + 3', desc: '拖拽模式' },
    { key: 'Ctrl + 4', desc: '矩形模式' },
    { key: 'Ctrl + 5', desc: '圆形模式' },
    { key: 'Ctrl + 6', desc: '箭头模式' },
    { key: 'Ctrl + 0', desc: '无操作模式' },
    { key: 'Ctrl + E', desc: '导出图片' },
    { key: 'Ctrl + Shift + E', desc: '导出所有图层' },
    { key: 'Ctrl + R', desc: '重置大小' },
    { key: 'Ctrl + Delete', desc: '清空画布' },
  ]

  /** 初始化画板 */
  onMounted(() => {
    if (!canvasContainerRef.current)
      return

    const board = new NoteBoard({
      el: canvasContainerRef.current,
      width,
      height,
      strokeStyle: config.strokeStyle,
      lineWidth: config.lineWidth,
      lineCap: config.lineCap,
      globalCompositeOperation: 'xor',
      drawGlobalCompositeOperation: 'xor',
      shapeGlobalCompositeOperation: 'source-over',

      onMouseDown: (e) => { },
      onMouseMove: (e) => { },
      onMouseUp: (e) => { },
      onWheel: ({ scale, e }) => {
        syncBrushSize(scale)
      },
      onDrag: ({ translateX, translateY }) => { },
      onUndo: (params) => { },
      onRedo: (params) => { },
    })

    if (isFirstRender.current) {
      const imgURL = new URL('@/assets/img/umr.webp', import.meta.url).href
      board.drawImg(imgURL, {
        center: true,
        autoFit: true,
      })

      isFirstRender.current = false
    }

    setNoteBoard(board)

    return () => {
      board.rmEvent()
    }
  })

  /** 更新画板配置 */
  useEffect(() => {
    if (!noteBoard)
      return

    noteBoard.setStyle({
      strokeStyle: config.strokeStyle,
      lineWidth: config.lineWidth,
      lineCap: config.lineCap,
    })
  }, [noteBoard, config])

  useEffect(() => {
    syncBrushSize(undefined, config.lineWidth)
  }, [noteBoard, config.lineWidth])

  const syncBrushSize = (scale?: number, size?: number) => {
    if (!noteBoard)
      return

    if (scale !== undefined && scale > 1) {
      const lineWidth = setConfig.getLatest().lineWidth / scale
      noteBoard.setStyle({ lineWidth })
      noteBoard.setCursor()
      return
    }

    if (size !== undefined && size > 0) {
      noteBoard.setStyle({ lineWidth: size })
      noteBoard.setCursor()
      return
    }
  }

  /** 切换模式 */
  const handleModeChange = (mode: Mode) => {
    if (!noteBoard)
      return
    setCurrentMode(mode)
    noteBoard.setMode(mode)
  }

  /** 快捷键事件处理 */
  /** 撤销 Ctrl+Z */
  useShortCutKey({
    key: 'z',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleUndo()
    },
  })

  /** 重做 Ctrl+Shift+Z */
  useShortCutKey({
    key: 'z',
    ctrl: true,
    shift: true,
    fn: (e) => {
      e.preventDefault()
      handleRedo()
    },
  })

  /** 绘制模式 Ctrl+1 */
  useShortCutKey({
    key: '1',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleModeChange('draw')
    },
  })

  /** 擦除模式 Ctrl+2 */
  useShortCutKey({
    key: '2',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleModeChange('erase')
    },
  })

  /** 拖拽模式 Ctrl+3 */
  useShortCutKey({
    key: '3',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleModeChange('drag')
    },
  })

  /** 矩形模式 Ctrl+4 */
  useShortCutKey({
    key: '4',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleModeChange('rect')
    },
  })

  /** 圆形模式 Ctrl+5 */
  useShortCutKey({
    key: '5',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleModeChange('circle')
    },
  })

  /** 箭头模式 Ctrl+6 */
  useShortCutKey({
    key: '6',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleModeChange('arrow')
    },
  })

  /** 无操作模式 Ctrl+0 */
  useShortCutKey({
    key: '0',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleModeChange('none')
    },
  })

  /** 导出图片 Ctrl+E */
  useShortCutKey({
    key: 'e',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleExport()
    },
  })

  /** 导出所有图层 Ctrl+Shift+E */
  useShortCutKey({
    key: 'e',
    ctrl: true,
    shift: true,
    fn: (e) => {
      e.preventDefault()
      handleExportAll()
    },
  })

  /** 重置大小 Ctrl+R */
  useShortCutKey({
    key: 'r',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleResetSize()
    },
  })

  /** 清空画布 Ctrl+Delete */
  useShortCutKey({
    key: 'Delete',
    ctrl: true,
    fn: (e) => {
      e.preventDefault()
      handleClear()
    },
  })

  /** 撤销 */
  const handleUndo = () => {
    if (!noteBoard)
      return
    noteBoard.undo()
  }

  /** 重做 */
  const handleRedo = () => {
    if (!noteBoard)
      return
    noteBoard.redo()
  }

  /** 清空画布 */
  const handleClear = () => {
    if (!noteBoard)
      return
    noteBoard.clear()
  }

  /**
   * 单独导出图片和绘制内容
   */
  const handleExport = async () => {
    if (!noteBoard)
      return

    try {
      const src = await noteBoard.exportImg({ exportOnlyImgArea: true })
      const mask = await noteBoard.exportMask({ exportOnlyImgArea: true })

      const images = [
        { src, name: '背景图片', type: 'img' as const },
        { src: mask, name: '绘制内容', type: 'mask' as const },
      ]

      setPreviewImages(images)
      setShowPreviewModal(true)
    }
    catch (error) {
      console.error('导出图片失败:', error)
    }
  }

  /**
   * 导出所有图层
   */
  const handleExportAll = async () => {
    if (!noteBoard)
      return

    try {
      const src = await noteBoard.exportAllLayer({ exportOnlyImgArea: true })

      const images = [
        { src, name: '合成图片', type: 'all' as const },
      ]

      setPreviewImages(images)
      setShowPreviewModal(true)
    }
    catch (error) {
      console.error('导出所有图层失败:', error)
    }
  }

  /**
   * 重置大小
   */
  const handleResetSize = () => {
    if (!noteBoard)
      return
    noteBoard.resetSize()
  }

  /** 上传图片 */
  const handleImageUpload = (file: FileItem[]) => {
    if (!noteBoard)
      return

    noteBoard.clear(true)
    /**
     * 居中绘制图片，并自动拉伸大小
     */
    noteBoard.drawImg(file[0].base64, {
      center: true,
      autoFit: true,
      needRecordImgInfo: true,
    })
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
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

  return (
    <div className="min-h-screen from-purple-50 to-pink-50 bg-gradient-to-br p-6 space-y-6 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300">
          🎨 功能完整的 Canvas 画板组件，支持绘图、擦除、拖拽、图形绘制、撤销重做等功能
        </p>
      </div>

      {/* 工具栏 */ }
      <Toolbar
        modes={ modeOptions }
        activeMode={ currentMode }
        onModeChange={ handleModeChange as any }
        brushSize={ config.lineWidth }
        onBrushSizeChange={ val => updateConfig('lineWidth', val) }
        onImageUpload={ handleImageUpload }
        onExport={ handleExport }
        onExportAll={ handleExportAll }
        onUndo={ handleUndo }
        onRedo={ handleRedo }
        onClear={ handleClear }
        onResetSize={ handleResetSize }
      />

      {/* 快捷键提示按钮 */ }
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={ () => setShowShortcutModal(true) }
          variant="primary"
          size="sm"
          className="flex items-center gap-2 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600"
        >
          <Keyboard size={ 16 } />
          快捷键
        </Button>
      </div>

      {/* 主要内容区域 */ }
      <div className="grid grid-cols-1 gap-6">
        {/* 画布区域 */ }
        <div
          ref={ canvasContainerRef }
          className="overflow-hidden border-2 border-gray-300 rounded-lg border-dashed bg-slate-100 dark:border-gray-600 mx-auto"
          style={ { width, height } }
        />
      </div>

      {/* 使用说明 */ }
      <Card className="p-6">
        <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
          功能说明
        </h2>
        <div className="grid grid-cols-1 gap-6 text-gray-600 md:grid-cols-2 dark:text-gray-300">
          <div>
            <h3 className="mb-2 font-semibold">绘图模式</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>
                <strong>绘制：</strong>
                自由绘制线条
              </li>
              <li>
                <strong>擦除：</strong>
                擦除已绘制内容
              </li>
              <li>
                <strong>拖拽：</strong>
                右键拖拽移动画布
              </li>
              <li>
                <strong>矩形：</strong>
                绘制矩形图形
              </li>
              <li>
                <strong>圆形：</strong>
                绘制圆形图形
              </li>
              <li>
                <strong>箭头：</strong>
                绘制箭头图形
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">快捷操作</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>
                <strong>撤销/重做：</strong>
                支持多步操作历史 (Ctrl+Z / Ctrl+Shift+Z)
              </li>
              <li>
                <strong>快捷键：</strong>
                支持键盘快捷键操作，点击右下角快捷键按钮查看
              </li>
              <li>
                <strong>缩放：</strong>
                鼠标滚轮缩放画布
              </li>
              <li>
                <strong>导出：</strong>
                保存为 PNG 图片 (Ctrl+E)
              </li>
              <li>
                <strong>背景图：</strong>
                上传图片作为背景
              </li>
              <li>
                <strong>清空：</strong>
                清除所有绘制内容 (Ctrl+Delete)
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 图像预览模态框 */ }
      <Modal
        isOpen={ showPreviewModal }
        onClose={ handleClosePreview }
        titleText="🎨 导出图像预览"
        width={ 1000 }
        height={ 700 }
        footer={ null }
        bodyClassName="p-0"
      >
        <div className="h-full flex flex-col">
          {/* 工具栏 */ }
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Image size={ 16 } />
                <span>
                  { previewImages.length }
                  { ' ' }
                  张图片
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 视图切换按钮 */ }
              <Button
                onClick={ handleToggleViewMode }
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                { viewMode === 'grid'
                  ? <List size={ 16 } />
                  : <Grid3X3 size={ 16 } /> }
                { viewMode === 'grid'
                  ? '列表视图'
                  : '网格视图' }
              </Button>

              {/* 批量下载按钮 */ }
              { previewImages.length > 1 && (
                <Button
                  onClick={ () => {
                    previewImages.forEach((image, index) => {
                      setTimeout(() => {
                        handleDownloadImage(image.src, `${image.name}_${index + 1}`)
                      }, index * 100)
                    })
                  } }
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Package size={ 16 } />
                  批量下载
                </Button>
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
              { previewImages.map((image, index) => (
                <motion.div
                  key={ `${image.type}-${image.name}-${index}` }
                  initial={ { opacity: 0, y: 20 } }
                  animate={ { opacity: 1, y: 0 } }
                  transition={ { delay: index * 0.1 } }
                  className="group relative overflow-hidden border border-gray-200 rounded-xl bg-white shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl"
                >
                  {/* 图像头部信息 */ }
                  <div className="border-b border-gray-100 p-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={ cn(
                          'w-3 h-3 rounded-full',
                          image.type === 'img' && 'bg-blue-500',
                          image.type === 'mask' && 'bg-green-500',
                          image.type === 'all' && 'bg-purple-500',
                        ) } />
                        <div>
                          <h3 className="text-gray-900 font-semibold dark:text-white">
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
                        <Button
                          onClick={ () => handleFullscreenPreview(image.src) }
                          variant="primary"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye size={ 14 } />
                          预览
                        </Button>
                        <Button
                          onClick={ () => handleDownloadImage(image.src, image.name) }
                          variant="primary"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Download size={ 14 } />
                          下载
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 图像展示区域 */ }
                  <div className="relative p-4">
                    <div className="relative min-h-[200px] flex items-center justify-center rounded-lg from-gray-50 to-gray-100 bg-gradient-to-br p-4 dark:from-gray-700 dark:to-gray-800">
                      <img
                        src={ image.src }
                        alt={ image.name }
                        className="max-h-64 max-w-full cursor-pointer rounded-lg object-contain shadow-md transition-shadow hover:shadow-lg"
                        style={ {
                          imageRendering: 'pixelated',
                        } }
                        onClick={ () => handleFullscreenPreview(image.src) }
                      />

                      {/* 悬浮操作按钮 */ }
                      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          onClick={ () => handleFullscreenPreview(image.src) }
                          variant="primary"
                          size="sm"
                          className="border-0 bg-black/50 text-white hover:bg-black/70"
                        >
                          <Maximize2 size={ 16 } />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) }
            </div>
          </div>
        </div>
      </Modal>

      {/* 快捷键说明模态框 */ }
      <Modal
        isOpen={ showShortcutModal }
        onClose={ () => setShowShortcutModal(false) }
        titleText="⌨️ 快捷键说明"
        width={ 600 }
        height={ 500 }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            使用以下快捷键可以快速操作画板功能：
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* 基础操作 */ }
            <div>
              <h3 className="mb-3 text-lg text-gray-800 font-semibold dark:text-white">
                基础操作
              </h3>
              <div className="space-y-2">
                { shortcutKeys.slice(0, 2).map((shortcut, index) => (
                  <div
                    key={ index }
                    className="flex items-center justify-between border border-gray-200 rounded-lg bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      { shortcut.desc }
                    </span>
                    <kbd className="rounded bg-gray-200 px-2 py-1 text-sm text-gray-700 font-mono dark:bg-gray-600 dark:text-gray-300">
                      { shortcut.key }
                    </kbd>
                  </div>
                )) }
              </div>
            </div>

            {/* 绘图模式 */ }
            <div>
              <h3 className="mb-3 text-lg text-gray-800 font-semibold dark:text-white">
                绘图模式切换
              </h3>
              <div className="space-y-2">
                { shortcutKeys.slice(2, 9).map((shortcut, index) => (
                  <div
                    key={ index }
                    className="flex items-center justify-between border border-gray-200 rounded-lg bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      { shortcut.desc }
                    </span>
                    <kbd className="rounded bg-gray-200 px-2 py-1 text-sm text-gray-700 font-mono dark:bg-gray-600 dark:text-gray-300">
                      { shortcut.key }
                    </kbd>
                  </div>
                )) }
              </div>
            </div>

            {/* 高级功能 */ }
            <div>
              <h3 className="mb-3 text-lg text-gray-800 font-semibold dark:text-white">
                高级功能
              </h3>
              <div className="space-y-2">
                { shortcutKeys.slice(9).map((shortcut, index) => (
                  <div
                    key={ index }
                    className="flex items-center justify-between border border-gray-200 rounded-lg bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      { shortcut.desc }
                    </span>
                    <kbd className="rounded bg-gray-200 px-2 py-1 text-sm text-gray-700 font-mono dark:bg-gray-600 dark:text-gray-300">
                      { shortcut.key }
                    </kbd>
                  </div>
                )) }
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 **提示**：快捷键在画板获得焦点时生效，确保鼠标在画板区域内或点击画板后再使用快捷键。
            </p>
          </div>
        </div>
      </Modal>

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
