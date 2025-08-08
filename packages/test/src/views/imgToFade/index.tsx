import { imgToFade } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { type FileItem, Uploader } from '@/components/Uploader'
import { useGetState } from '@/hooks'

/** 预设配置 */
const presets = [
  {
    name: '默认效果',
    speed: 1.25,
    extraDelCount: 20,
    ballCount: 15,
    bgc: '#000000',
  },
  {
    name: '快速消散',
    speed: 2.5,
    extraDelCount: 40,
    ballCount: 25,
    bgc: '#000000',
  },
  {
    name: '缓慢消散',
    speed: 0.8,
    extraDelCount: 10,
    ballCount: 8,
    bgc: '#000000',
  },
  {
    name: '白色背景',
    speed: 1.25,
    extraDelCount: 20,
    ballCount: 15,
    bgc: '#ffffff',
  },
]

export default function ImgToFadeTest() {
  const [config, setConfig] = useGetState({
    width: 800,
    height: 600,
    imgWidth: 640,
    imgHeight: 360,
    ...presets[0],
  }, true)

  const [currentImage, setCurrentImage] = useState<string>(() => new URL('@/assets/img/umr.webp', import.meta.url).href)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  /** 开始淡化效果 */
  const startFadeEffect = useCallback(debounce(async () => {
    if (!canvasRef.current || !currentImage) {
      console.warn('画布或图片未准备好')
      return
    }

    try {
      /** 使用 getLatest() 获取最新配置 */
      const latestConfig = setConfig.getLatest()

      /** 设置画布尺寸 */
      canvasRef.current.width = latestConfig.width
      canvasRef.current.height = latestConfig.height

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
    }
  }, 80), [setConfig, currentImage])

  /** 上传图片 */
  const handleImageUpload = (files: FileItem[]) => {
    if (files.length > 0) {
      setCurrentImage(files[0].base64)
    }
  }

  /** 应用预设配置 */
  const applyPreset = (presetConfig: any) => {
    setConfig(prev => ({ ...prev, ...presetConfig }))
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig({ [key]: value })
  }

  /** 监听配置和图片变化，自动重新启动效果 */
  useEffect(() => {
    startFadeEffect()
  }, [config, currentImage, startFadeEffect])

  /** 组件卸载时清理 */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen from-purple-50 to-pink-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          🖼️ 图像淡化效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 图像灰飞烟灭效果，支持自定义参数和实时预览
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */}
        <div className="relative flex flex-1 items-center justify-center">
          <canvas
            ref={ canvasRef }
            className="border border-gray-300 rounded-lg shadow-xl dark:border-gray-600"
            width={ config.width }
            height={ config.height }
            style={ { maxWidth: '100%', height: 'auto' } }
          />
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
                <div className="grid grid-cols-2 gap-2">
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

              {/* 图片选择 */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  选择图片
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm text-gray-600 font-medium dark:text-gray-300">
                      上传图片
                    </h4>
                    <Uploader
                      accept="image/*"
                      onChange={ handleImageUpload }
                      className="w-full"
                    >
                      <div className="border-2 border-gray-300 rounded-lg border-dashed p-4 text-center transition-colors dark:border-gray-600 hover:border-blue-400">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          点击或拖拽上传图片
                        </p>
                      </div>
                    </Uploader>
                  </div>

                  {currentImage && (
                    <div className="text-center">
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        当前图片预览
                      </p>
                      <img
                        src={ currentImage }
                        alt="当前选择的图片"
                        className="max-h-24 max-w-32 border border-gray-300 rounded object-contain dark:border-gray-600"
                      />
                    </div>
                  )}
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
                    图片宽度
                  </label>
                  <NumberInput
                    value={ config.imgWidth }
                    onChange={ v => updateConfig('imgWidth', v) }
                    min={ 200 }
                    max={ 600 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    图片高度
                  </label>
                  <NumberInput
                    value={ config.imgHeight }
                    onChange={ v => updateConfig('imgHeight', v) }
                    min={ 150 }
                    max={ 400 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    移动速度 (
                    {config.speed}
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
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    额外删除像素 (
                    {config.extraDelCount}
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
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    每帧小球数量 (
                    {config.ballCount}
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
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    背景颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={ config.bgc }
                      onChange={ e => updateConfig('bgc', e.target.value) }
                      className="h-8 w-12 border-0 p-0"
                    />
                    <input
                      type="text"
                      value={ config.bgc }
                      onChange={ e => updateConfig('bgc', e.target.value) }
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* 使用说明 */}
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                  <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                    使用说明
                  </h3>
                  <div className="text-sm text-gray-600 space-y-3 dark:text-gray-300">
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
