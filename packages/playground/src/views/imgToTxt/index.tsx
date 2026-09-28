import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { Uploader } from '@/components/Uploader'
import { useDebounceFn, useGetState, useTheme } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { imgToTxt } from '@jl-org/cvs'
import { Type } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_IMAGE_URL, DEMO_VIDEO_URL } from '../_shared/releaseAssets'
import { useImageUpload } from '../_shared/useImageUpload'

type ContentType = 'text' | 'image' | 'video'

/** 快捷文本 */
const quickTexts = ['哎呀你干嘛', 'HELLO WORLD', 'jl-cvs', '666666', 'Canvas']

function getPresets(theme: string) {
  return [
    {
      name: '默认文字',
      replaceText: '6',
      gap: 9,
      txtStyle: {
        family: 'Microsoft YaHei',
        size: 500,
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
  const effectRef = useRef<{ start: () => void; stop: () => void } | null>(null)

  const [contentType, setContentType] = useState<ContentType>('image')
  const [currentImage, setCurrentImage] = useState<string>(DEMO_IMAGE_URL)
  const [currentVideo, setCurrentVideo] = useState<string>(DEMO_VIDEO_URL)

  const { imgSrc, onUpload, previewImgs } = useImageUpload()

  /** 上传图片 / 视频后切换内容类型 */
  useEffect(() => {
    if (imgSrc) {
      setCurrentImage(imgSrc)
      setContentType('image')
    }
  }, [imgSrc])

  /** 上传视频 */
  const handleVideoUpload = (files: File[]) => {
    const file = files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCurrentVideo(reader.result as string)
      setContentType('video')
    }
    reader.readAsDataURL(file)
  }

  /** 启动字符画效果；useDebounceFn 实例稳定且闭包始终最新 */
  const startEffect = useDebounceFn(
    async () => {
      if (!canvasRef.current) {
        console.warn('画布未准备好')
        return
      }

      effectRef.current?.stop()

      const latestConfig = setConfig.getLatest()

      try {
        canvasRef.current.width = latestConfig.width
        canvasRef.current.height = latestConfig.height

        /** 按内容类型组装源参数 */
        let opts: any = {}

        if (contentType === 'text') {
          opts = {
            txt: latestConfig.txt,
            txtStyle: latestConfig.txtStyle,
          }
        }
        else if (contentType === 'image') {
          opts = {
            img: currentImage,
            width: latestConfig.width,
            height: latestConfig.height,
          }
        }
        else {
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
    },
    { delay: 80 },
  )

  /** 应用预设 */
  const applyPreset = (preset: Record<string, any>) => {
    setConfig((prev) => ({ ...prev, ...preset }))
    setContentType('text')
  }

  /** 更新单项配置 */
  const updateConfig = useCallback((key: string, value: any) => {
    setConfig({ [key]: value })
  }, [setConfig])

  /** 更新文字样式 */
  const updateTxtStyle = useCallback((key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      txtStyle: { ...prev.txtStyle, [key]: value },
    }))
  }, [])

  useEffect(() => {
    startEffect()
  }, [config, contentType, startEffect])

  useEffect(() => {
    return () => {
      effectRef.current?.stop()
    }
  }, [])

  const presets = getPresets(theme)

  return (
    <DemoPage
      title="图像转字符"
      desc="用字符绘制文本、图片与视频帧，支持动态播放与灰度映射"
      icon={ Type }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full rounded-lg bg-white dark:bg-black"
        />
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="内容类型">
          <div className="flex gap-2">
            { (['text', 'image', 'video'] as ContentType[]).map((type) => (
              <Button
                key={ type }
                size="sm"
                rounded="lg"
                variant={ contentType === type
                  ? 'primary'
                  : 'secondary' }
                onClick={ () => setContentType(type) }
              >
                { { text: '文本', image: '图片', video: '视频' }[type] }
              </Button>
            )) }
          </div>
        </ConfigGroup>

        { contentType === 'text' && (
          <ConfigGroup title="文本内容">
            <Field label="绘制文本">
              <Input
                value={ config.txt }
                onChange={ (v) => updateConfig('txt', v) }
              />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              { quickTexts.map((text) => (
                <Button
                  key={ text }
                  size="sm"
                  rounded="md"
                  variant="secondary"
                  onClick={ () => updateConfig('txt', text) }
                >
                  { text }
                </Button>
              )) }
            </div>
          </ConfigGroup>
        ) }

        { contentType === 'image' && (
          <ConfigGroup title="图片来源">
            <Uploader
              accept="image/*"
              maxCount={ 1 }
              previewImgs={ previewImgs }
              onChange={ onUpload }
            />
          </ConfigGroup>
        ) }

        { contentType === 'video' && (
          <ConfigGroup title="视频来源">
            <Uploader
              accept="video/*"
              maxCount={ 1 }
              previewImgs={ [] }
              onChange={ handleVideoUpload }
            />
          </ConfigGroup>
        ) }

        <ConfigGroup title="字符与间距">
          <Field label="替换字符">
            <Input
              value={ config.replaceText }
              onChange={ (v) => updateConfig('replaceText', v) }
            />
          </Field>

          <Field label="字符间距" value={ config.gap }>
            <Slider
              value={ config.gap }
              onChange={ (v) => updateConfig('gap', v) }
              min={ 1 }
              max={ 30 }
            />
          </Field>
        </ConfigGroup>

        { (contentType === 'image' || contentType === 'video') && (
          <ConfigGroup title="画布">
            <Field label="宽度" value={ config.width }>
              <Slider
                value={ config.width }
                onChange={ (v) => updateConfig('width', v) }
                min={ 400 }
                max={ 1200 }
              />
            </Field>

            <Field label="高度" value={ config.height }>
              <Slider
                value={ config.height }
                onChange={ (v) => updateConfig('height', v) }
                min={ 300 }
                max={ 800 }
              />
            </Field>

            <Field
              label="动态播放"
              value={ config.isDynamic
                ? '开'
                : '关' }
            >
              <Button
                block
                size="sm"
                rounded="lg"
                variant={ config.isDynamic
                  ? 'primary'
                  : 'secondary' }
                onClick={ () => updateConfig('isDynamic', !config.isDynamic) }
              >
                { config.isDynamic
                  ? '动态：开'
                  : '动态：关' }
              </Button>
            </Field>

            <Field
              label="灰度映射"
              value={ config.isGray
                ? '开'
                : '关' }
            >
              <Button
                block
                size="sm"
                rounded="lg"
                variant={ config.isGray
                  ? 'primary'
                  : 'secondary' }
                onClick={ () => updateConfig('isGray', !config.isGray) }
              >
                { config.isGray
                  ? '灰度：开'
                  : '灰度：关' }
              </Button>
            </Field>
          </ConfigGroup>
        ) }

        { contentType === 'text' && (
          <ConfigGroup title="文字样式">
            <Field label="字号" value={ config.txtStyle.size }>
              <Slider
                value={ config.txtStyle.size }
                onChange={ (v) => updateTxtStyle('size', v) }
                min={ 50 }
                max={ 800 }
              />
            </Field>

            <Field label="颜色">
              <input
                type="color"
                value={ config.txtStyle.color }
                onChange={ (e) => updateTxtStyle('color', e.target.value) }
                className="h-8 w-full cursor-pointer rounded-md border border-border bg-background p-0.5"
              />
            </Field>
          </ConfigGroup>
        ) }

        <ConfigGroup title="预设方案（文本模式）">
          <div className="flex flex-wrap gap-2">
            { presets.map((preset) => (
              <Button
                key={ preset.name }
                size="sm"
                rounded="lg"
                variant={ config.name === preset.name
                  ? 'primary'
                  : 'secondary' }
                onClick={ () => applyPreset(preset) }
              >
                { preset.name }
              </Button>
            )) }
          </div>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
