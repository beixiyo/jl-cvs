import { imgToTxt } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Slider } from '@/components/Slider'
import { type FileItem, Uploader } from '@/components/Uploader'
import { useGetState, useTheme } from '@/hooks'

type ContentType = 'text' | 'image' | 'video'

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

/** 获取预设配置 - 根据主题动态调整颜色 */
function getPresets(theme: string) {
  return [
    {
      name: '默认文字',
      replaceText: '6',
      gap: 10,
      txtStyle: {
        family: 'Microsoft YaHei',
        size: 200,
        color: theme === 'dark'
          ? '#ffffff'
          : '#000000',
      },
      txt: '哎呀你干嘛',
    },
    {
      name: '密集效果',
      replaceText: '█',
      gap: 5,
      txtStyle: { family: 'Microsoft YaHei', size: 100, color: '#ff0000' },
      txt: 'DENSE',
    },
    {
      name: '稀疏效果',
      replaceText: '●',
      gap: 20,
      txtStyle: { family: 'Arial', size: 300, color: '#0066cc' },
      txt: 'SPARSE',
    },
    {
      name: '彩色字符',
      replaceText: '♦',
      gap: 8,
      txtStyle: { family: 'SimHei', size: 150, color: '#ff6600' },
      txt: '彩色',
    },
    {
      name: '主题适配',
      replaceText: '★',
      gap: 12,
      txtStyle: {
        family: 'Microsoft YaHei',
        size: 180,
        color: theme === 'dark'
          ? '#64b5f6'
          : '#1976d2',
      },
      txt: '主题色',
    },
  ]
}

export default function ImgToTxtTest() {
  const [theme] = useTheme()

  const [config, setConfig] = useGetState({
    name: '默认文字',
    replaceText: '6',
    gap: 9,
    isDynamic: false,
    isGray: false,
    txtStyle: {
      family: 'Microsoft YaHei',
      size: 500,
      color: theme === 'dark'
        ? '#ffffff'
        : '#000000',
    },
    txt: '哎呀你干嘛',
    width: 800,
    height: 600,
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const effectRef = useRef<{ start: () => void, stop: () => void } | null>(null)

  const [contentType, setContentType] = useState<ContentType>('image')
  const [currentImage, setCurrentImage] = useState<string>(() => new URL('@/assets/img/umr.webp', import.meta.url).href)
  const [currentVideo, setCurrentVideo] = useState<string>(() => new URL('@/assets/video/video.mp4', import.meta.url).href)

  /** 开始效果 */
  const startEffect = useCallback(debounce(async () => {
    if (!canvasRef.current) {
      console.warn('画布未准备好')
      return
    }

    try {
      effectRef.current?.stop()
      /** 使用 getLatest() 获取最新配置 */
      const latestConfig = setConfig.getLatest()

      /** 设置画布尺寸 */
      canvasRef.current.width = latestConfig.width
      canvasRef.current.height = latestConfig.height

      let opts: any = {}

      if (contentType === 'text') {
        opts = {
          txt: latestConfig.txt,
          txtStyle: latestConfig.txtStyle,
        }
      }
      else if (contentType === 'image') {
        if (!currentImage) {
          console.warn('请先选择一张图片')
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
          console.warn('请先选择一个视频')
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
    }
  }, 80), [setConfig, contentType, currentImage, currentVideo])

  /** 上传图片 */
  const handleImageUpload = (files: FileItem[]) => {
    if (files.length > 0) {
      setCurrentImage(files[0].base64)
      setContentType('image')
    }
  }

  /** 上传视频 */
  const handleVideoUpload = (files: FileItem[]) => {
    if (files.length > 0) {
      setCurrentVideo(files[0].base64)
      setContentType('video')
    }
  }

  /** 应用预设配置 */
  const applyPreset = (presetConfig: any) => {
    setConfig(prev => ({ ...prev, ...presetConfig }))
    setContentType('text')
  }

  /** 更新配置 */
  const updateConfig = useCallback((key: string, value: any) => {
    setConfig({ [key]: value })
  }, [setConfig])

  /** 更新文字样式 */
  const updateTxtStyle = useCallback((key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      txtStyle: { ...prev.txtStyle, [key]: value },
    }))
  }, [setConfig])

  /** 监听配置变化，自动重新启动效果 */
  useEffect(() => {
    startEffect()
  }, [config, contentType, startEffect])

  /** 主题变化时自动更新文字颜色 */
  useEffect(() => {
    const newColor = theme === 'dark'
      ? '#ffffff'
      : '#000000'
    updateTxtStyle('color', newColor)
  }, [theme, updateTxtStyle])

  /** 组件卸载时清理 */
  useEffect(() => {
    return () => {
      if (effectRef.current) {
        effectRef.current.stop()
      }
    }
  }, [])

  const presets = getPresets(theme)

  return (
    <div className="min-h-screen from-orange-50 to-red-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 - 全宽显示 */ }
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          📝 图像转文字效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          用文字字符绘制图片、视频或文本，支持多种自定义参数
        </p>
      </div>

      {/* 响应式布局容器 */ }
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */ }
        <div className="flex-1 flex justify-center items-center relative">
          <canvas
            ref={ canvasRef }
            className="border border-gray-300 rounded-lg bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800"
            width={ config.width }
            height={ config.height }
            style={ { maxWidth: '100%', height: 'auto' } }
          />
        </div>

        {/* 右侧：控制面板 */ }
        <div className="w-full lg:w-96">
          <Card>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
                控制面板
              </h2>

              {/* 预设配置 */ }
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  预设效果
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  { presets.map((preset, index) => (
                    <Button
                      key={ `preset-${preset.name}-${index}` }
                      onClick={ () => applyPreset(preset) }
                      variant={ config.name === preset.name
                        ? 'primary'
                        : 'default' }
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
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  内容类型
                </h3>
                <div className="mb-4 flex gap-2">
                  <Button
                    onClick={ () => setContentType('text') }
                    variant={ contentType === 'text'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    📝 文字
                  </Button>
                  <Button
                    onClick={ () => setContentType('image') }
                    variant={ contentType === 'image'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    🖼️ 图片
                  </Button>
                  <Button
                    onClick={ () => setContentType('video') }
                    variant={ contentType === 'video'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    🎥 视频
                  </Button>
                </div>

                { contentType === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        显示文字
                      </label>
                      <Input
                        type="text"
                        value={ config.txt }
                        onChange={ v => updateConfig('txt', v) }
                        placeholder="输入要显示的文字"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        预设文字
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        { presetTexts.map(text => (
                          <Button
                            key={ `preset-text-${text}` }
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  </div>
                ) }

                { contentType === 'video' && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm text-gray-600 font-medium dark:text-gray-300">
                        上传视频
                      </h4>
                      <Uploader
                        accept="video/*"
                        onChange={ handleVideoUpload }
                        className="w-full"
                      >
                        <div className="border-2 border-gray-300 rounded-lg border-dashed p-4 text-center transition-colors dark:border-gray-600 hover:border-blue-400">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            点击或拖拽上传视频文件
                          </p>
                        </div>
                      </Uploader>
                    </div>
                  </div>
                ) }
              </div>

              {/* 基础参数配置 */ }
              <div className="mb-6">
                <h3 className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-200">
                  基础参数
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      填充字符
                    </label>
                    <Input
                      type="text"
                      value={ config.replaceText }
                      onChange={ v => updateConfig('replaceText', v) }
                      placeholder="用于填充的字符"
                      maxLength={ 5 }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      字符间隙 (
                      { config.gap }
                      px)
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 1 }
                        max={ 20 }
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                          画布宽度 (
                          { config.width }
                          px)
                        </label>
                        <div className="px-2">
                          <Slider
                            min={ 200 }
                            max={ 1200 }
                            value={ config.width }
                            onChange={ (value) => {
                              if (typeof value === 'number') {
                                updateConfig('width', value)
                              }
                              else if (Array.isArray(value)) {
                                updateConfig('width', value[0])
                              }
                            } }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                          画布高度 (
                          { config.height }
                          px)
                        </label>
                        <div className="px-2">
                          <Slider
                            min={ 150 }
                            max={ 800 }
                            value={ config.height }
                            onChange={ (value) => {
                              if (typeof value === 'number') {
                                updateConfig('height', value)
                              }
                              else if (Array.isArray(value)) {
                                updateConfig('height', value[0])
                              }
                            } }
                          />
                        </div>
                      </div>
                    </div>
                  ) }

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex items-center border border-gray-200 rounded-lg p-3 transition-colors space-x-2 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={ config.isDynamic }
                        onChange={ e => updateConfig('isDynamic', e.target.checked) }
                        className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 font-medium dark:text-gray-200">动态效果</span>
                    </label>
                    <label className="flex items-center border border-gray-200 rounded-lg p-3 transition-colors space-x-2 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={ config.isGray }
                        onChange={ e => updateConfig('isGray', e.target.checked) }
                        className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 font-medium dark:text-gray-200">灰度模式</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 文字样式配置 */ }
              { contentType === 'text' && (
                <div className="mb-6">
                  <h3 className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-200">
                    文字样式
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        字体
                      </label>
                      <Select
                        value={ config.txtStyle.family }
                        onChange={ value => updateTxtStyle('family', value) }
                        options={ fontOptions }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
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
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        字体颜色
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={ config.txtStyle.color }
                          onChange={ v => updateTxtStyle('color', v) }
                          className="h-10 w-16 border-0 rounded p-1"
                        />
                        <Input
                          type="text"
                          value={ config.txtStyle.color }
                          onChange={ v => updateTxtStyle('color', v) }
                          className="flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) }

              {/* 使用说明 */ }
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  使用说明
                </h3>
                <div className="text-sm text-gray-600 space-y-3 dark:text-gray-300">
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
