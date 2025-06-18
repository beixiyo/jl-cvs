import { WaterRipple } from '@jl-org/cvs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'

export default function WaterRippleTest() {
  const [rippleInstance, setRippleInstance] = useState<WaterRipple | null>(null)
  const [config, setConfig] = useState({
    width: 800,
    height: 600,
    yOffset: 180,
    xOffset: 0,
    lineWidth: 2,
    circleCount: 13,
    intensity: 1,
    strokeStyle: '',
  })

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  /** 预设配置 */
  const presets = [
    {
      name: '默认效果',
      config: {
        width: 800,
        height: 600,
        yOffset: 180,
        xOffset: 0,
        lineWidth: 2,
        circleCount: 13,
        intensity: 1,
        strokeStyle: '',
      },
    },
    {
      name: '快速波纹',
      config: {
        width: 800,
        height: 600,
        yOffset: 100,
        xOffset: 0,
        lineWidth: 1,
        circleCount: 20,
        intensity: 3,
        strokeStyle: 'rgba(0, 150, 255, 0.3)',
      },
    },
    {
      name: '慢速大波纹',
      config: {
        width: 800,
        height: 600,
        yOffset: 200,
        xOffset: 0,
        lineWidth: 4,
        circleCount: 8,
        intensity: 0.5,
        strokeStyle: 'rgba(255, 100, 100, 0.2)',
      },
    },
    {
      name: '彩色渐变',
      config: {
        width: 800,
        height: 600,
        yOffset: 150,
        xOffset: 0,
        lineWidth: 3,
        circleCount: 15,
        intensity: 2,
        strokeStyle: '', // 将使用动态颜色函数
      },
    },
  ]

  /** 创建水波纹实例 */
  const createRipple = useCallback((canvas: HTMLCanvasElement, customConfig?: any) => {
    const rippleConfig = customConfig || config

    const ripple = new WaterRipple({
      canvas,
      width: rippleConfig.width,
      height: rippleConfig.height,
      yOffset: rippleConfig.yOffset,
      xOffset: rippleConfig.xOffset,
      lineWidth: rippleConfig.lineWidth,
      circleCount: rippleConfig.circleCount,
      intensity: rippleConfig.intensity,
      strokeStyle: rippleConfig.strokeStyle || undefined,
      onResize: () => {
        // Canvas 尺寸调整回调
      },
    })

    return ripple
  }, [config])

  /** 应用预设配置 */
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)

    /** 重新创建实例 */
    if (rippleInstance) {
      rippleInstance.stop()
    }

    if (canvasRef.current) {
      const ripple = createRipple(canvasRef.current, presetConfig)
      setRippleInstance(ripple)
    }
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    /** 重新创建实例 */
    if (rippleInstance) {
      rippleInstance.stop()
    }

    if (canvasRef.current) {
      const ripple = createRipple(canvasRef.current, newConfig)
      setRippleInstance(ripple)
    }
  }

  /** 初始化画布 */
  useEffect(() => {
    if (canvasRef.current) {
      const ripple = createRipple(canvasRef.current)
      setRippleInstance(ripple)

      return () => {
        ripple.stop()
      }
    }
  }, [createRipple])

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* 页面标题 - 全宽显示 */ }
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🌊 水波纹动画效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 水波纹动画组件，支持多种配置参数和预设效果
        </p>
      </div>

      {/* 响应式布局容器 */ }
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        {/* 左侧：效果展示区域 */ }
        <div className="flex-1">
          <Card className="p-6 min-h-[600px]">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              水波纹效果展示
            </h2>
            <div className="flex justify-center items-center min-h-[500px]">
              <canvas
                ref={ canvasRef }
                className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl bg-black"
                style={ { maxWidth: '100%', height: 'auto' } }
              />
            </div>
          </Card>
        </div>

        {/* 右侧：控制面板 */ }
        <div className="w-full lg:w-96">
          <Card>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                控制面板
              </h2>

              {/* 预设配置 */ }
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  预设效果
                </h3>
                <div className="flex flex-wrap gap-2">
                  { presets.map((preset, index) => (
                    <Button
                      key={ `preset-${preset.name}-${index}` }
                      onClick={ () => applyPreset(preset.config) }
                      variant="primary"
                      className="text-sm"
                    >
                      { preset.name }
                    </Button>
                  )) }
                </div>
              </div>

              {/* 参数配置 */ }
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
                    min={ 200 }
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
                    min={ 200 }
                    max={ 800 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    Y轴偏移
                  </label>
                  <Input
                    type="number"
                    value={ config.yOffset }
                    onChange={ e => updateConfig('yOffset', Number(e.target.value)) }
                    min={ -200 }
                    max={ 400 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    X轴偏移
                  </label>
                  <Input
                    type="number"
                    value={ config.xOffset }
                    onChange={ e => updateConfig('xOffset', Number(e.target.value)) }
                    min={ -200 }
                    max={ 200 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    线条宽度
                  </label>
                  <Input
                    type="number"
                    value={ config.lineWidth }
                    onChange={ e => updateConfig('lineWidth', Number(e.target.value)) }
                    min={ 1 }
                    max={ 10 }
                    step={ 0.5 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    波纹圈数
                  </label>
                  <Input
                    type="number"
                    value={ config.circleCount }
                    onChange={ e => updateConfig('circleCount', Number(e.target.value)) }
                    min={ 5 }
                    max={ 30 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    动画强度
                  </label>
                  <Input
                    type="number"
                    value={ config.intensity }
                    onChange={ e => updateConfig('intensity', Number(e.target.value)) }
                    min={ 0.1 }
                    max={ 5 }
                    step={ 0.1 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    描边颜色
                  </label>
                  <Input
                    type="color"
                    value={ config.strokeStyle }
                    onChange={ e => updateConfig('strokeStyle', e.target.value) }
                    placeholder="rgba(255,255,255,0.5)"
                  />
                </div>
              </div>

              {/* 使用说明 */ }
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  使用说明
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <strong>基本用法：</strong>
                    创建 WaterRipple 实例，传入 canvas 元素和配置参数
                  </div>
                  <div>
                    <strong>width/height：</strong>
                    画布尺寸
                  </div>
                  <div>
                    <strong>xOffset/yOffset：</strong>
                    波纹中心偏移量
                  </div>
                  <div>
                    <strong>lineWidth：</strong>
                    波纹线条宽度
                  </div>
                  <div>
                    <strong>circleCount：</strong>
                    同时显示的波纹圈数
                  </div>
                  <div>
                    <strong>intensity：</strong>
                    动画速度强度
                  </div>
                  <div>
                    <strong>strokeStyle：</strong>
                    自定义描边样式
                  </div>
                  <div>
                    <strong>方法：</strong>
                    stop() 停止动画，setSize(width, height) 调整尺寸
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
