import { createTechNum } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { NumberInput } from '@/components/Input'
import { Select } from '@/components/Select'
import { useGetState } from '@/hooks'

/** 预设配置 */
const presets = [
  {
    name: '经典黑客风格',
    colWidth: 20,
    fontSize: 20,
    font: 'Roboto Mono',
    maskColor: 'rgba(12, 12, 12, .1)',
    gapRate: 0.85,
    durationMS: 30,
  },
  {
    name: '密集数字雨',
    colWidth: 15,
    fontSize: 15,
    font: 'Courier New',
    maskColor: 'rgba(0, 0, 0, .15)',
    gapRate: 0.9,
    durationMS: 20,
  },
  {
    name: '大字体效果',
    colWidth: 30,
    fontSize: 30,
    font: 'Monaco',
    maskColor: 'rgba(5, 5, 5, .08)',
    gapRate: 0.8,
    durationMS: 50,
  },
  {
    name: '快速流动',
    colWidth: 18,
    fontSize: 18,
    font: 'Consolas',
    maskColor: 'rgba(0, 0, 0, .2)',
    gapRate: 0.95,
    durationMS: 15,
  },
]

/** 字体选项 */
const fontOptions = [
  { value: 'Roboto Mono', label: 'Roboto Mono' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Monaco', label: 'Monaco' },
  { value: 'Consolas', label: 'Consolas' },
  { value: 'Menlo', label: 'Menlo' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'Fira Code', label: 'Fira Code' },
]

export default function TechNumTest() {
  const [config, setConfig] = useGetState({
    width: 800,
    height: 600,
    ...presets[0],
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const techNumRef = useRef<{ start: () => void, stop: () => void, setSize: (w: number, h: number) => void } | null>(null)

  /** 初始化科技数字 */
  const initTechNum = useCallback(debounce(() => {
    if (!canvasRef.current) {
      console.warn('画布未准备好')
      return
    }

    /** 停止之前的动画 */
    if (techNumRef.current) {
      techNumRef.current.stop()
    }

    /** 使用 getLatest() 获取最新配置 */
    const latestConfig = setConfig.getLatest()

    /** 设置画布尺寸 */
    canvasRef.current.width = latestConfig.width
    canvasRef.current.height = latestConfig.height

    const techNum = createTechNum(canvasRef.current, {
      ...latestConfig,
      getStr: () => Math.random().toString(36).charAt(2) || '0',
      getColor: () => {
        const colors = ['#00ff00', '#00cc00', '#009900', '#00ff88', '#88ff00']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    })

    techNumRef.current = techNum
    /** 自动开始数字雨效果 */
    techNum.start()
  }, 80), [setConfig])

  /** 应用预设 */
  const applyPreset = (presetConfig: any) => {
    setConfig(prev => ({ ...prev, ...presetConfig }))
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig({ [key]: value })
  }

  /** 监听配置变化，自动重新创建实例 */
  useEffect(() => {
    initTechNum()

    return () => {
      if (techNumRef.current) {
        techNumRef.current.stop()
      }
    }
  }, [config, initTechNum])

  return (
    <div className="min-h-screen from-green-50 to-emerald-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          🔢 科技数字雨
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          黑客风格的数字雨效果，模拟《黑客帝国》中的经典场景
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1 flex justify-center items-center relative">
          <div className="rounded-lg bg-black p-8">
            <canvas
              ref={ canvasRef }
              className="rounded-lg shadow-xl"
              width={ config.width }
              height={ config.height }
              style={ { maxWidth: '100%', height: 'auto' } }
            />
          </div>
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-full lg:w-96">
          <Card>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
                控制面板
              </h2>

              {/* 预设配置 */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  预设效果
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset, index) => (
                    <Button
                      key={ `preset-${preset.name}-${index}` }
                      onClick={ () => applyPreset(preset) }
                      variant={ config.name === preset.name
                        ? 'primary'
                        : 'default' }
                      size="sm"
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 参数配置 */}
              <div className="mb-6 space-y-4">
                <h3 className="text-lg text-gray-700 font-medium dark:text-gray-200">
                  基础参数
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
                    列宽度
                  </label>
                  <NumberInput
                    value={ config.colWidth }
                    onChange={ v => updateConfig('colWidth', v) }
                    min={ 10 }
                    max={ 50 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    字体大小
                  </label>
                  <NumberInput
                    value={ config.fontSize }
                    onChange={ v => updateConfig('fontSize', v) }
                    min={ 10 }
                    max={ 40 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    字体
                  </label>
                  <Select
                    value={ config.font }
                    onChange={ value => updateConfig('font', value) }
                    options={ fontOptions }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    间隔概率
                  </label>
                  <NumberInput
                    value={ config.gapRate }
                    onChange={ v => updateConfig('gapRate', v) }
                    min={ 0.1 }
                    max={ 1 }
                    step={ 0.05 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    动画间隔 (ms)
                  </label>
                  <NumberInput
                    value={ config.durationMS }
                    onChange={ v => updateConfig('durationMS', v) }
                    min={ 10 }
                    max={ 100 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    蒙层颜色
                  </label>
                  <input
                    type="text"
                    value={ config.maskColor }
                    onChange={ e => updateConfig('maskColor', e.target.value) }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="rgba(12, 12, 12, .1)"
                  />
                </div>

                {/* 使用说明 */}
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                  <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                    使用说明
                  </h3>
                  <div className="text-sm text-gray-600 space-y-3 dark:text-gray-300">
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
