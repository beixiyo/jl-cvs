import { createTechNum } from '@jl-org/cvs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { cn } from '@/utils'

export default function TechNumTest() {
  const [isRunning, setIsRunning] = useState(true) // 默认开始播放
  const [config, setConfig] = useState({
    width: 800,
    height: 600,
    colWidth: 20,
    fontSize: 20,
    font: 'Roboto Mono',
    maskColor: 'rgba(12, 12, 12, .1)',
    gapRate: 0.85,
    durationMS: 30,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const techNumRef = useRef<{ start: () => void, stop: () => void, setSize: (w: number, h: number) => void } | null>(null)

  /** 预设配置 */
  const presets = [
    {
      name: '经典黑客风格',
      config: {
        width: 800,
        height: 600,
        colWidth: 20,
        fontSize: 20,
        font: 'Roboto Mono',
        maskColor: 'rgba(12, 12, 12, .1)',
        gapRate: 0.85,
        durationMS: 30,
      },
    },
    {
      name: '密集数字雨',
      config: {
        width: 800,
        height: 600,
        colWidth: 15,
        fontSize: 15,
        font: 'Courier New',
        maskColor: 'rgba(0, 0, 0, .15)',
        gapRate: 0.9,
        durationMS: 20,
      },
    },
    {
      name: '大字体效果',
      config: {
        width: 800,
        height: 600,
        colWidth: 30,
        fontSize: 30,
        font: 'Monaco',
        maskColor: 'rgba(5, 5, 5, .08)',
        gapRate: 0.8,
        durationMS: 50,
      },
    },
    {
      name: '快速流动',
      config: {
        width: 800,
        height: 600,
        colWidth: 18,
        fontSize: 18,
        font: 'Consolas',
        maskColor: 'rgba(0, 0, 0, .2)',
        gapRate: 0.95,
        durationMS: 15,
      },
    },
  ]

  /** 字体选项 */
  const fontOptions = [
    'Roboto Mono',
    'Courier New',
    'Monaco',
    'Consolas',
    'Menlo',
    'Source Code Pro',
    'Fira Code',
  ]

  /** 初始化科技数字 */
  const initTechNum = () => {
    if (!canvasRef.current)
      return

    /** 停止之前的动画 */
    if (techNumRef.current) {
      techNumRef.current.stop()
    }

    const techNum = createTechNum(canvasRef.current, {
      ...config,
      getStr: () => Math.random().toString(36).charAt(2) || '0',
      getColor: () => {
        const colors = ['#00ff00', '#00cc00', '#009900', '#00ff88', '#88ff00']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    })

    techNumRef.current = techNum

    if (isRunning) {
      techNum.start()
    }
  }

  /** 开始/停止动画 */
  const toggleAnimation = () => {
    if (!techNumRef.current)
      return

    if (isRunning) {
      techNumRef.current.stop()
      setIsRunning(false)
    }
    else {
      techNumRef.current.start()
      setIsRunning(true)
    }
  }

  /** 应用预设 */
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
    setTimeout(() => {
      initTechNum()
    }, 100)
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    setTimeout(() => {
      initTechNum()
    }, 100)
  }

  /** 初始化 */
  useEffect(() => {
    initTechNum()

    /** 延迟启动动画，确保组件完全加载 */
    setTimeout(() => {
      if (techNumRef.current) {
        techNumRef.current.start()
        setIsRunning(true)
      }
    }, 500)

    return () => {
      if (techNumRef.current) {
        techNumRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 h-screen overflow-auto">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🔢 科技数字雨
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          黑客风格的数字雨效果，模拟《黑客帝国》中的经典场景
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-120px)]">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1 p-6 lg:pr-3">
          <Card className="h-full p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              数字雨效果展示
            </h2>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="bg-black rounded-lg p-8">
                <canvas
                  ref={ canvasRef }
                  className="rounded-lg shadow-xl"
                  style={ { maxWidth: '100%', height: 'auto' } }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={ toggleAnimation }
                  className={ cn(
                    'px-6 py-2',
                    isRunning
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600',
                  ) }
                >
                  {isRunning
                    ? '⏹️ 停止数字雨'
                    : '▶️ 开始数字雨'}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>经典黑客风格数字雨效果</p>
                <p>绿色字符从上到下流动，营造科技感氛围</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-full lg:w-96 p-6 lg:pl-3">
          <Card className="h-full">
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                控制面板
              </h2>

              {/* 预设配置 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  预设效果
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset, index) => (
                    <Button
                      key={ `preset-${preset.name}-${index}` }
                      onClick={ () => applyPreset(preset.config) }
                      size="sm"
                      className="text-xs"
                    >
                      {preset.name}
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
                    value={ config.width }
                    onChange={ e => updateConfig('width', Number(e.target.value)) }
                    min={ 400 }
                    max={ 1200 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    画布高度
                  </label>
                  <Input
                    type="number"
                    value={ config.height }
                    onChange={ e => updateConfig('height', Number(e.target.value)) }
                    min={ 300 }
                    max={ 800 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    列宽度
                  </label>
                  <Input
                    type="number"
                    value={ config.colWidth }
                    onChange={ e => updateConfig('colWidth', Number(e.target.value)) }
                    min={ 10 }
                    max={ 50 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    字体大小
                  </label>
                  <Input
                    type="number"
                    value={ config.fontSize }
                    onChange={ e => updateConfig('fontSize', Number(e.target.value)) }
                    min={ 10 }
                    max={ 40 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    字体
                  </label>
                  <Select
                    value={ config.font }
                    onChange={ value => updateConfig('font', value) }
                    options={ fontOptions.map(font => ({ value: font, label: font })) }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    间隔概率
                  </label>
                  <Input
                    type="number"
                    value={ config.gapRate }
                    onChange={ e => updateConfig('gapRate', Number(e.target.value)) }
                    min={ 0.1 }
                    max={ 1 }
                    step={ 0.05 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    动画间隔(ms)
                  </label>
                  <Input
                    type="number"
                    value={ config.durationMS }
                    onChange={ e => updateConfig('durationMS', Number(e.target.value)) }
                    min={ 10 }
                    max={ 100 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    蒙层颜色
                  </label>
                  <Input
                    type="text"
                    value={ config.maskColor }
                    onChange={ e => updateConfig('maskColor', e.target.value) }
                    placeholder="rgba(12, 12, 12, .1)"
                  />
                </div>

                {/* 使用说明 */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                    参数说明
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <strong>列宽度：</strong>
                      控制字符列的间距
                    </div>
                    <div>
                      <strong>字体大小：</strong>
                      影响字符的显示大小
                    </div>
                    <div>
                      <strong>间隔概率：</strong>
                      控制列重置的频率
                    </div>
                    <div>
                      <strong>动画间隔：</strong>
                      控制流动的速度
                    </div>
                    <div>
                      <strong>蒙层颜色：</strong>
                      用于实现字符淡出效果
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
