import { HalftoneWave } from '@jl-org/cvs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { cn } from '@/utils'

export default function HalftoneWaveTest() {
  const [halftoneWave, setHalftoneWave] = useState<HalftoneWave | null>(null)
  const [config, setConfig] = useState({
    width: 800,
    height: 600,
    gridSize: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    waveColor: 'rgba(255, 255, 255, 0.5)',
    waveSpeed: 0.05,
    waveAmplitude: 0.8,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 预设配置
  const presets = [
    {
      name: '默认效果',
      config: {
        width: 800,
        height: 600,
        gridSize: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        waveColor: 'rgba(255, 255, 255, 0.5)',
        waveSpeed: 0.05,
        waveAmplitude: 0.8,
      },
    },
    {
      name: '密集网格',
      config: {
        width: 800,
        height: 600,
        gridSize: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        waveColor: 'rgba(100, 200, 255, 0.6)',
        waveSpeed: 0.03,
        waveAmplitude: 0.9,
      },
    },
    {
      name: '大网格',
      config: {
        width: 800,
        height: 600,
        gridSize: 40,
        backgroundColor: 'rgba(20, 20, 40, 0.3)',
        waveColor: 'rgba(255, 100, 100, 0.7)',
        waveSpeed: 0.08,
        waveAmplitude: 0.6,
      },
    },
    {
      name: '快速波浪',
      config: {
        width: 800,
        height: 600,
        gridSize: 15,
        backgroundColor: 'rgba(10, 10, 10, 0.15)',
        waveColor: 'rgba(255, 255, 100, 0.8)',
        waveSpeed: 0.12,
        waveAmplitude: 1.0,
      },
    },
  ]

  // 颜色主题
  const colorThemes = [
    {
      name: '经典黑白',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      waveColor: 'rgba(255, 255, 255, 0.5)',
    },
    {
      name: '蓝色主题',
      backgroundColor: 'rgba(0, 20, 40, 0.2)',
      waveColor: 'rgba(100, 200, 255, 0.6)',
    },
    {
      name: '红色主题',
      backgroundColor: 'rgba(40, 0, 0, 0.2)',
      waveColor: 'rgba(255, 100, 100, 0.7)',
    },
    {
      name: '绿色主题',
      backgroundColor: 'rgba(0, 40, 20, 0.2)',
      waveColor: 'rgba(100, 255, 150, 0.6)',
    },
    {
      name: '紫色主题',
      backgroundColor: 'rgba(20, 0, 40, 0.2)',
      waveColor: 'rgba(200, 100, 255, 0.6)',
    },
  ]

  const [selectedColorTheme, setSelectedColorTheme] = useState(0)

  // 初始化半调波浪
  const initHalftoneWave = () => {
    if (!canvasRef.current) return

    // 销毁之前的实例
    if (halftoneWave) {
      halftoneWave.destroy()
    }

    const halftoneWaveInstance = new HalftoneWave(canvasRef.current, config)
    setHalftoneWave(halftoneWaveInstance)
  }

  // 应用预设
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
    setTimeout(() => {
      initHalftoneWave()
    }, 100)
  }

  // 更新配置
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    setTimeout(() => {
      initHalftoneWave()
    }, 100)
  }

  // 切换颜色主题
  const changeColorTheme = (index: number) => {
    setSelectedColorTheme(index)
    const theme = colorThemes[index]
    const newConfig = {
      ...config,
      backgroundColor: theme.backgroundColor,
      waveColor: theme.waveColor,
    }
    setConfig(newConfig)

    setTimeout(() => {
      initHalftoneWave()
    }, 100)
  }

  // 初始化
  useEffect(() => {
    initHalftoneWave()

    return () => {
      if (halftoneWave) {
        halftoneWave.destroy()
      }
    }
  }, [])

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (halftoneWave) {
        halftoneWave.onResize(config.width, config.height)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [halftoneWave, config.width, config.height])

  return (
    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🌀 半调波浪效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 半调波浪动画效果，通过网格点阵创建波浪扩散的视觉效果
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1">
          <Card className="p-6 min-h-[600px]">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              半调波浪效果展示
            </h2>
            <div className="flex justify-center items-center min-h-[500px]">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </Card>
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-full lg:w-96">
          <Card>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                控制面板
              </h2>

              {/* 预设配置 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  预设效果
                </h3>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      onClick={() => applyPreset(preset.config)}
                      size="sm"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 颜色主题 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  颜色主题
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colorThemes.map((theme, index) => (
                    <Button
                      key={index}
                      onClick={() => changeColorTheme(index)}
                      variant={selectedColorTheme === index ? 'primary' : 'default'}
                      size="sm"
                    >
                      {theme.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 参数配置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  参数配置
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    画布宽度
                  </label>
                  <Input
                    type="number"
                    value={config.width}
                    onChange={(e) => updateConfig('width', Number(e.target.value))}
                    min={400}
                    max={1200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    画布高度
                  </label>
                  <Input
                    type="number"
                    value={config.height}
                    onChange={(e) => updateConfig('height', Number(e.target.value))}
                    min={300}
                    max={800}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    网格大小
                  </label>
                  <Input
                    type="number"
                    value={config.gridSize}
                    onChange={(e) => updateConfig('gridSize', Number(e.target.value))}
                    min={5}
                    max={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    波浪速度
                  </label>
                  <Input
                    type="number"
                    value={config.waveSpeed}
                    onChange={(e) => updateConfig('waveSpeed', Number(e.target.value))}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    波浪幅度
                  </label>
                  <Input
                    type="number"
                    value={config.waveAmplitude}
                    onChange={(e) => updateConfig('waveAmplitude', Number(e.target.value))}
                    min={0.1}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    背景颜色
                  </label>
                  <Input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    placeholder="rgba(0, 0, 0, 0.1)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    波浪颜色
                  </label>
                  <Input
                    type="text"
                    value={config.waveColor}
                    onChange={(e) => updateConfig('waveColor', e.target.value)}
                    placeholder="rgba(255, 255, 255, 0.5)"
                  />
                </div>

                {/* 使用说明 */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                    参数说明
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <strong>网格大小：</strong>
                      控制点阵的密度，值越小点越密集
                    </div>
                    <div>
                      <strong>波浪速度：</strong>
                      动画播放的快慢，值越大动画越快
                    </div>
                    <div>
                      <strong>波浪幅度：</strong>
                      点大小变化的范围，值越大变化越明显
                    </div>
                    <div>
                      <strong>颜色配置：</strong>
                      支持 rgba 格式，可调节透明度
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
