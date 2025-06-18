import { createFirework, createFirework2 } from '@jl-org/cvs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { cn } from '@/utils'

type FireworkType = 'classic' | 'burst'

export default function FireworkTest() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [fireworkType, setFireworkType] = useState<FireworkType>('burst')
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
  const firework2InstanceRef = useRef<{
    addFirework: () => void
    stop: () => void
    resume: () => void
  } | null>(null)
  const firework2IntervalRef = useRef<NodeJS.Timeout | null>(null)

  /** 预设配置 */
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

  /** 颜色预设 */
  const colorPresets = useMemo(() => [
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
  ], [])

  const [selectedColorPreset, setSelectedColorPreset] = useState(0)

  /** 停止烟花 */
  const stopFirework = useCallback(() => {
    /** 停止经典烟花 */
    if (stopFireworkRef.current) {
      stopFireworkRef.current()
      stopFireworkRef.current = null
    }

    /** 停止二段爆炸烟花 */
    if (firework2InstanceRef.current) {
      firework2InstanceRef.current.stop()
      firework2InstanceRef.current = null
    }

    /** 清除二段爆炸烟花的定时器 */
    if (firework2IntervalRef.current) {
      clearInterval(firework2IntervalRef.current)
      firework2IntervalRef.current = null
    }

    setIsPlaying(false)
  }, [])

  /** 开始烟花 */
  const startFirework = useCallback(() => {
    if (!canvasRef.current)
      return

    stopFirework()

    if (fireworkType === 'classic') {
      /** 经典烟花 */
      const currentColorPreset = colorPresets[selectedColorPreset]
      const stopFn = createFirework(canvasRef.current, {
        ...config,
        getFireworkColor: currentColorPreset.getFireworkColor,
        getBoomColor: currentColorPreset.getBoomColor,
      })
      stopFireworkRef.current = stopFn
    }
    else {
      /** 二段爆炸烟花 */
      const ctx = canvasRef.current.getContext('2d')!
      const firework2Instance = createFirework2(canvasRef.current, {
        ctx,
        width: config.width,
        height: config.height,
      })

      firework2InstanceRef.current = firework2Instance

      /** 设置定时器来定期发射烟花 */
      firework2IntervalRef.current = setInterval(() => {
        firework2Instance.addFirework()
      }, config.gapTime)

      /** 立即发射第一个烟花 */
      firework2Instance.addFirework()
    }

    setIsPlaying(true)
  }, [config, selectedColorPreset, colorPresets, stopFirework, fireworkType])

  /** 应用预设 */
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
    if (isPlaying) {
      stopFirework()
      setTimeout(() => {
        startFirework()
      }, 100)
    }
  }

  /** 更新配置 */
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

  /** 切换颜色预设 */
  const changeColorPreset = (index: number) => {
    setSelectedColorPreset(index)
    if (isPlaying) {
      stopFirework()
      setTimeout(() => {
        startFirework()
      }, 100)
    }
  }

  /** 切换烟花类型 */
  const changeFireworkType = (type: FireworkType) => {
    setFireworkType(type)
    if (isPlaying) {
      stopFirework()
      setTimeout(() => {
        startFirework()
      }, 100)
    }
  }

  /** 页面加载时自动开始播放烟花，组件卸载时停止烟花 */
  useEffect(() => {
    /** 延迟一点时间确保 canvas 已经渲染完成 */
    const timer = setTimeout(() => {
      startFirework()
    }, 100)

    return () => {
      clearTimeout(timer)
      stopFirework()
    }
  }, [startFirework, stopFirework])

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🎆 烟花效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 烟花动画效果，支持多种配置参数和颜色主题
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1">
          <Card className="p-6 min-h-[600px]">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              烟花效果展示
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

        {/* 右侧：控制面板 */}
        <div className="w-full lg:w-96">
          <Card>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                控制面板
              </h2>

              {/* 烟花类型选择器 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  烟花类型
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={ () => changeFireworkType('classic') }
                    variant={ fireworkType === 'classic'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    🎆 经典烟花
                  </Button>
                  <Button
                    onClick={ () => changeFireworkType('burst') }
                    variant={ fireworkType === 'burst'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    💥 二段爆炸烟花
                  </Button>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="mb-6">
                <Button
                  onClick={ isPlaying
                    ? stopFirework
                    : startFirework }
                  className={ cn(
                    'w-full px-6 py-2 mb-4',
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600',
                  ) }
                >
                  { isPlaying
                    ? '🛑 停止烟花'
                    : '🎆 开始烟花' }
                </Button>
              </div>

              {/* 预设配置 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  预设效果
                </h3>
                <div className="flex flex-wrap gap-2">
                  { presets.map(preset => (
                    <Button
                      key={ preset.name }
                      onClick={ () => applyPreset(preset.config) }
                      size="sm"
                    >
                      { preset.name }
                    </Button>
                  )) }
                </div>
              </div>

              {/* 颜色主题 - 仅对经典烟花生效 */}
              { fireworkType === 'classic' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                    颜色主题
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    { colorPresets.map((preset, index) => (
                      <Button
                        key={ preset.name }
                        onClick={ () => changeColorPreset(index) }
                        variant={ selectedColorPreset === index
                          ? 'primary'
                          : 'default' }
                        size="sm"
                      >
                        { preset.name }
                      </Button>
                    )) }
                  </div>
                </div>
              ) }

              {/* 参数配置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  参数配置
                  { fireworkType === 'burst' && (
                    <span className="text-sm text-orange-600 dark:text-orange-400 ml-2">
                      (二段爆炸烟花仅支持部分参数)
                    </span>
                  ) }
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

                { fireworkType === 'classic' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                      发射范围
                    </label>
                    <Input
                      type="number"
                      value={ config.yRange }
                      onChange={ e => updateConfig('yRange', Number(e.target.value)) }
                      min={ 20 }
                      max={ 200 }
                    />
                  </div>
                ) }

                { fireworkType === 'classic' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                      运动速度
                    </label>
                    <Input
                      type="number"
                      value={ config.speed }
                      onChange={ e => updateConfig('speed', Number(e.target.value)) }
                      min={ 0.5 }
                      max={ 10 }
                      step={ 0.5 }
                    />
                  </div>
                ) }

                { fireworkType === 'classic' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                      小球半径
                    </label>
                    <Input
                      type="number"
                      value={ config.r }
                      onChange={ e => updateConfig('r', Number(e.target.value)) }
                      min={ 2 }
                      max={ 20 }
                    />
                  </div>
                ) }

                { fireworkType === 'classic' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                      小球数量
                    </label>
                    <Input
                      type="number"
                      value={ config.ballCount }
                      onChange={ e => updateConfig('ballCount', Number(e.target.value)) }
                      min={ 50 }
                      max={ 500 }
                    />
                  </div>
                ) }

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    间隔时间(ms)
                    { fireworkType === 'burst' && (
                      <span className="text-xs text-gray-500 ml-1">(发射间隔)</span>
                    ) }
                  </label>
                  <Input
                    type="number"
                    value={ config.gapTime }
                    onChange={ e => updateConfig('gapTime', Number(e.target.value)) }
                    min={ 100 }
                    max={ 2000 }
                  />
                </div>

                { fireworkType === 'classic' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                      最大数量
                    </label>
                    <Input
                      type="number"
                      value={ config.maxCount }
                      onChange={ e => updateConfig('maxCount', Number(e.target.value)) }
                      min={ 1 }
                      max={ 10 }
                    />
                  </div>
                ) }
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
