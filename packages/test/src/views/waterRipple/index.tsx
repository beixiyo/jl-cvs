import { WaterRipple, getColor } from '@jl-org/cvs'
import { cn } from '@/utils'
import { memo, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

export default function WaterRippleView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rippleRef = useRef<WaterRipple | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [config, setConfig] = useState({
    circleCount: 25,
    intensity: 1,
    randomColor: false,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    // 创建水波纹实例
    const ripple = new WaterRipple({
      canvas: canvasRef.current,
      onResize() {
        const container = canvasRef.current?.parentElement
        if (container && ripple) {
          ripple.setSize(container.clientWidth, container.clientHeight)
        }
      },
      circleCount: config.circleCount,
      intensity: config.intensity,
      strokeStyle: config.randomColor ? getColor : '#00bcd4',
    })

    rippleRef.current = ripple

    // 设置画布样式
    const canvas = canvasRef.current
    canvas.style.background = '#1a1a1a'
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    // 初始化大小
    const container = canvas.parentElement
    if (container) {
      ripple.setSize(container.clientWidth, container.clientHeight)
    }

    // 窗口大小变化监听
    const handleResize = () => {
      const container = canvasRef.current?.parentElement
      if (container && ripple) {
        ripple.setSize(container.clientWidth, container.clientHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [config])

  const handleConfigChange = (key: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex size-full bg-gray-900">
      {/* 左侧控制面板 */ }
      <div className="w-80 p-6 bg-gray-800 text-white overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-cyan-400">水波纹效果</h1>

        <Card className="mb-6 bg-gray-700 border-gray-600">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">配置参数</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  圈数: { config.circleCount }
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={ config.circleCount }
                  onChange={ (e) => handleConfigChange('circleCount', Number(e.target.value)) }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  波纹强度: { config.intensity }
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={ config.intensity }
                  onChange={ (e) => handleConfigChange('intensity', Number(e.target.value)) }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="randomColor"
                  checked={ config.randomColor }
                  onChange={ (e) => handleConfigChange('randomColor', e.target.checked) }
                  className="w-4 h-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                />
                <label htmlFor="randomColor" className="text-sm font-medium">
                  随机颜色 (癫痫患者慎选)
                </label>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-700 border-gray-600">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-cyan-300">使用说明</h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>• 点击画布任意位置产生水波纹</li>
              <li>• 调整圈数控制波纹的密度</li>
              <li>• 调整强度控制波纹的激烈程度</li>
              <li>• 开启随机颜色获得炫彩效果</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* 右侧画布区域 */ }
      <div className="flex-1 relative">
        <canvas
          ref={ canvasRef }
          className={ cn(
            'absolute inset-0 cursor-crosshair',
            'transition-opacity duration-300',
            isPlaying ? 'opacity-100' : 'opacity-75'
          ) }
        />

        { !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 text-white px-4 py-2 rounded-lg">
              已暂停
            </div>
          </div>
        ) }
      </div>
    </div>
  )
}