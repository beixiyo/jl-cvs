import { StarField } from '@jl-org/cvs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { NumberInput } from '@/components/Input'
import { useGetState } from '@/hooks'

export default function StarFieldTest() {
  const [starField, setStarField] = useState<StarField | null>(null)
  const [config, setConfig] = useGetState({
    starCount: 300,
    sizeRange: [0.5, 2] as [number, number],
    speedRange: 0.1,
    backgroundColor: '#001122',
    flickerSpeed: 0.01,
    width: 800,
    height: 600,
    name: '默认星空',
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  /** 预设配置 */
  const presets = [
    {
      name: '默认星空',
      starCount: 300,
      sizeRange: [0.5, 2] as [number, number],
      speedRange: 0.1,
      backgroundColor: '#001122',
      flickerSpeed: 0.01,
      width: 800,
      height: 600,
    },
    {
      name: '密集星空',
      starCount: 500,
      sizeRange: [0.3, 1.5] as [number, number],
      speedRange: 0.05,
      backgroundColor: '#000011',
      flickerSpeed: 0.02,
      width: 800,
      height: 600,
    },
    {
      name: '大星星',
      starCount: 150,
      sizeRange: [1, 4] as [number, number],
      speedRange: 0.2,
      backgroundColor: '#001133',
      flickerSpeed: 0.005,
      width: 800,
      height: 600,
    },
    {
      name: '快速移动',
      starCount: 200,
      sizeRange: [0.5, 2] as [number, number],
      speedRange: 0.5,
      backgroundColor: '#000022',
      flickerSpeed: 0.03,
      width: 800,
      height: 600,
    },
  ]

  /** 颜色主题 */
  const colorThemes = [
    {
      name: '经典白色',
      colors: ['#ffffff', '#ffe9c4', '#d4fbff'],
    },
    {
      name: '暖色调',
      colors: ['#ffddaa', '#ffcc88', '#ff9966'],
    },
    {
      name: '冷色调',
      colors: ['#aaddff', '#88ccff', '#6699ff'],
    },
    {
      name: '彩虹色',
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'],
    },
    {
      name: '紫色系',
      colors: ['#a8e6cf', '#dda0dd', '#98d8c8', '#f7dc6f'],
    },
  ]

  const [selectedColorTheme, setSelectedColorTheme] = useGetState(0, true)

  /** 初始化星空 */
  const initStarField = () => {
    if (!canvasRef.current)
      return

    const currentColorTheme = colorThemes[setSelectedColorTheme.getLatest()]
    const starFieldInstance = new StarField(canvasRef.current, {
      ...setConfig.getLatest(),
      colors: currentColorTheme.colors,
    })

    setStarField(starFieldInstance)
  }

  /** 应用预设 */
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
    initStarField()
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    setTimeout(() => {
      initStarField()
    }, 20)
  }

  /** 更新尺寸范围 */
  const updateSizeRange = (index: number, value: number) => {
    const newSizeRange = [...config.sizeRange] as [number, number]
    newSizeRange[index] = value
    updateConfig('sizeRange', newSizeRange)
  }

  /** 切换颜色主题 */
  const changeColorTheme = (index: number) => {
    setSelectedColorTheme(index)
    setTimeout(() => {
      initStarField()
    }, 20)
  }

  /** 初始化 */
  useEffect(() => {
    initStarField()
  }, [selectedColorTheme])

  /** 处理窗口大小变化 */
  useEffect(() => {
    const handleResize = () => {
      if (starField) {
        starField.onResize(config.width, config.height)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [starField, config.width, config.height])

  return (
    <div className="min-h-screen from-slate-50 to-blue-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 - 全宽显示 */ }
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          ⭐ 星空场景
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 星空动画效果，支持自定义星星数量、大小、颜色和运动参数
        </p>
      </div>

      {/* 响应式布局容器 */ }
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */ }
        <div className="flex-1">
          <Card className="min-h-[600px] p-6">
            <h2 className="mb-6 text-center text-2xl text-gray-800 font-semibold dark:text-white">
              星空效果展示
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

        {/* 右侧：控制面板 */ }
        <div className="w-full lg:w-96">
          <Card>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
                控制面板
              </h2>

              {/* 预设配置 */ }
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  预设效果
                </h3>
                <div className="flex flex-wrap gap-2">
                  { presets.map((preset, index) => (
                    <Button
                      key={ `preset-${preset.name}-${index}` }
                      onClick={ () => applyPreset(preset) }
                      variant={ config.name === preset.name
                        ? 'primary'
                        : 'default' }
                      size="sm"
                    >
                      { preset.name }
                    </Button>
                  )) }
                </div>
              </div>

              {/* 颜色主题 */ }
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  颜色主题
                </h3>
                <div className="flex flex-wrap gap-2">
                  { colorThemes.map((theme, index) => (
                    <Button
                      key={ `theme-${theme.name}-${index}` }
                      onClick={ () => changeColorTheme(index) }
                      variant={ selectedColorTheme === index
                        ? 'primary'
                        : 'default' }
                      size="sm"
                    >
                      { theme.name }
                    </Button>
                  )) }
                </div>
                <div className="mt-2 flex gap-1">
                  { colorThemes[selectedColorTheme].colors.map((color, index) => (
                    <div
                      key={ `color-${index}` }
                      className="h-4 w-4 border border-gray-300 rounded"
                      style={ { backgroundColor: color } }
                    />
                  )) }
                </div>
              </div>

              {/* 参数配置 */ }
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
                    onChange={ v => updateConfig('width', v) }
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
                    onChange={ v => updateConfig('height', v) }
                    min={ 300 }
                    max={ 800 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    星星数量
                  </label>
                  <NumberInput
                    value={ config.starCount }
                    onChange={ v => updateConfig('starCount', v) }
                    min={ 50 }
                    max={ 1000 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    最小尺寸
                  </label>
                  <NumberInput
                    value={ config.sizeRange[0] }
                    onChange={ v => updateSizeRange(0, v) }
                    min={ 0.1 }
                    max={ 5 }
                    step={ 0.1 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    最大尺寸
                  </label>
                  <NumberInput
                    value={ config.sizeRange[1] }
                    onChange={ v => updateSizeRange(1, v) }
                    min={ 0.1 }
                    max={ 10 }
                    step={ 0.1 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    运动速度
                  </label>
                  <NumberInput
                    value={ config.speedRange }
                    onChange={ v => updateConfig('speedRange', v) }
                    min={ 0 }
                    max={ 2 }
                    step={ 0.01 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    闪烁速度
                  </label>
                  <NumberInput
                    value={ config.flickerSpeed }
                    onChange={ v => updateConfig('flickerSpeed', v) }
                    min={ 0.001 }
                    max={ 0.1 }
                    step={ 0.001 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    背景颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={ config.backgroundColor }
                      onChange={ e => updateConfig('backgroundColor', e.target.value) }
                      className="h-8 w-12 border-0 p-0"
                    />
                    <input
                      type="color"
                      value={ config.backgroundColor }
                      onChange={ e => updateConfig('backgroundColor', e.target.value) }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* 使用说明 */ }
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  参数说明
                </h3>
                <div className="text-sm text-gray-600 space-y-3 dark:text-gray-300">
                  <div>
                    <strong>星星数量：</strong>
                    场景中星星的总数量
                  </div>
                  <div>
                    <strong>尺寸范围：</strong>
                    星星大小的最小值和最大值
                  </div>
                  <div>
                    <strong>运动速度：</strong>
                    星星移动的速度范围
                  </div>
                  <div>
                    <strong>闪烁速度：</strong>
                    星星闪烁的频率
                  </div>
                  <div>
                    <strong>颜色主题：</strong>
                    不同的星星颜色搭配
                  </div>
                  <div>
                    <strong>背景颜色：</strong>
                    星空的背景色
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
