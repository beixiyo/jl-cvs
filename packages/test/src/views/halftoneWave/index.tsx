import { HalftoneWave } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input, NumberInput } from '@/components/Input'

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

  /** 颜色主题 */
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

  const initHalftoneWave = useCallback(() => {
    if (!canvasRef.current)
      return

    setHalftoneWave((prev) => {
      if (prev)
        prev.destroy()

      return new HalftoneWave(canvasRef.current!, config)
    })
  }, [config])

  const debouncedInit = useCallback(debounce(initHalftoneWave, 40), [initHalftoneWave])

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }

    if (key === 'backgroundColor' || key === 'waveColor') {
      const themeIndex = colorThemes.findIndex(
        theme =>
          theme.backgroundColor === newConfig.backgroundColor
          && theme.waveColor === newConfig.waveColor,
      )
      setSelectedColorTheme(themeIndex)
    }

    setConfig(newConfig)
  }

  /** 切换颜色主题 */
  const changeColorTheme = (index: number) => {
    setSelectedColorTheme(index)
    const theme = colorThemes[index]
    const newConfig = {
      ...config,
      backgroundColor: theme.backgroundColor,
      waveColor: theme.waveColor,
    }
    setConfig(newConfig)
  }

  /** 初始化和响应配置变化 */
  useEffect(() => {
    debouncedInit()

    return () => {
      if (halftoneWave) {
        halftoneWave.destroy()
      }
    }
  }, [debouncedInit])

  /** 处理窗口大小变化 */
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
    <div className="min-h-screen from-gray-50 to-indigo-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          🌀 半调波浪效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 半调波浪动画效果，通过网格点阵创建波浪扩散的视觉效果
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1">
          <Card className="min-h-[600px] p-6">
            <h2 className="mb-6 text-center text-2xl text-gray-800 font-semibold dark:text-white">
              半调波浪效果展示
            </h2>
            <div className="min-h-[500px] flex items-center justify-center">
              <canvas
                ref={ canvasRef }
                className="border border-gray-300 rounded-lg shadow-xl dark:border-gray-600"
                style={ { maxWidth: '100%', height: 'auto' } }
              />
            </div>
          </Card>
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-full lg:w-96">
          <Card>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
                控制面板
              </h2>

              {/* 颜色主题 */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  颜色主题
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colorThemes.map((theme, index) => (
                    <Button
                      key={ index }
                      onClick={ () => changeColorTheme(index) }
                      variant={ selectedColorTheme === index
                        ? 'primary'
                        : 'default' }
                      size="sm"
                    >
                      {theme.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 参数配置 */}
              <div className="space-y-4">
                <h3 className="text-lg text-gray-700 font-medium dark:text-gray-200">
                  参数配置
                </h3>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    画布宽度
                  </label>
                  <NumberInput
                    value={ config.width }
                    onChange={ v => updateConfig('width', Number(v)) }
                    min={ 400 }
                    max={ 1200 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    画布高度
                  </label>
                  <NumberInput
                    value={ config.height }
                    onChange={ v => updateConfig('height', Number(v)) }
                    min={ 300 }
                    max={ 800 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    网格大小
                  </label>
                  <NumberInput
                    value={ config.gridSize }
                    onChange={ v => updateConfig('gridSize', Number(v)) }
                    min={ 5 }
                    max={ 100 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    波浪速度
                  </label>
                  <NumberInput
                    value={ config.waveSpeed }
                    onChange={ v =>
                      updateConfig('waveSpeed', Number(v)) }
                    min={ 0.01 }
                    max={ 0.5 }
                    step={ 0.01 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    波浪幅度
                  </label>
                  <NumberInput
                    value={ config.waveAmplitude }
                    onChange={ v =>
                      updateConfig('waveAmplitude', Number(v)) }
                    min={ 0.1 }
                    max={ 2 }
                    step={ 0.1 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    背景颜色
                  </label>
                  <input
                    type="color"
                    value={ config.backgroundColor }
                    onChange={ e => updateConfig('backgroundColor', e.target.value) }
                    placeholder="rgba(0, 0, 0, 0.1)"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    波浪颜色
                  </label>
                  <input
                    type="color"
                    value={ config.waveColor }
                    onChange={ e => updateConfig('waveColor', e.target.value) }
                    placeholder="rgba(255, 255, 255, 0.5)"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
