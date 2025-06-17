import { NoteBoard, createCvs } from '@jl-org/cvs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

export default function Test() {
  const containerRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<NoteBoard | null>(null)
  const [currentMode, setCurrentMode] = useState<'draw' | 'erase' | 'drag' | 'rect' | 'circle' | 'arrow' | 'none'>('draw')
  const [config, setConfig] = useState({
    lineWidth: 30,
    strokeStyle: '#409eff55',
    globalCompositeOperation: 'xor' as GlobalCompositeOperation,
  })

  const WIDTH = 800
  const HEIGHT = 600

  useEffect(() => {
    if (!containerRef.current) return

    // 创建画板实例
    const board = new NoteBoard({
      el: containerRef.current,
      width: WIDTH,
      height: HEIGHT,
      lineWidth: config.lineWidth,
      strokeStyle: config.strokeStyle,
      globalCompositeOperation: config.globalCompositeOperation,

      onWheel({ scale }) {
        console.log('onWheel 同步笔刷大小')
        if (scale < 1) return

        board.setStyle({
          lineWidth: config.lineWidth / scale
        })
        board.setCursor()
      },
    })

    boardRef.current = board

    // 绘制示例图片
    board.drawImg(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD4KPC9zdmc+',
      {
        center: true,
        autoFit: true,
      },
    )

    return () => {
      board.rmEvent?.()
    }
  }, [config])

  const handleModeChange = (mode: typeof currentMode) => {
    if (boardRef.current) {
      boardRef.current.setMode(mode)
      setCurrentMode(mode)
    }
  }

  const handleConfigChange = (key: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    if (boardRef.current) {
      boardRef.current.setStyle({ [key]: value })
    }
  }

  const handleUndo = () => {
    boardRef.current?.undo()
  }

  const handleRedo = () => {
    boardRef.current?.redo()
  }

  const handleClear = () => {
    boardRef.current?.clear()
  }

  const handleResetSize = () => {
    boardRef.current?.resetSize()
  }

  const handleExportImg = async () => {
    if (!boardRef.current) return
    const src = await boardRef.current.exportImg({ exportOnlyImgArea: true })
    const link = document.createElement('a')
    link.download = 'noteboard-export.png'
    link.href = src
    link.click()
  }

  const handleExportMask = async () => {
    if (!boardRef.current) return
    const src = await boardRef.current.exportMask({ exportOnlyImgArea: true })
    const link = document.createElement('a')
    link.download = 'noteboard-mask.png'
    link.href = src
    link.click()
  }

  const handleExportAllLayer = async () => {
    if (!boardRef.current) return
    const src = await boardRef.current.exportAllLayer({ exportOnlyImgArea: true })
    const link = document.createElement('a')
    link.download = 'noteboard-all-layers.png'
    link.href = src
    link.click()
  }

  const handleAddRedCanvas = () => {
    if (!boardRef.current) return
    const { ctx, cvs } = createCvs()
    boardRef.current.addCanvas('redCanvs', {
      canvas: cvs,
    })

    ctx.scale(NoteBoard.dpr, NoteBoard.dpr)
    ctx.fillStyle = '#f405'
    ctx.fillRect(0, 0, cvs.width, cvs.height)
  }

  const setShapeStyle = (fillStyle: string, strokeStyle: string) => {
    if (boardRef.current) {
      boardRef.current.drawShape.setShapeStyle({
        fillStyle,
        lineWidth: 2,
        strokeStyle,
      })
    }
  }

  const modeButtons = [
    { mode: 'draw' as const, label: '绘制', variant: 'primary' as const },
    { mode: 'erase' as const, label: '擦除', variant: 'warning' as const },
    { mode: 'drag' as const, label: '拖拽', variant: 'info' as const },
    { mode: 'none' as const, label: '无操作', variant: 'default' as const },
  ]

  const shapeButtons = [
    { mode: 'rect' as const, label: '矩形', fillStyle: '#fff', strokeStyle: '#409eff' },
    { mode: 'circle' as const, label: '圆形', fillStyle: '#f405', strokeStyle: '#000' },
    { mode: 'arrow' as const, label: '箭头', fillStyle: '#000', strokeStyle: '#000' },
  ]

  return (
    <div className="flex size-full bg-gray-50">
      {/* 左侧控制面板 */}
      <div className="w-80 p-6 bg-white shadow-lg overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">图像编辑画板</h1>

        <Card className="mb-6 border-gray-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">绘制配置</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  笔刷大小: {config.lineWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={config.lineWidth}
                  onChange={(e) => handleConfigChange('lineWidth', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  笔刷颜色
                </label>
                <input
                  type="color"
                  value={config.strokeStyle.replace('55', '')}
                  onChange={(e) => handleConfigChange('strokeStyle', e.target.value + '55')}
                  className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  混合模式
                </label>
                <select
                  value={config.globalCompositeOperation}
                  onChange={(e) => handleConfigChange('globalCompositeOperation', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="source-over">正常</option>
                  <option value="xor">异或</option>
                  <option value="multiply">正片叠底</option>
                  <option value="screen">滤色</option>
                  <option value="overlay">叠加</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 border-gray-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">操作模式</h3>

            <div className="grid grid-cols-2 gap-2">
              {modeButtons.map((btn) => (
                <Button
                  key={btn.mode}
                  onClick={() => handleModeChange(btn.mode)}
                  variant={currentMode === btn.mode ? btn.variant : 'default'}
                  className="text-sm"
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="mb-6 border-gray-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">形状绘制</h3>

            <div className="space-y-2">
              {shapeButtons.map((btn) => (
                <Button
                  key={btn.mode}
                  onClick={() => {
                    setShapeStyle(btn.fillStyle, btn.strokeStyle)
                    handleModeChange(btn.mode)
                  }}
                  variant={currentMode === btn.mode ? 'primary' : 'default'}
                  className="w-full text-sm"
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="mb-6 border-gray-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">操作控制</h3>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleUndo} variant="info" className="text-sm">
                  撤销
                </Button>
                <Button onClick={handleRedo} variant="info" className="text-sm">
                  重做
                </Button>
              </div>

              <Button onClick={handleClear} variant="danger" className="w-full text-sm">
                清空画布
              </Button>

              <Button onClick={handleResetSize} variant="default" className="w-full text-sm">
                重置大小
              </Button>

              <Button onClick={handleAddRedCanvas} variant="warning" className="w-full text-sm">
                添加红色图层
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-gray-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">导出功能</h3>

            <div className="space-y-2">
              <Button onClick={handleExportImg} variant="success" className="w-full text-sm">
                导出图片
              </Button>
              <Button onClick={handleExportMask} variant="success" className="w-full text-sm">
                导出蒙版
              </Button>
              <Button onClick={handleExportAllLayer} variant="success" className="w-full text-sm">
                导出所有图层
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 右侧画布区域 */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div
          ref={containerRef}
          className="border-2 border-gray-300 rounded-lg shadow-lg bg-white"
          style={{ width: WIDTH, height: HEIGHT }}
        />
      </div>
    </div>
  )
}