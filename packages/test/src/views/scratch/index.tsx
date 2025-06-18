import { createScratch } from '@jl-org/cvs'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { cn } from '@/utils'
import { useGetState } from '@/hooks'

export default function ScratchTest() {
  const [config, setConfig] = useGetState({
    width: 400,
    height: 300,
    bg: '#999999',
    lineWidth: 15,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  }, true)

  const [scratchProgress, setScratchProgress] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // 奖品内容
  const prizes = [
    { text: '🎉 恭喜中奖！', subtitle: '获得 100 元现金红包', color: 'text-red-500' },
    { text: '🎁 幸运奖！', subtitle: '获得精美礼品一份', color: 'text-blue-500' },
    { text: '🌟 特等奖！', subtitle: '获得 iPhone 15 Pro', color: 'text-purple-500' },
    { text: '💰 大奖！', subtitle: '获得 1000 元购物券', color: 'text-green-500' },
    { text: '🎊 中奖了！', subtitle: '获得免费旅游机会', color: 'text-yellow-500' },
  ]

  const [currentPrize] = useState(() => prizes[Math.floor(Math.random() * prizes.length)])

  // 预设配置
  const presets = [
    {
      name: '默认刮刮卡',
      config: {
        width: 400,
        height: 300,
        bg: '#999999',
        lineWidth: 15,
        lineCap: 'round' as CanvasLineCap,
        lineJoin: 'round' as CanvasLineJoin,
      },
    },
    {
      name: '细线刮刮卡',
      config: {
        width: 400,
        height: 300,
        bg: '#666666',
        lineWidth: 1,
        lineCap: 'round' as CanvasLineCap,
        lineJoin: 'round' as CanvasLineJoin,
      },
    },
    {
      name: '粗线刮刮卡',
      config: {
        width: 400,
        height: 300,
        bg: '#333333',
        lineWidth: 25,
        lineCap: 'round' as CanvasLineCap,
        lineJoin: 'round' as CanvasLineJoin,
      },
    },
    {
      name: '银色刮刮卡',
      config: {
        width: 400,
        height: 300,
        bg: '#C0C0C0',
        lineWidth: 15,
        lineCap: 'square' as CanvasLineCap,
        lineJoin: 'miter' as CanvasLineJoin,
      },
    },
  ]

  // 初始化刮刮卡
  const initScratch = () => {
    if (!canvasRef.current) return

    // 清理之前的事件
    if (cleanupRef.current) {
      cleanupRef.current()
    }

    setScratchProgress(0)
    setIsRevealed(false)

    const cleanup = createScratch(
      canvasRef.current,
      {
        ...setConfig.getLatest(),
        ctxOpts: { willReadFrequently: true },
      },
      (e) => {
        // 计算刮开的进度
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

        // 当刮开超过 30% 时显示完整内容
        if (progress > 30 && !isRevealed) {
          setIsRevealed(true)
        }
      }
    )

    cleanupRef.current = cleanup
  }

  // 重置刮刮卡
  const resetScratch = () => {
    initScratch()
  }

  // 应用预设
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
    initScratch()
  }

  // 更新配置
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    initScratch()
  }

  // 初始化
  useEffect(() => {
    initScratch()

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 h-screen overflow-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🎯 刮刮卡效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 刮刮卡组件，支持自定义刮奖区域样式和刮开进度检测
        </p>
      </div>

      {/* 控制面板 */ }
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          控制面板
        </h2>

        {/* 预设配置 */ }
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
            预设样式
          </h3>
          <div className="flex flex-wrap gap-2">
            { presets.map((preset, index) => (
              <Button
                key={ index }
                onClick={ () => applyPreset(preset.config) }
                variant="default"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              画布宽度
            </label>
            <Input
              type="number"
              value={ config.width }
              onChange={ (e) => updateConfig('width', Number(e.target.value)) }
              min={ 200 }
              max={ 600 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              画布高度
            </label>
            <Input
              type="number"
              value={ config.height }
              onChange={ (e) => updateConfig('height', Number(e.target.value)) }
              min={ 150 }
              max={ 400 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              刮线宽度
            </label>
            <Input
              type="number"
              value={ config.lineWidth }
              onChange={ (e) => updateConfig('lineWidth', Number(e.target.value)) }
              min={ 5 }
              max={ 50 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              背景颜色
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={ config.bg }
                onChange={ (e) => updateConfig('bg', e.target.value) }
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                type="text"
                value={ config.bg }
                onChange={ (e) => updateConfig('bg', e.target.value) }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              线条端点
            </label>
            <select
              value={ config.lineCap }
              onChange={ (e) => updateConfig('lineCap', e.target.value) }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="round">圆形</option>
              <option value="square">方形</option>
              <option value="butt">平直</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              线条连接
            </label>
            <select
              value={ config.lineJoin }
              onChange={ (e) => updateConfig('lineJoin', e.target.value) }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="round">圆形</option>
              <option value="bevel">斜角</option>
              <option value="miter">尖角</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 刮刮卡展示区域 */ }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            刮刮卡体验
          </h3>
          <div className="flex justify-center">
            <div
              ref={ containerRef }
              className="relative border-4 border-yellow-400 rounded-lg shadow-lg overflow-hidden"
              style={ { width: config.width, height: config.height } }
            >
              {/* 奖品内容 */ }
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
                <div className={ cn('text-4xl font-bold mb-2', currentPrize.color) }>
                  { currentPrize.text }
                </div>
                <div className="text-lg text-gray-600 text-center">
                  { currentPrize.subtitle }
                </div>
                { isRevealed && (
                  <div className="mt-4 text-sm text-gray-500 animate-pulse">
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
          </div>

          {/* 进度显示 */ }
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              刮开进度: { scratchProgress }%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={ { width: `${scratchProgress}%` } }
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            使用说明
          </h3>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="font-semibold mb-2">操作方式</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>鼠标按下并拖拽进行刮奖</li>
                <li>刮开面积达到 30% 时自动显示完整内容</li>
                <li>支持触摸设备的手指操作</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">技术特点</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>使用 Canvas 的 destination-out 混合模式</li>
                <li>实时计算刮开进度</li>
                <li>支持自定义刮线样式</li>
                <li>响应式设计适配不同屏幕</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">应用场景</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
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
