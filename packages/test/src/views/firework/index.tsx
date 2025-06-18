import { createFirework } from '@jl-org/cvs'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { cn } from '@/utils'

export default function FireworkTest() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [config, setConfig] = useState({
    width: 800,
    height: 600,
    yRange: 50,
    speed: 2.5,
    r: 6,
    ballCount: 150,
    gapTime: 500,
    maxCount: 2,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stopFireworkRef = useRef<(() => void) | null>(null)

  // 预设配置
  const presets = [
    {
      name: '默认烟花',
      config: {
        width: 800,
        height: 600,
        yRange: 50,
        speed: 2.5,
        r: 6,
        ballCount: 150,
        gapTime: 500,
        maxCount: 2,
      },
    },
    {
      name: '密集烟花',
      config: {
        width: 800,
        height: 600,
        yRange: 80,
        speed: 3,
        r: 4,
        ballCount: 200,
        gapTime: 300,
        maxCount: 4,
      },
    },
    {
      name: '大型烟花',
      config: {
        width: 800,
        height: 600,
        yRange: 100,
        speed: 2,
        r: 10,
        ballCount: 300,
        gapTime: 800,
        maxCount: 1,
      },
    },
    {
      name: '快速小烟花',
      config: {
        width: 800,
        height: 600,
        yRange: 30,
        speed: 4,
        r: 3,
        ballCount: 100,
        gapTime: 200,
        maxCount: 6,
      },
    },
  ]

  // 颜色预设
  const colorPresets = [
    {
      name: '经典黄色',
      getFireworkColor: (opacity: number) => `rgba(210, 250, 90, ${opacity})`,
      getBoomColor: () => {
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF4500']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    },
    {
      name: '蓝色系',
      getFireworkColor: (opacity: number) => `rgba(100, 200, 255, ${opacity})`,
      getBoomColor: () => {
        const colors = ['#00BFFF', '#1E90FF', '#4169E1', '#0000FF']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    },
    {
      name: '彩虹色',
      getFireworkColor: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
      getBoomColor: () => {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    },
    {
      name: '粉色系',
      getFireworkColor: (opacity: number) => `rgba(255, 192, 203, ${opacity})`,
      getBoomColor: () => {
        const colors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493']
        return colors[Math.floor(Math.random() * colors.length)]
      },
    },
  ]

  const [selectedColorPreset, setSelectedColorPreset] = useState(0)

  // 开始烟花
  const startFirework = () => {
    if (!canvasRef.current) return

    stopFirework()

    const currentColorPreset = colorPresets[selectedColorPreset]
    const stopFn = createFirework(canvasRef.current, {
      ...config,
      getFireworkColor: currentColorPreset.getFireworkColor,
      getBoomColor: currentColorPreset.getBoomColor,
    })

    stopFireworkRef.current = stopFn
    setIsPlaying(true)
  }

  // 停止烟花
  const stopFirework = () => {
    if (stopFireworkRef.current) {
      stopFireworkRef.current()
      stopFireworkRef.current = null
    }
    setIsPlaying(false)
  }

  // 应用预设
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
    if (isPlaying) {
      stopFirework()
      setTimeout(() => {
        startFirework()
      }, 100)
    }
  }

  // 更新配置
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    if (isPlaying) {
      stopFirework()
      setTimeout(() => {
        startFirework()
      }, 100)
    }
  }

  // 切换颜色预设
  const changeColorPreset = (index: number) => {
    setSelectedColorPreset(index)
    if (isPlaying) {
      stopFirework()
      setTimeout(() => {
        startFirework()
      }, 100)
    }
  }

  // 组件卸载时停止烟花
  useEffect(() => {
    return () => {
      stopFirework()
    }
  }, [])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 h-screen overflow-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🎆 烟花效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 烟花动画效果，支持多种配置参数和颜色主题
        </p>
      </div>

      {/* 控制面板 */ }
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Button
            onClick={ isPlaying ? stopFirework : startFirework }
            className={ cn(
              'px-6 py-2',
              isPlaying
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            ) }
          >
            { isPlaying ? '🛑 停止烟花' : '🎆 开始烟花' }
          </Button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 预设配置 */ }
          <div className="flex flex-wrap gap-2">
            { presets.map((preset, index) => (
              <Button
                key={ index }
                onClick={ () => applyPreset(preset.config) }
                variant="primary"
                size="sm"
              >
                { preset.name }
              </Button>
            )) }
          </div>
        </div>

        {/* 颜色主题 */ }
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
            颜色主题
          </h3>
          <div className="flex flex-wrap gap-2">
            { colorPresets.map((preset, index) => (
              <Button
                key={ index }
                onClick={ () => changeColorPreset(index) }
                variant={ selectedColorPreset === index ? 'default' : 'primary' }
                size="sm"
              >
                { preset.name }
              </Button>
            )) }
          </div>
        </div>

        {/* 参数配置 */ }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              画布宽度
            </label>
            <Input
              type="number"
              value={ config.width }
              onChange={ (e) => updateConfig('width', Number(e.target.value)) }
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
              onChange={ (e) => updateConfig('height', Number(e.target.value)) }
              min={ 300 }
              max={ 800 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              发射范围
            </label>
            <Input
              type="number"
              value={ config.yRange }
              onChange={ (e) => updateConfig('yRange', Number(e.target.value)) }
              min={ 20 }
              max={ 200 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              运动速度
            </label>
            <Input
              type="number"
              value={ config.speed }
              onChange={ (e) => updateConfig('speed', Number(e.target.value)) }
              min={ 0.5 }
              max={ 10 }
              step={ 0.5 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              小球半径
            </label>
            <Input
              type="number"
              value={ config.r }
              onChange={ (e) => updateConfig('r', Number(e.target.value)) }
              min={ 2 }
              max={ 20 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              小球数量
            </label>
            <Input
              type="number"
              value={ config.ballCount }
              onChange={ (e) => updateConfig('ballCount', Number(e.target.value)) }
              min={ 50 }
              max={ 500 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              间隔时间(ms)
            </label>
            <Input
              type="number"
              value={ config.gapTime }
              onChange={ (e) => updateConfig('gapTime', Number(e.target.value)) }
              min={ 100 }
              max={ 2000 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              最大数量
            </label>
            <Input
              type="number"
              value={ config.maxCount }
              onChange={ (e) => updateConfig('maxCount', Number(e.target.value)) }
              min={ 1 }
              max={ 10 }
            />
          </div>
        </div>
      </Card>

      {/* 烟花展示区域 */ }
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          烟花展示
        </h3>
        <div className="flex justify-center">
          <canvas
            ref={ canvasRef }
            className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg bg-black"
            style={ { maxWidth: '100%', height: 'auto' } }
          />
        </div>
      </Card>

      {/* 使用说明 */ }
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          参数说明
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300">
          <div>
            <h3 className="font-semibold mb-2">基础参数</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>画布尺寸：</strong>烟花显示区域大小</li>
              <li><strong>发射范围：</strong>烟花从底部多高的范围内发射</li>
              <li><strong>运动速度：</strong>烟花上升的速度</li>
              <li><strong>小球半径：</strong>爆炸后小球的大小</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">动画参数</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>小球数量：</strong>每个烟花爆炸后的小球数量</li>
              <li><strong>间隔时间：</strong>烟花发射的时间间隔</li>
              <li><strong>最大数量：</strong>同时存在的烟花数量上限</li>
              <li><strong>颜色主题：</strong>不同的颜色搭配方案</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
