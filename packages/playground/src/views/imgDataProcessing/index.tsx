import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Message } from '@/components/Message'
import { Slider } from '@/components/Slider'
import { Uploader } from '@/components/Uploader'
import { useDebounceFn, useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { adaptiveBinarize, adaptiveGrayscale, changeImgColor, enhanceContrast } from '@jl-org/cvs'
import { getColorInfo, getImgData, type Pixel } from '@jl-org/tool'
import { Layers } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useImageUpload } from '../_shared/useImageUpload'
import { DEMO_IMAGE_URL } from '../_shared/releaseAssets';

type ProcessType = 'grayscale' | 'contrast' | 'binarize' | 'colorReplace'

const PROCESS_MODES: { value: ProcessType; label: string }[] = [
  { value: 'grayscale', label: '自适应灰度' },
  { value: 'contrast', label: '对比度增强' },
  { value: 'binarize', label: '自适应二值化' },
  { value: 'colorReplace', label: '颜色替换' },
]

export default function ImgDataProcessingTest() {
  const [config, setConfig] = useGetState({
    contrastFactor: 1.2,
    binarizeThreshold: 128,
    fromColor: '#7E696E',
    toColor: '#5f8',
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentImage, setCurrentImage] = useState<string>(DEMO_IMAGE_URL)
  const [processType, setProcessType] = useState<ProcessType>('grayscale')
  const [isProcessing, setIsProcessing] = useState(false)

  const { imgSrc, onUpload, previewImgs } = useImageUpload()

  useEffect(() => {
    if (imgSrc) setCurrentImage(imgSrc)
  }, [imgSrc])

  /** 把处理结果与原图绘制到双画布 */
  const drawResult = useCallback((processed: ImageData, original: ImageData, width: number, height: number) => {
    if (canvasRef.current) {
      canvasRef.current.width = width
      canvasRef.current.height = height
      canvasRef.current.getContext('2d')?.putImageData(processed, 0, 0)
    }

    if (originalCanvasRef.current) {
      originalCanvasRef.current.width = width
      originalCanvasRef.current.height = height
      originalCanvasRef.current.getContext('2d')?.putImageData(original, 0, 0)
    }
  }, [])

  /** 单入单出型像素处理：灰度 / 对比度 / 二值化 */
  const processPixelOp = useCallback(async () => {
    if (!canvasRef.current || !currentImage) return

    setIsProcessing(true)
    try {
      const { imgData, width, height } = await getImgData(currentImage)
      const source = new ImageData(new Uint8ClampedArray(imgData.data), width, height)
      const latestConfig = setConfig.getLatest()

      let processed = adaptiveGrayscale(source)
      if (processType === 'contrast') {
        processed = enhanceContrast(source, latestConfig.contrastFactor)
      }
      else if (processType === 'binarize') {
        processed = enhanceContrast(processed, 1.2)
        processed = adaptiveBinarize(processed, latestConfig.binarizeThreshold)
      }

      drawResult(processed, imgData, width, height)
    }
    catch (error) {
      console.error('像素处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [currentImage, drawResult, processType, setConfig])

  /** 颜色替换 */
  const processColorReplace = useCallback(async () => {
    if (!canvasRef.current || !currentImage) return

    setIsProcessing(true)
    try {
      const { imgData, width, height } = await getImgData(currentImage)
      const latestConfig = setConfig.getLatest()

      const fromColor = getColorInfo(latestConfig.fromColor)
      let replacedCount = 0
      const normalizedFromAlpha = Math.round(fromColor.a * 255)

      const result = await changeImgColor(
        currentImage,
        latestConfig.fromColor,
        latestConfig.toColor,
        {
          isSameColor(pixel: Pixel) {
            const isMatch = Math.abs(pixel[0] - fromColor.r) < 10
              && Math.abs(pixel[1] - fromColor.g) < 10
              && Math.abs(pixel[2] - fromColor.b) < 10
              && Math.abs(pixel[3] - normalizedFromAlpha) < 10

            if (isMatch) {
              replacedCount++
            }
            return isMatch
          },
        },
      )

      Message.success(`颜色替换完成，共替换了 ${replacedCount} 个像素`)
      drawResult(result.imgData, imgData, width, height)
    }
    catch (error) {
      console.error('颜色替换处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [currentImage, drawResult, setConfig])

  const processImage = useDebounceFn(
    async () => {
      processType === 'colorReplace'
        ? await processColorReplace()
        : await processPixelOp()
    },
    { delay: 40 },
  )

  const updateConfig = useCallback((key: string, value: any) => {
    setConfig({ [key]: value })
  }, [setConfig])

  useEffect(() => {
    processImage()
  }, [config, currentImage, processType, processImage])

  return (
    <DemoPage
      title="像素数据操作"
      desc="直接读写 ImageData：灰度、对比度、二值化与指定色替换"
      icon={ Layers }
    >
      <Stage>
        <div className="grid size-full grid-cols-1 gap-5 overflow-auto lg:grid-cols-2">
          <div className="flex min-h-72 flex-col items-center justify-center">
            <div className="mb-2 self-start text-xs font-medium tracking-widest text-text3 uppercase">
              原图
            </div>
            <canvas
              ref={ originalCanvasRef }
              className="max-h-[56svh] max-w-full rounded-lg"
            />
          </div>

          <div className="flex min-h-72 flex-col items-center justify-center">
            <div className="mb-2 self-start text-xs font-medium tracking-widest text-text3 uppercase">
              处理结果
              { isProcessing && <span className="ml-2 text-brand">处理中…</span> }
            </div>
            <canvas
              ref={ canvasRef }
              className="max-h-[56svh] max-w-full rounded-lg"
            />
          </div>
        </div>
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="处理模式">
          <div className="flex flex-wrap gap-2">
            { PROCESS_MODES.map((mode) => (
              <Button
                key={ mode.value }
                size="sm"
                rounded="lg"
                variant={ processType === mode.value
                  ? 'primary'
                  : 'secondary' }
                onClick={ () => setProcessType(mode.value) }
              >
                { mode.label }
              </Button>
            )) }
          </div>
        </ConfigGroup>

        <ConfigGroup title="图片来源">
          <Uploader
            accept="image/*"
            maxCount={ 1 }
            previewImgs={ previewImgs }
            onChange={ onUpload }
          />
        </ConfigGroup>

        { processType === 'contrast' && (
          <ConfigGroup title="对比度参数">
            <Field label="增强系数" value={ config.contrastFactor }>
              <Slider
                value={ config.contrastFactor }
                onChange={ (v) => updateConfig('contrastFactor', v) }
                min={ 0.5 }
                max={ 3 }
                step={ 0.05 }
              />
            </Field>
          </ConfigGroup>
        ) }

        { processType === 'binarize' && (
          <ConfigGroup title="二值化参数">
            <Field label="阈值" value={ config.binarizeThreshold } hint="先自适应灰度并增强对比，再按阈值切分黑白">
              <Slider
                value={ config.binarizeThreshold }
                onChange={ (v) => updateConfig('binarizeThreshold', v) }
                min={ 0 }
                max={ 255 }
              />
            </Field>
          </ConfigGroup>
        ) }

        { processType === 'colorReplace' && (
          <ConfigGroup title="颜色替换">
            <Field label="源颜色" hint="使用取色器从原图中选取要替换的颜色">
              <input
                type="color"
                value={ config.fromColor }
                onChange={ (e) => updateConfig('fromColor', e.target.value) }
                className="h-8 w-full cursor-pointer rounded-md border border-border bg-background p-0.5"
              />
            </Field>

            <Field label="目标颜色">
              <input
                type="color"
                value={ config.toColor }
                onChange={ (e) => updateConfig('toColor', e.target.value) }
                className="h-8 w-full cursor-pointer rounded-md border border-border bg-background p-0.5"
              />
            </Field>

            <Field label="源颜色值 (hex)">
              <Input
                value={ config.fromColor }
                onChange={ (v) => updateConfig('fromColor', v) }
              />
            </Field>
          </ConfigGroup>
        ) }
      </ConfigPanel>
    </DemoPage>
  )
}
