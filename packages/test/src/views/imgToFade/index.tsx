import { imgToFade } from '@jl-org/cvs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { type FileItem, Uploader } from '@/components/Uploader'
import { useGetState } from '@/hooks'

export default function ImgToFadeTest() {
  const [config, setConfig] = useGetState({
    width: 800,
    height: 600,
    imgWidth: 400,
    imgHeight: 300,
    speed: 1.25,
    extraDelCount: 20,
    ballCount: 15,
    bgc: '#000000',
  }, true)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentImage, setCurrentImage] = useState<string>(new URL('@/assets/umr.webp', import.meta.url).href)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  /** 预设配置 */
  const presets = [
    {
      name: '默认效果',
      config: {
        speed: 1.25,
        extraDelCount: 20,
        ballCount: 15,
        bgc: '#000000',
      },
    },
    {
      name: '快速消散',
      config: {
        speed: 2.5,
        extraDelCount: 40,
        ballCount: 25,
        bgc: '#000000',
      },
    },
    {
      name: '缓慢消散',
      config: {
        speed: 0.8,
        extraDelCount: 10,
        ballCount: 8,
        bgc: '#000000',
      },
    },
    {
      name: '白色背景',
      config: {
        speed: 1.25,
        extraDelCount: 20,
        ballCount: 15,
        bgc: '#ffffff',
      },
    },
  ]

  /** 开始淡化效果 */
  const startFadeEffect = async () => {
    if (!canvasRef.current || !currentImage) {
      alert('请先选择一张图片')
      return
    }

    try {
      setIsPlaying(true)

      /** 使用 getLatest() 获取最新配置 */
      const latestConfig = setConfig.getLatest()

      await imgToFade(canvasRef.current, {
        src: currentImage,
        width: latestConfig.width,
        height: latestConfig.height,
        imgWidth: latestConfig.imgWidth,
        imgHeight: latestConfig.imgHeight,
        speed: latestConfig.speed,
        extraDelCount: latestConfig.extraDelCount,
        ballCount: latestConfig.ballCount,
        bgc: latestConfig.bgc,
      })
    }
    catch (error) {
      console.error('淡化效果启动失败:', error)
      alert('淡化效果启动失败，请检查图片是否可用')
      setIsPlaying(false)
    }
  }

  /** 停止效果 */
  const stopEffect = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsPlaying(false)

    /** 清空画布 */
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  /** 上传图片 */
  const handleImageUpload = (files: FileItem[]) => {
    if (files.length > 0) {
      setCurrentImage(files[0].base64)
      stopEffect() // 停止当前效果
    }
  }

  /** 选择预设图片 */
  const selectPresetImage = (url: string) => {
    setCurrentImage(url)
    stopEffect() // 停止当前效果
  }

  /** 应用预设配置 */
  const applyPreset = (presetConfig: any) => {
    setConfig(prev => ({ ...prev, ...presetConfig }))
    stopEffect() // 停止当前效果
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  /** 组件卸载时清理 */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* 页面标题 - 全宽显示 */ }
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🖼️ 图像淡化效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 图像灰飞烟灭效果，支持自定义参数和实时预览
        </p>
      </div>

      {/* 响应式布局容器 */ }
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        {/* 左侧：效果展示区域 */ }
        <div className="flex-1">
          <Card className="p-6 min-h-[600px]">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              图像淡化效果展示
            </h2>
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
              <canvas
                ref={ canvasRef }
                className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl"
                width={ config.width }
                height={ config.height }
                style={ { maxWidth: '100%', height: 'auto' } }
              />

              <div className="flex gap-2">
                <Button
                  onClick={ startFadeEffect }
                  disabled={ !currentImage || isPlaying }
                  variant="default"
                >
                  { isPlaying
                    ? '效果进行中...'
                    : '🎬 开始淡化' }
                </Button>
                <Button
                  onClick={ stopEffect }
                  disabled={ !isPlaying }
                  variant="primary"
                >
                  ⏹️ 停止效果
                </Button>
              </div>

              { currentImage && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    当前图片预览
                  </p>
                  <img
                    src={ currentImage }
                    alt="当前选择的图片"
                    className="max-w-32 max-h-24 object-contain border border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
              ) }
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
                <div className="grid grid-cols-2 gap-2">
                  { presets.map((preset, index) => (
                    <Button
                      key={ `preset-${preset.name}-${index}` }
                      onClick={ () => applyPreset(preset.config) }
                      size="sm"
                      className="text-xs"
                    >
                      { preset.name }
                    </Button>
                  )) }
                </div>
              </div>

              {/* 图片选择 */ }
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  选择图片
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
                      上传图片
                    </h4>
                    <Uploader
                      accept="image/*"
                      onChange={ handleImageUpload }
                      className="w-full"
                    >
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          点击或拖拽上传图片
                        </p>
                      </div>
                    </Uploader>
                  </div>
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
                    图片宽度
                  </label>
                  <Input
                    type="number"
                    value={ config.imgWidth }
                    onChange={ e => updateConfig('imgWidth', Number(e.target.value)) }
                    min={ 200 }
                    max={ 600 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    图片高度
                  </label>
                  <Input
                    type="number"
                    value={ config.imgHeight }
                    onChange={ e => updateConfig('imgHeight', Number(e.target.value)) }
                    min={ 150 }
                    max={ 400 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    移动速度 (
                    { config.speed }
                    )
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 0.5 }
                      max={ 5 }
                      step={ 0.1 }
                      value={ config.speed }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('speed', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('speed', value[0])
                        }
                      } }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    额外删除像素 (
                    { config.extraDelCount }
                    )
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 5 }
                      max={ 50 }
                      value={ config.extraDelCount }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('extraDelCount', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('extraDelCount', value[0])
                        }
                      } }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    每帧小球数量 (
                    { config.ballCount }
                    )
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 5 }
                      max={ 30 }
                      value={ config.ballCount }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('ballCount', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('ballCount', value[0])
                        }
                      } }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    背景颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={ config.bgc }
                      onChange={ e => updateConfig('bgc', e.target.value) }
                      className="w-12 h-8 p-0 border-0"
                    />
                    <Input
                      type="text"
                      value={ config.bgc }
                      onChange={ e => updateConfig('bgc', e.target.value) }
                      className="flex-1"
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
                      <strong>移动速度：</strong>
                      粒子飞散的速度倍数
                    </div>
                    <div>
                      <strong>额外删除像素：</strong>
                      每次额外删除的像素点数量
                    </div>
                    <div>
                      <strong>每帧小球数量：</strong>
                      每帧生成的粒子数量
                    </div>
                    <div>
                      <strong>背景颜色：</strong>
                      画布背景色
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
