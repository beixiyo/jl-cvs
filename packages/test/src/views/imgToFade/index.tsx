import { imgToFade } from '@jl-org/cvs'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { Uploader, type FileItem } from '@/components/Uploader'
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
  const [currentImage, setCurrentImage] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  // 预设图片 - 使用稳定可靠的图片资源
  const presetImages = [
    {
      name: '风景图片',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: '城市夜景',
      url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: '自然风光',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: '抽象艺术',
      url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: '几何图案',
      url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: '色彩渐变',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'
    },
  ]

  // 预设配置
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

  // 开始淡化效果
  const startFadeEffect = async () => {
    if (!canvasRef.current || !currentImage) {
      alert('请先选择一张图片')
      return
    }

    try {
      setIsPlaying(true)

      // 使用 getLatest() 获取最新配置
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
    } catch (error) {
      console.error('淡化效果启动失败:', error)
      alert('淡化效果启动失败，请检查图片是否可用')
      setIsPlaying(false)
    }
  }

  // 停止效果
  const stopEffect = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsPlaying(false)

    // 清空画布
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  // 上传图片
  const handleImageUpload = (files: FileItem[]) => {
    if (files.length > 0) {
      setCurrentImage(files[0].base64)
      stopEffect() // 停止当前效果
    }
  }

  // 选择预设图片
  const selectPresetImage = (url: string) => {
    setCurrentImage(url)
    stopEffect() // 停止当前效果
  }

  // 应用预设配置
  const applyPreset = (presetConfig: any) => {
    setConfig(prev => ({ ...prev, ...presetConfig }))
    stopEffect() // 停止当前效果
  }

  // 更新配置
  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  // 自动启动效果
  useEffect(() => {
    // 设置默认图片并自动启动
    if (presetImages.length > 0) {
      setCurrentImage(presetImages[0].url)
      // 延迟启动，确保组件完全加载
      setTimeout(() => {
        if (canvasRef.current && presetImages[0].url) {
          startFadeEffect()
        }
      }, 1000)
    }
  }, [])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 h-screen overflow-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🖼️ 图像淡化效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 图像灰飞烟灭效果，支持自定义参数和实时预览
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
            预设效果
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
          </div>
        </div>

        {/* 图片选择 */ }
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
            选择图片
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
                预设图片
              </h4>
              <div className="grid grid-cols-2 gap-2">
                { presetImages.map((img, index) => (
                  <Button
                    key={ index }
                    onClick={ () => selectPresetImage(img.url) }
                    variant="primary"
                    size="sm"
                    className="text-xs"
                  >
                    { img.name }
                  </Button>
                )) }
              </div>
            </div>
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
              图片宽度
            </label>
            <Input
              type="number"
              value={ config.imgWidth }
              onChange={ (e) => updateConfig('imgWidth', Number(e.target.value)) }
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
              onChange={ (e) => updateConfig('imgHeight', Number(e.target.value)) }
              min={ 150 }
              max={ 400 }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              移动速度 ({ config.speed })
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
                  } else if (Array.isArray(value)) {
                    updateConfig('speed', value[0])
                  }
                } }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              额外删除像素 ({ config.extraDelCount })
            </label>
            <div className="px-2">
              <Slider
                min={ 5 }
                max={ 50 }
                value={ config.extraDelCount }
                onChange={ (value) => {
                  if (typeof value === 'number') {
                    updateConfig('extraDelCount', value)
                  } else if (Array.isArray(value)) {
                    updateConfig('extraDelCount', value[0])
                  }
                } }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              每帧小球数量 ({ config.ballCount })
            </label>
            <div className="px-2">
              <Slider
                min={ 5 }
                max={ 30 }
                value={ config.ballCount }
                onChange={ (value) => {
                  if (typeof value === 'number') {
                    updateConfig('ballCount', value)
                  } else if (Array.isArray(value)) {
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
                onChange={ (e) => updateConfig('bgc', e.target.value) }
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                type="text"
                value={ config.bgc }
                onChange={ (e) => updateConfig('bgc', e.target.value) }
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 效果展示区域 */ }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            淡化效果预览
          </h3>
          <div className="flex flex-col items-center space-y-4">
            <canvas
              ref={ canvasRef }
              className="border border-gray-300 dark:border-gray-600 rounded-lg"
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
                { isPlaying ? '效果进行中...' : '🎬 开始淡化' }
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

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            使用说明
          </h3>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="font-semibold mb-2">操作步骤</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>选择或上传一张图片</li>
                <li>调整画布和图片尺寸参数</li>
                <li>配置淡化效果参数</li>
                <li>点击"开始淡化"观看效果</li>
                <li>可随时停止并重新开始</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">参数说明</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>移动速度：</strong>粒子飞散的速度倍数</li>
                <li><strong>额外删除像素：</strong>每次额外删除的像素点数量</li>
                <li><strong>每帧小球数量：</strong>每帧生成的粒子数量</li>
                <li><strong>背景颜色：</strong>画布背景色</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">技术特点</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>基于 Canvas 像素操作实现</li>
                <li>粒子系统模拟灰飞烟灭效果</li>
                <li>支持自定义图片尺寸和效果参数</li>
                <li>实时渲染，流畅动画</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">应用场景</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>网页特效和动画展示</li>
                <li>游戏中的消失效果</li>
                <li>创意广告和营销页面</li>
                <li>艺术创作和视觉设计</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
