import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { Uploader } from '@/components/Uploader'
import { useDebounceFn, useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { imgToFade } from '@jl-org/cvs'
import { Eraser } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DEMO_IMAGE_URL } from '../_shared/releaseAssets'
import { useImageUpload } from '../_shared/useImageUpload'

/** 预设配置 */
const presets = [
  {
    name: '默认消散',
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

  const [currentImage, setCurrentImage] = useState<string>(DEMO_IMAGE_URL)
  const { imgSrc, onUpload, previewImgs } = useImageUpload()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  /** 上传后替换当前图片 */
  useEffect(() => {
    if (imgSrc) setCurrentImage(imgSrc)
  }, [imgSrc])

  /** 开始淡化效果；useDebounceFn 实例稳定且闭包始终最新 */
  const startFadeEffect = useDebounceFn(
    async () => {
      if (!canvasRef.current || !currentImage) {
        console.warn('画布或图片未准备好')
        return
      }

      try {
        const latestConfig = setConfig.getLatest()

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
    },
    { delay: 80 },
  )

  /** 应用预设 */
  const applyPreset = (preset: Record<string, any>) => {
    setConfig((prev) => ({ ...prev, ...preset }))
  }

  /** 更新单项配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig({ [key]: value })
  }

  /** 配置或图片变化时自动重启 */
  useEffect(() => {
    startFadeEffect()
  }, [config, currentImage, startFadeEffect])

  return (
    <DemoPage
      title="灰飞烟灭"
      desc="图像粒子化后随风飘散的退场动画，上传任意图片即刻体验"
      icon={ Eraser }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full rounded-lg"
        />
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="图片来源">
          <Uploader
            accept="image/*"
            maxCount={ 1 }
            previewImgs={ previewImgs }
            onChange={ onUpload }
            onRemove={ () => setCurrentImage(DEMO_IMAGE_URL) }
          />
        </ConfigGroup>

        <ConfigGroup title="预设方案">
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

        <ConfigGroup title="粒子参数">
          <Field label="移动速度" value={ config.speed }>
            <Slider
              value={ config.speed }
              onChange={ (v) => updateConfig('speed', v) }
              min={ 0.5 }
              max={ 5 }
              step={ 0.1 }
            />
          </Field>

          <Field label="额外删除像素" value={ config.extraDelCount } hint="每帧额外清除的像素点数量">
            <Slider
              value={ config.extraDelCount }
              onChange={ (v) => updateConfig('extraDelCount', v) }
              min={ 5 }
              max={ 50 }
            />
          </Field>

          <Field label="每帧粒子数" value={ config.ballCount }>
            <Slider
              value={ config.ballCount }
              onChange={ (v) => updateConfig('ballCount', v) }
              min={ 5 }
              max={ 30 }
            />
          </Field>
        </ConfigGroup>

        <ConfigGroup title="画布与图片">
          <Field label="画布宽度" value={ config.width }>
            <NumberInput
              value={ config.width }
              onChange={ (v) => updateConfig('width', v) }
              min={ 400 }
              max={ 1200 }
            />
          </Field>

          <Field label="画布高度" value={ config.height }>
            <NumberInput
              value={ config.height }
              onChange={ (v) => updateConfig('height', v) }
              min={ 300 }
              max={ 800 }
            />
          </Field>

          <Field label="图片宽度" value={ config.imgWidth }>
            <NumberInput
              value={ config.imgWidth }
              onChange={ (v) => updateConfig('imgWidth', v) }
              min={ 200 }
              max={ 600 }
            />
          </Field>

          <Field label="图片高度" value={ config.imgHeight }>
            <NumberInput
              value={ config.imgHeight }
              onChange={ (v) => updateConfig('imgHeight', v) }
              min={ 150 }
              max={ 400 }
            />
          </Field>

          <Field label="背景颜色">
            <input
              type="color"
              value={ config.bgc }
              onChange={ (e) => updateConfig('bgc', e.target.value) }
              className="h-8 w-full cursor-pointer rounded-md border border-border bg-background p-0.5"
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
