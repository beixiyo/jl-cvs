import { WavyLines } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'

/** 预设配置 */
const presets = [
  {
    name: '默认效果',
    xGap: 10,
    yGap: 32,
    extraWidth: 200,
    extraHeight: 30,
    mouseEffectRange: 175,
    strokeStyle: '#333333',
  },
  {
    name: '密集线条',
    xGap: 6,
    yGap: 20,
    extraWidth: 150,
    extraHeight: 20,
    mouseEffectRange: 120,
    strokeStyle: '#666666',
  },
  {
    name: '稀疏线条',
    xGap: 20,
    yGap: 50,
    extraWidth: 300,
    extraHeight: 50,
    mouseEffectRange: 250,
    strokeStyle: '#999999',
  },
  {
    name: '强交互效果',
    xGap: 12,
    yGap: 36,
    extraWidth: 250,
    extraHeight: 40,
    mouseEffectRange: 300,
    strokeStyle: '#444444',
  },
  {
    name: '彩色线条',
    xGap: 8,
    yGap: 28,
    extraWidth: 180,
    extraHeight: 25,
    mouseEffectRange: 150,
    strokeStyle: '#0066cc',
  },
  {
    name: '细腻效果',
    xGap: 4,
    yGap: 16,
    extraWidth: 100,
    extraHeight: 15,
    mouseEffectRange: 80,
    strokeStyle: '#888888',
  },
]

/** 颜色预设 */
const colorPresets = [
  { name: '深灰', color: '#333333' },
  { name: '中灰', color: '#666666' },
  { name: '浅灰', color: '#999999' },
  { name: '蓝色', color: '#0066cc' },
  { name: '绿色', color: '#00cc66' },
  { name: '红色', color: '#cc0066' },
  { name: '紫色', color: '#6600cc' },
  { name: '橙色', color: '#cc6600' },
]

export default function WavyLinesTest() {
  const [config, setConfig] = useGetState({
    width: 800,
    height: 600,
    ...presets[0],
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wavyLinesRef = useRef<WavyLines | null>(null)

  /** 创建波浪线实例 */
  const createWavyLines = useCallback(debounce(() => {
    if (!canvasRef.current) {
      console.warn('画布未准备好')
      return
    }
    if (wavyLinesRef.current) {
      wavyLinesRef.current.dispose()
      wavyLinesRef.current = null
    }

    /** 使用 getLatest() 获取最新配置 */
    const latestConfig = setConfig.getLatest()

    /** 设置画布尺寸 */
    canvasRef.current.width = latestConfig.width
    canvasRef.current.height = latestConfig.height

    /** 创建新实例 */
    wavyLinesRef.current = new WavyLines({
      canvas: canvasRef.current,
      xGap: latestConfig.xGap,
      yGap: latestConfig.yGap,
      extraWidth: latestConfig.extraWidth,
      extraHeight: latestConfig.extraHeight,
      mouseEffectRange: latestConfig.mouseEffectRange,
      strokeStyle: latestConfig.strokeStyle,
      fillStyle: '#0009',
    })
  }, 80), [setConfig])

  /** 应用预设配置 */
  const applyPreset = (presetConfig: any) => {
    setConfig(prev => ({ ...prev, ...presetConfig }))
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig({ [key]: value })
  }

  /** 监听配置变化，自动重新创建实例 */
  useEffect(() => {
    createWavyLines()

    return () => {
      if (wavyLinesRef.current) {
        wavyLinesRef.current.dispose()
      }
    }
  }, [config, createWavyLines])

  return (
    <div className="min-h-screen from-cyan-50 to-blue-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 - 全宽显示 */ }
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          〰️ 波浪线条效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          跟随鼠标的动态波浪线条，基于噪声算法和物理模拟
        </p>
      </div>

      {/* 响应式布局容器 */ }
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */ }
        <div className="relative flex flex-1 items-center justify-center">
          <canvas
            ref={ canvasRef }
            className="border border-gray-300 rounded-lg bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800"
            width={ config.width }
            height={ config.height }
            style={ { maxWidth: '100%', height: 'auto' } }
          />
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
                <div className="grid grid-cols-2 gap-2">
                  { presets.map((preset, index) => (
                    <Button
                      key={ `preset-${preset.name}-${index}` }
                      onClick={ () => applyPreset(preset) }
                      variant={ config.name === preset.name
                        ? 'primary'
                        : 'default' }
                      size="sm"
                      className="text-xs"
                    >
                      { preset.name }
                    </Button>
                  )) }
                </div>
              </div>

              {/* 基础参数配置 */ }
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
                    水平间距 (
                    { config.xGap }
                    px)
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 2 }
                      max={ 30 }
                      value={ config.xGap }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('xGap', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('xGap', value[0])
                        }
                      } }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    垂直间距 (
                    { config.yGap }
                    px)
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 10 }
                      max={ 80 }
                      value={ config.yGap }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('yGap', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('yGap', value[0])
                        }
                      } }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    额外宽度 (
                    { config.extraWidth }
                    px)
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 50 }
                      max={ 400 }
                      value={ config.extraWidth }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('extraWidth', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('extraWidth', value[0])
                        }
                      } }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    额外高度 (
                    { config.extraHeight }
                    px)
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 10 }
                      max={ 100 }
                      value={ config.extraHeight }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('extraHeight', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('extraHeight', value[0])
                        }
                      } }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    鼠标效果范围 (
                    { config.mouseEffectRange }
                    px)
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 50 }
                      max={ 400 }
                      value={ config.mouseEffectRange }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('mouseEffectRange', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('mouseEffectRange', value[0])
                        }
                      } }
                    />
                  </div>
                </div>
              </div>

              {/* 颜色配置 */ }
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  线条颜色
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={ config.strokeStyle }
                      onChange={ e => updateConfig('strokeStyle', e.target.value) }
                      className="h-8 w-12 border-0 p-0"
                    />
                    <input
                      type="color"
                      value={ config.strokeStyle }
                      onChange={ e => updateConfig('strokeStyle', e.target.value) }
                      className="flex-1"
                      placeholder="颜色值，如 #333333"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">快速选择颜色：</p>
                    <div className="grid grid-cols-2 gap-2">
                      { colorPresets.map((preset, index) => (
                        <Button
                          key={ `color-${preset.name}-${index}` }
                          onClick={ () => updateConfig('strokeStyle', preset.color) }
                          size="sm"
                          className="text-xs"
                          style={ { backgroundColor: preset.color, borderColor: preset.color, color: 'white' } }
                        >
                          { preset.name }
                        </Button>
                      )) }
                    </div>
                  </div>
                </div>
              </div>

              {/* 使用说明 */ }
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  使用说明
                </h3>
                <div className="text-sm text-gray-600 space-y-3 dark:text-gray-300">
                  <div>
                    <strong>水平/垂直间距：</strong>
                    控制线条的密度和分布
                  </div>
                  <div>
                    <strong>额外宽度/高度：</strong>
                    扩展绘制区域，避免边缘效果
                  </div>
                  <div>
                    <strong>鼠标效果范围：</strong>
                    鼠标影响波浪的距离
                  </div>
                  <div>
                    <strong>交互提示：</strong>
                    移动鼠标到画布上查看波浪扭曲效果
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
