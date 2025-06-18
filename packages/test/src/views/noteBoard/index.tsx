import { NoteBoard } from '@jl-org/cvs'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Slider } from '@/components/Slider'
import { Uploader, type FileItem } from '@/components/Uploader'
import { cn } from '@/utils'
import { downloadByUrl } from '@jl-org/tool'

type Mode = 'draw' | 'erase' | 'drag' | 'none' | 'rect' | 'circle' | 'arrow'

export default function NoteBoardTest() {
  const [noteBoard, setNoteBoard] = useState<NoteBoard | null>(null)
  const [currentMode, setCurrentMode] = useState<Mode>('draw')
  const [config, setConfig] = useState({
    strokeStyle: '#000000',
    lineWidth: 2,
    fillStyle: '#ff0000',
    lineCap: 'round' as CanvasLineCap,
  })

  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 模式选项
  const modeOptions = [
    { value: 'draw', label: '✏️ 绘制', color: 'bg-blue-500' },
    { value: 'erase', label: '🧽 擦除', color: 'bg-red-500' },
    { value: 'drag', label: '✋ 拖拽', color: 'bg-green-500' },
    { value: 'rect', label: '⬜ 矩形', color: 'bg-purple-500' },
    { value: 'circle', label: '⭕ 圆形', color: 'bg-yellow-500' },
    { value: 'arrow', label: '➡️ 箭头', color: 'bg-pink-500' },
    { value: 'none', label: '🚫 无操作', color: 'bg-gray-500' },
  ]

  // 预设颜色
  const presetColors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ]

  // 初始化画板
  useEffect(() => {
    if (!canvasContainerRef.current) return

    const board = new NoteBoard({
      el: canvasContainerRef.current,
      width: 800,
      height: 600,
      strokeStyle: config.strokeStyle,
      lineWidth: config.lineWidth,
      fillStyle: config.fillStyle,
      lineCap: config.lineCap,
      onMouseDown: (e) => {
        console.log('Mouse down:', e)
      },
      onMouseMove: (e) => {
        // console.log('Mouse move:', e)
      },
      onMouseUp: (e) => {
        console.log('Mouse up:', e)
      },
      onWheel: ({ scale, e }) => {
        console.log('Wheel:', scale)
      },
      onDrag: ({ translateX, translateY }) => {
        console.log('Drag:', translateX, translateY)
      },
      onUndo: (params) => {
        console.log('Undo:', params)
      },
      onRedo: (params) => {
        console.log('Redo:', params)
      },
    })

    setNoteBoard(board)

    return () => {
      board.rmEvent()
    }
  }, [])

  // 更新画板配置
  useEffect(() => {
    if (!noteBoard) return

    noteBoard.setStyle({
      strokeStyle: config.strokeStyle,
      lineWidth: config.lineWidth,
      fillStyle: config.fillStyle,
      lineCap: config.lineCap,
    })
  }, [noteBoard, config])

  // 切换模式
  const handleModeChange = (mode: Mode) => {
    if (!noteBoard) return
    setCurrentMode(mode)
    noteBoard.setMode(mode)
  }

  // 撤销
  const handleUndo = () => {
    if (!noteBoard) return
    noteBoard.undo()
  }

  // 重做
  const handleRedo = () => {
    if (!noteBoard) return
    noteBoard.redo()
  }

  // 清空画布
  const handleClear = () => {
    if (!noteBoard) return
    noteBoard.clear()
  }

  // 导出图片
  const handleExport = async () => {
    if (!noteBoard) return
    const dataURL = await noteBoard.exportImg()
    downloadByUrl(dataURL, 'noteBoard.png')
  }

  // 上传图片
  const handleImageUpload = (file: FileItem[]) => {
    if (!noteBoard) return

    noteBoard.drawImg(file[0].base64, {
      center: true,
      autoFit: true,
      needClear: true,
    })
  }

  // 更新配置
  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 h-screen overflow-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🎨 图像编辑画板
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          功能完整的 Canvas 画板组件，支持绘图、擦除、图形绘制、撤销重做等功能
        </p>
      </div>

      {/* 工具栏 */ }
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 模式切换 */ }
          <div className="flex flex-wrap gap-2">
            { modeOptions.map((option) => (
              <Button
                key={ option.value }
                onClick={ () => handleModeChange(option.value as Mode) }
                variant={ currentMode === option.value ? 'default' : 'primary' }
                className={ cn(
                  'text-sm',
                  currentMode === option.value && option.color
                ) }
              >
                { option.label }
              </Button>
            )) }
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 操作按钮 */ }
          <div className="flex gap-2">
            <Button onClick={ handleUndo } variant="primary" size="sm">
              ↶ 撤销
            </Button>
            <Button onClick={ handleRedo } variant="primary" size="sm">
              ↷ 重做
            </Button>
            <Button onClick={ handleClear } variant="primary" size="sm">
              🗑️ 清空
            </Button>
            <Button onClick={ handleExport } variant="primary" size="sm">
              💾 导出
            </Button>
          </div>
        </div>
      </Card>

      {/* 主要内容区域 */ }
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 画布区域 */ }
        <div className="lg:col-span-3">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              画布区域
            </h3>
            <div
              ref={ canvasContainerRef }
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
              style={ { width: '800px', height: '600px', maxWidth: '100%' } }
            />
          </Card>
        </div>

        {/* 配置面板 */ }
        <div className="space-y-4">
          {/* 画笔设置 */ }
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              画笔设置
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  线条宽度
                </label>
                <div className="px-2">
                  <Slider
                    min={1}
                    max={20}
                    value={config.lineWidth}
                    onChange={(value) => {
                      if (typeof value === 'number') {
                        updateConfig('lineWidth', value)
                      } else if (Array.isArray(value)) {
                        updateConfig('lineWidth', value[0])
                      }
                    }}
                    tooltip={{ formatter: (val) => `${val}px` }}
                  />
                </div>
                <span className="text-sm text-gray-500 mt-1 block">{ config.lineWidth }px</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  线条样式
                </label>
                <Select
                  value={ config.lineCap }
                  onChange={ (value) => updateConfig('lineCap', value) }
                  options={ [
                    { value: 'round', label: '圆形' },
                    { value: 'square', label: '方形' },
                    { value: 'butt', label: '平直' },
                  ] }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  描边颜色
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type="color"
                    value={ config.strokeStyle }
                    onChange={ (e) => updateConfig('strokeStyle', e.target.value) }
                    className="w-12 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={ config.strokeStyle }
                    onChange={ (e) => updateConfig('strokeStyle', e.target.value) }
                    className="flex-1"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1">
                  { presetColors.map((color) => (
                    <button
                      key={ color }
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                      style={ { backgroundColor: color } }
                      onClick={ () => updateConfig('strokeStyle', color) }
                    />
                  )) }
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  填充颜色
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={ config.fillStyle }
                    onChange={ (e) => updateConfig('fillStyle', e.target.value) }
                    className="w-12 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={ config.fillStyle }
                    onChange={ (e) => updateConfig('fillStyle', e.target.value) }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 图片上传 */ }
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              背景图片
            </h3>
            <Uploader
              accept="image/*"
              onChange={ handleImageUpload }
              className="w-full"
            >
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  点击或拖拽上传图片
                </p>
              </div>
            </Uploader>
          </Card>
        </div>
      </div>

      {/* 使用说明 */ }
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          功能说明
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300">
          <div>
            <h3 className="font-semibold mb-2">绘图模式</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>绘制：</strong>自由绘制线条</li>
              <li><strong>擦除：</strong>擦除已绘制内容</li>
              <li><strong>拖拽：</strong>拖拽移动画布</li>
              <li><strong>矩形：</strong>绘制矩形图形</li>
              <li><strong>圆形：</strong>绘制圆形图形</li>
              <li><strong>箭头：</strong>绘制箭头图形</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">快捷操作</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>撤销/重做：</strong>支持多步操作历史</li>
              <li><strong>缩放：</strong>鼠标滚轮缩放画布</li>
              <li><strong>导出：</strong>保存为 PNG 图片</li>
              <li><strong>背景图：</strong>上传图片作为背景</li>
              <li><strong>清空：</strong>清除所有绘制内容</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
