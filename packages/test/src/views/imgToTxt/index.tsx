import { imgToTxt } from '@jl-org/cvs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Slider } from '@/components/Slider'
import { type FileItem, Uploader } from '@/components/Uploader'
import { useGetState, useTheme } from '@/hooks'

type ContentType = 'text' | 'image' | 'video'

export default function ImgToTxtTest() {
  const [theme] = useTheme()

  const [config, setConfig] = useGetState({
    replaceText: '6',
    gap: 10,
    isDynamic: false,
    isGray: false,
    txtStyle: {
      family: 'Microsoft YaHei',
      size: 200,
      color: theme === 'dark' ? '#ffffff' : '#000000',
    },
    txt: '哎呀你干嘛',
    width: 800,
    height: 600,
  }, true)

  const [contentType, setContentType] = useState<ContentType>('text')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentImage, setCurrentImage] = useState<string>('')
  const [currentVideo, setCurrentVideo] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const effectRef = useRef<{ start: () => void, stop: () => void } | null>(null)

  /** 预设图片 - 使用本地资源 */
  const presetImages = [
    {
      name: '默认图片',
      url: new URL('@/assets/umr.webp', import.meta.url).href,
    },
    {
      name: '人物肖像',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
    },
    {
      name: '建筑轮廓',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center',
    },
    {
      name: '动物图案',
      url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop&crop=center',
    },
    {
      name: '简约图形',
      url: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=400&h=300&fit=crop&crop=center',
    },
    {
      name: '文字标识',
      url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop&crop=center',
    },
    {
      name: '高对比度',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop&crop=center',
    },
  ]

  /** 预设视频 - 使用稳定可靠的视频资源 */
  const presetVideos = [
    {
      name: '抽象动画',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
    },
    {
      name: '几何图形',
      url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    },
    {
      name: '色彩变化',
      url: 'https://file-examples.com/storage/fe86c86b9b66f0c2ccf1e8f/2017/10/file_example_MP4_480_1_5MG.mp4',
    },
  ]

  /** 字体选项 */
  const fontOptions = [
    { value: 'Microsoft YaHei', label: '微软雅黑' },
    { value: 'SimSun', label: '宋体' },
    { value: 'SimHei', label: '黑体' },
    { value: 'KaiTi', label: '楷体' },
    { value: 'FangSong', label: '仿宋' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
  ]

  /** 预设文本 */
  const presetTexts = [
    '哎呀你干嘛',
    'Hello World',
    '6666666',
    'ABCDEFG',
    '你好世界',
    '★☆★☆★',
    '123456789',
    '❤️💖💕💗',
  ]

  /** 预设配置 - 根据主题动态调整颜色 */
  const presets = [
    {
      name: '默认文字',
      config: {
        replaceText: '6',
        gap: 10,
        txtStyle: { family: 'Microsoft YaHei', size: 200, color: theme === 'dark' ? '#ffffff' : '#000000' },
        txt: '哎呀你干嘛',
      },
    },
    {
      name: '密集效果',
      config: {
        replaceText: '█',
        gap: 5,
        txtStyle: { family: 'Microsoft YaHei', size: 100, color: '#ff0000' },
        txt: 'DENSE',
      },
    },
    {
      name: '稀疏效果',
      config: {
        replaceText: '●',
        gap: 20,
        txtStyle: { family: 'Arial', size: 300, color: '#0066cc' },
        txt: 'SPARSE',
      },
    },
    {
      name: '彩色字符',
      config: {
        replaceText: '♦',
        gap: 8,
        txtStyle: { family: 'SimHei', size: 150, color: '#ff6600' },
        txt: '彩色',
      },
    },
    {
      name: '主题适配',
      config: {
        replaceText: '★',
        gap: 12,
        txtStyle: { family: 'Microsoft YaHei', size: 180, color: theme === 'dark' ? '#64b5f6' : '#1976d2' },
        txt: '主题色',
      },
    },
  ]

  /** 开始效果 */
  const startEffect = async () => {
    if (!canvasRef.current) {
      alert('画布未准备好')
      return
    }

    try {
      setIsPlaying(true)

      /** 使用 getLatest() 获取最新配置 */
      const latestConfig = setConfig.getLatest()

      let opts: any = {}

      if (contentType === 'text') {
        opts = {
          txt: latestConfig.txt,
          txtStyle: latestConfig.txtStyle,
        }
      }
      else if (contentType === 'image') {
        if (!currentImage) {
          alert('请先选择一张图片')
          setIsPlaying(false)
          return
        }
        opts = {
          img: currentImage,
          width: latestConfig.width,
          height: latestConfig.height,
        }
      }
      else if (contentType === 'video') {
        if (!currentVideo) {
          alert('请先选择一个视频')
          setIsPlaying(false)
          return
        }
        opts = {
          video: currentVideo,
          width: latestConfig.width,
          height: latestConfig.height,
        }
      }

      const effect = await imgToTxt({
        canvas: canvasRef.current,
        replaceText: latestConfig.replaceText,
        gap: latestConfig.gap,
        isDynamic: latestConfig.isDynamic || contentType === 'video',
        isGray: latestConfig.isGray,
        opts,
      })

      effectRef.current = effect
    }
    catch (error) {
      console.error('效果启动失败:', error)
      alert('效果启动失败，请检查配置')
      setIsPlaying(false)
    }
  }

  /** 停止效果 */
  const stopEffect = () => {
    if (effectRef.current) {
      effectRef.current.stop()
      effectRef.current = null
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
      setContentType('image')
      stopEffect()
    }
  }

  /** 上传视频 */
  const handleVideoUpload = (files: FileItem[]) => {
    if (files.length > 0) {
      setCurrentVideo(files[0].base64)
      setContentType('video')
      stopEffect()
    }
  }

  /** 选择预设图片 */
  const selectPresetImage = (url: string) => {
    setCurrentImage(url)
    setContentType('image')
    stopEffect()
  }

  /** 选择预设视频 */
  const selectPresetVideo = (url: string) => {
    setCurrentVideo(url)
    setContentType('video')
    stopEffect()
  }

  /** 应用预设配置 */
  const applyPreset = (presetConfig: any) => {
    setConfig(prev => ({ ...prev, ...presetConfig }))
    setContentType('text')
    stopEffect()
  }

  /** 更新配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  /** 更新文字样式 */
  const updateTxtStyle = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      txtStyle: { ...prev.txtStyle, [key]: value },
    }))
  }

  /** 自动启动效果 */
  useEffect(() => {
    /** 默认使用文字模式自动启动 */
    setContentType('text')
    /** 延迟启动，确保组件完全加载 */
    setTimeout(() => {
      if (canvasRef.current) {
        startEffect()
      }
    }, 1000)
  }, [])

  /** 主题变化时自动更新文字颜色 */
  useEffect(() => {
    const newColor = theme === 'dark' ? '#ffffff' : '#000000'
    updateTxtStyle('color', newColor)
  }, [theme])

  /** 组件卸载时清理 */
  useEffect(() => {
    return () => {
      if (effectRef.current) {
        effectRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          📝 图像转文字效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          用文字字符绘制图片、视频或文本，支持多种自定义参数
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1">
          <Card className="p-6 min-h-[600px]">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              文字效果展示
            </h2>
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
              <canvas
                ref={ canvasRef }
                className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl bg-white dark:bg-gray-800"
                width={ config.width }
                height={ config.height }
                style={ { maxWidth: '100%', height: 'auto' } }
              />

              <div className="flex gap-2">
                <Button
                  onClick={ startEffect }
                  disabled={ isPlaying }
                  variant="default"
                >
                  { isPlaying
                    ? '效果运行中...'
                    : '🎬 开始效果' }
                </Button>
                <Button
                  onClick={ stopEffect }
                  disabled={ !isPlaying }
                  variant="primary"
                >
                  ⏹️ 停止效果
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  当前模式：
                  { contentType === 'text'
                    ? '文字'
                    : contentType === 'image'
                      ? '图片'
                      : '视频' }
                </p>
                <p>
                  { contentType === 'text'
                    ? `显示文字：${config.txt}`
                    : contentType === 'image'
                      ? '图片转文字效果'
                      : '视频转文字动画' }
                </p>
              </div>
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

              {/* 预设配置 */}
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

              {/* 内容类型选择 */ }
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  内容类型
                </h3>
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={ () => setContentType('text') }
                    variant={ contentType === 'text'
                      ? 'default'
                      : 'primary' }
                    size="sm"
                  >
                    📝 文字
                  </Button>
                  <Button
                    onClick={ () => setContentType('image') }
                    variant={ contentType === 'image'
                      ? 'default'
                      : 'primary' }
                    size="sm"
                  >
                    🖼️ 图片
                  </Button>
                  <Button
                    onClick={ () => setContentType('video') }
                    variant={ contentType === 'video'
                      ? 'default'
                      : 'primary' }
                    size="sm"
                  >
                    🎥 视频
                  </Button>
                </div>

                { contentType === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                        显示文字
                      </label>
                      <Input
                        type="text"
                        value={ config.txt }
                        onChange={ e => updateConfig('txt', e.target.value) }
                        placeholder="输入要显示的文字"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                        预设文字
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        { presetTexts.map((text, index) => (
                          <Button
                            key={ index }
                            onClick={ () => updateConfig('txt', text) }
                            variant="primary"
                            size="sm"
                            className="text-xs"
                          >
                            { text }
                          </Button>
                        )) }
                      </div>
                    </div>
                  </div>
                ) }

                { contentType === 'image' && (
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
                ) }

                { contentType === 'video' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
                        上传视频
                      </h4>
                      <Uploader
                        accept="video/*"
                        onChange={ handleVideoUpload }
                        className="w-full"
                      >
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            点击或拖拽上传视频文件
                          </p>
                        </div>
                      </Uploader>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
                        预设视频
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        { presetVideos.map((video, index) => (
                          <Button
                            key={ index }
                            onClick={ () => selectPresetVideo(video.url) }
                            variant="primary"
                            size="sm"
                            className="text-xs"
                          >
                            { video.name }
                          </Button>
                        )) }
                      </div>
                    </div>
                  </div>
                ) }
              </div>

              {/* 基础参数配置 */ }
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    填充字符
                  </label>
                  <Input
                    type="text"
                    value={ config.replaceText }
                    onChange={ e => updateConfig('replaceText', e.target.value) }
                    placeholder="用于填充的字符"
                    maxLength={ 5 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    字符间隙 (
                    { config.gap }
                    px)
                  </label>
                  <div className="px-2">
                    <Slider
                      min={ 1 }
                      max={ 30 }
                      value={ config.gap }
                      onChange={ (value) => {
                        if (typeof value === 'number') {
                          updateConfig('gap', value)
                        }
                        else if (Array.isArray(value)) {
                          updateConfig('gap', value[0])
                        }
                      } }
                    />
                  </div>
                </div>

                { (contentType === 'image' || contentType === 'video') && (
                  <>
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
                        min={ 150 }
                        max={ 800 }
                      />
                    </div>
                  </>
                ) }

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={ config.isDynamic }
                      onChange={ e => updateConfig('isDynamic', e.target.checked) }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">动态效果</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={ config.isGray }
                      onChange={ e => updateConfig('isGray', e.target.checked) }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">灰度模式</span>
                  </label>
                </div>
              </div>

              {/* 文字样式配置 */ }
              { contentType === 'text' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                    文字样式
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                        字体
                      </label>
                      <Select
                        value={ config.txtStyle.family }
                        onChange={ value => updateTxtStyle('family', value) }
                        options={ fontOptions }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                        字体大小 (
                        { config.txtStyle.size }
                        px)
                      </label>
                      <div className="px-2">
                        <Slider
                          min={ 50 }
                          max={ 500 }
                          value={ config.txtStyle.size }
                          onChange={ (value) => {
                            if (typeof value === 'number') {
                              updateTxtStyle('size', value)
                            }
                            else if (Array.isArray(value)) {
                              updateTxtStyle('size', value[0])
                            }
                          } }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                        字体颜色
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={ config.txtStyle.color }
                          onChange={ e => updateTxtStyle('color', e.target.value) }
                          className="w-12 h-8 p-0 border-0"
                        />
                        <Input
                          type="text"
                          value={ config.txtStyle.color }
                          onChange={ e => updateTxtStyle('color', e.target.value) }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) }

              {/* 使用说明 */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  使用说明
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <strong>填充字符：</strong>
                    用于构成图像的字符
                  </div>
                  <div>
                    <strong>字符间隙：</strong>
                    字符之间的间距，影响密度
                  </div>
                  <div>
                    <strong>动态效果：</strong>
                    是否实时更新（视频默认开启）
                  </div>
                  <div>
                    <strong>灰度模式：</strong>
                    将彩色转换为灰度显示
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
