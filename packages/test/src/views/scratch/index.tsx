import { createScratch } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { NumberInput } from '@/components/Input'
import { Select } from '@/components/Select'
import { useGetState } from '@/hooks'
import { cn } from '@/utils'

/** 奖品内容 */
const prizes = [
  { text: '🎉 恭喜中奖！', subtitle: '获得 100 元现金红包', color: 'text-red-500' },
  { text: '🎁 幸运奖！', subtitle: '获得精美礼品一份', color: 'text-blue-500' },
  { text: '🌟 特等奖！', subtitle: '获得 iPhone 15 Pro', color: 'text-purple-500' },
  { text: '💰 大奖！', subtitle: '获得 1000 元购物券', color: 'text-green-500' },
  { text: '🎊 中奖了！', subtitle: '获得免费旅游机会', color: 'text-yellow-500' },
]

/** 预设配置 */
const presets = [
  {
    name: '默认刮刮卡',
    width: 400,
    height: 300,
    bg: '#999999',
    lineWidth: 15,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  },
  {
    name: '细线刮刮卡',
    width: 400,
    height: 300,
    bg: '#666666',
    lineWidth: 1,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  },
  {
    name: '粗线刮刮卡',
    width: 400,
    height: 300,
    bg: '#333333',
    lineWidth: 25,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  },
  {
    name: '银色刮刮卡',
    width: 400,
    height: 300,
    bg: '#C0C0C0',
    lineWidth: 15,
    lineCap: 'square' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
  },
]

export default function ScratchTest() {
  const [config, setConfig] = useGetState({
    ...presets[0],
  }, true)

  const [scratchProgress, setScratchProgress] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [currentPrize] = useState(() => prizes[Math.floor(Math.random() * prizes.length)])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  /** 初始化刮刮卡 */
  const initScratch = debounce(() => {
    if (!canvasRef.current) {
      console.warn('画布未准备好')
      return
    }

    /** 清理之前的事件 */
    if (cleanupRef.current) {
      cleanupRef.current()
    }

    setScratchProgress(0)
    setIsRevealed(false)

    /** 使用 getLatest() 获取最新配置 */
    const latestConfig = setConfig.getLatest()

    /** 设置画布尺寸 */
    canvasRef.current.width = latestConfig.width
    canvasRef.current.height = latestConfig.height

    const cleanup = createScratch(
      canvasRef.current,
      {
        ...latestConfig,
        ctxOpts: { willReadFrequently: true },
        /** 计算刮开的进度 */
        onScratch: (e) => {
          const canvas = canvasRef.current!
          const ctx = canvas.getContext('2d')!
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const pixels = imageData.data

          let transparentPixels = 0
          for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
              transparentPixels++
            }
          }

          const totalPixels = pixels.length / 4
          const progress = (transparentPixels / totalPixels) * 100
          setScratchProgress(Math.round(progress))

          /** 当刮开超过 30% 时显示完整内容 */
          if (progress > 30 && !isRevealed) {
            setIsRevealed(true)
          }
        },
      },
    )

    cleanupRef.current = cleanup
  }, 80)

  /** 重置刮刮卡 */
  const resetScratch = () => {
    initScratch()
  }

  /** 应用预设 */
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig({ [key]: value })
  }

  /** 监听配置变化 */
  useEffect(() => {
    initScratch()
  }, [config])

  /** 初始化 */
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  return (
    <div className="min-h-screen from-yellow-50 to-orange-50 bg-gradient-to-br p-6 space-y-6 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          🎯 刮刮卡效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 刮刮卡组件，支持自定义刮奖区域样式和刮开进度检测
        </p>
      </div>

      {/* 控制面板 */ }
      <Card className="p-6">
        <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
          控制面板
        </h2>

        {/* 预设配置 */ }
        <div className="mb-6">
          <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
            预设样式
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
            <Button onClick={ resetScratch } variant="default" size="sm">
              🔄 重置
            </Button>
          </div>
        </div>

        {/* 参数配置 */ }
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
              画布宽度
            </label>
            <NumberInput
              value={ config.width }
              onChange={ v => updateConfig('width', v) }
              min={ 200 }
              max={ 600 }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
              画布高度
            </label>
            <NumberInput
              value={ config.height }
              onChange={ v => updateConfig('height', v) }
              min={ 150 }
              max={ 400 }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
              刮线宽度
            </label>
            <NumberInput
              value={ config.lineWidth }
              onChange={ v => updateConfig('lineWidth', v) }
              min={ 5 }
              max={ 50 }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
              背景颜色
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={ config.bg }
                onChange={ e => updateConfig('bg', e.target.value) }
                className="h-8 w-12 border-0 p-0"
              />
              <input
                type="text"
                value={ config.bg }
                onChange={ e => updateConfig('bg', e.target.value) }
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
              线条端点
            </label>
            <Select
              options={ [
                { value: 'round', label: '圆形' },
                { value: 'square', label: '方形' },
                { value: 'butt', label: '平直' },
              ] }
              value={ config.lineCap }
              onChange={ value => updateConfig('lineCap', value) }
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
              线条连接
            </label>
            <Select
              options={ [
                { value: 'round', label: '圆形' },
                { value: 'bevel', label: '斜角' },
                { value: 'miter', label: '尖角' },
              ] }
              value={ config.lineJoin }
              onChange={ value => updateConfig('lineJoin', value) }
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* 刮刮卡展示区域 */ }
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="">
          <h3 className="mb-3 text-lg text-gray-800 font-semibold dark:text-white">
            刮刮卡体验
          </h3>

          {/* 进度显示 */ }
          <div className="mb-4 text-center">
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              刮开进度:
              { ' ' }
              { scratchProgress }
              %
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-yellow-500 transition-all duration-300"
                style={ { width: `${scratchProgress}%` } }
              />
            </div>
          </div>

          <div
            className="relative overflow-hidden border-4 border-yellow-400 rounded-lg shadow-lg flex justify-center items-center"
            style={ { width: config.width, height: config.height } }
          >
            {/* 奖品内容 */ }
            <div className="absolute inset-0 flex flex-col items-center justify-center from-yellow-100 to-orange-100 bg-gradient-to-br p-4">
              <div className={ cn('text-4xl font-bold mb-2', currentPrize.color) }>
                { currentPrize.text }
              </div>
              <div className="text-center text-lg text-gray-600">
                { currentPrize.subtitle }
              </div>
              { isRevealed && (
                <div className="mt-4 animate-pulse text-sm text-gray-500">
                  🎊 恭喜您中奖了！
                </div>
              ) }
            </div>

            {/* 刮奖层 */ }
            <canvas
              ref={ canvasRef }
              className="absolute inset-0 cursor-crosshair"
              width={ config.width }
              height={ config.height }
            />
          </div>
        </Card>

        <Card className="">
          <h3 className="mb-3 text-lg text-gray-800 font-semibold dark:text-white">
            使用说明
          </h3>
          <div className="text-gray-600 space-y-4 dark:text-gray-300">
            <div>
              <h4 className="mb-2 font-semibold">操作方式</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>鼠标按下并拖拽进行刮奖</li>
                <li>刮开面积达到 30% 时自动显示完整内容</li>
                <li>支持触摸设备的手指操作</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">技术特点</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>使用 Canvas 的 destination-out 混合模式</li>
                <li>实时计算刮开进度</li>
                <li>支持自定义刮线样式</li>
                <li>响应式设计适配不同屏幕</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">应用场景</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>营销活动中的刮奖游戏</li>
                <li>优惠券或红包的展示</li>
                <li>互动式内容揭示</li>
                <li>趣味性用户体验设计</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
