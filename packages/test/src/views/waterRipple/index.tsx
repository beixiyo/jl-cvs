import { WaterRipple } from '@jl-org/cvs'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { cn } from '@/utils'

export default function WaterRippleTest() {
  const [rippleInstances, setRippleInstances] = useState<WaterRipple[]>([])
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

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  // 预设配置
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

  // 创建水波纹实例
  const createRipple = (canvas: HTMLCanvasElement, customConfig?: any) => {
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
        console.log('Canvas resized')
      },
    })

    return ripple
  }

  // 应用预设配置
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)

    // 重新创建所有实例
    rippleInstances.forEach(instance => instance.stop())
    const newInstances: WaterRipple[] = []

    canvasRefs.current.forEach((canvas, index) => {
      if (canvas) {
        const ripple = createRipple(canvas, presetConfig)
        newInstances.push(ripple)
      }
    })

    setRippleInstances(newInstances)
  }

  // 更新配置
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    // 重新创建实例
    rippleInstances.forEach(instance => instance.stop())
    const newInstances: WaterRipple[] = []

    canvasRefs.current.forEach((canvas) => {
      if (canvas) {
        const ripple = createRipple(canvas, newConfig)
        newInstances.push(ripple)
      }
    })

    setRippleInstances(newInstances)
  }

  // 初始化画布
  useEffect(() => {
    const instances: WaterRipple[] = []

    canvasRefs.current.forEach((canvas) => {
      if (canvas) {
        const ripple = createRipple(canvas)
        instances.push(ripple)
      }
    })

    setRippleInstances(instances)

    return () => {
      instances.forEach(instance => instance.stop())
    }
  }, [])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 h-screen overflow-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🌊 水波纹动画效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 水波纹动画组件，支持多种配置参数和预设效果
        </p>
      </div>

      {/* 控制面板 */}
      <Card className="p-6">
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
                variant="primary"
                className="text-sm"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 参数配置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              画布宽度
            </label>
            <Input
              type="number"
              value={config.width}
              onChange={(e) => updateConfig('width', Number(e.target.value))}
              min={200}
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
              min={200}
              max={800}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Y轴偏移
            </label>
            <Input
              type="number"
              value={config.yOffset}
              onChange={(e) => updateConfig('yOffset', Number(e.target.value))}
              min={-200}
              max={400}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              X轴偏移
            </label>
            <Input
              type="number"
              value={config.xOffset}
              onChange={(e) => updateConfig('xOffset', Number(e.target.value))}
              min={-200}
              max={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              线条宽度
            </label>
            <Input
              type="number"
              value={config.lineWidth}
              onChange={(e) => updateConfig('lineWidth', Number(e.target.value))}
              min={1}
              max={10}
              step={0.5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              波纹圈数
            </label>
            <Input
              type="number"
              value={config.circleCount}
              onChange={(e) => updateConfig('circleCount', Number(e.target.value))}
              min={5}
              max={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              动画强度
            </label>
            <Input
              type="number"
              value={config.intensity}
              onChange={(e) => updateConfig('intensity', Number(e.target.value))}
              min={0.1}
              max={5}
              step={0.1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              描边颜色
            </label>
            <Input
              type="color"
              value={config.strokeStyle}
              onChange={(e) => updateConfig('strokeStyle', e.target.value)}
              placeholder="rgba(255,255,255,0.5)"
            />
          </div>
        </div>
      </Card>

      {/* 效果展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            当前配置效果
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={(el) => (canvasRefs.current[0] = el)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg bg-black"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            对比效果
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={(el) => (canvasRefs.current[1] = el)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg bg-black"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          使用说明
        </h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <p>
            <strong>基本用法：</strong>
            创建 WaterRipple 实例，传入 canvas 元素和配置参数
          </p>
          <p>
            <strong>主要参数：</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><code>width/height</code>: 画布尺寸</li>
            <li><code>xOffset/yOffset</code>: 波纹中心偏移量</li>
            <li><code>lineWidth</code>: 波纹线条宽度</li>
            <li><code>circleCount</code>: 同时显示的波纹圈数</li>
            <li><code>intensity</code>: 动画速度强度</li>
            <li><code>strokeStyle</code>: 自定义描边样式</li>
          </ul>
          <p>
            <strong>方法：</strong>
            <code>stop()</code> 停止动画，<code>setSize(width, height)</code> 调整尺寸
          </p>
        </div>
      </Card>
    </div>
  )
}
