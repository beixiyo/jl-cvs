import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { Uploader } from '@/components/Uploader'
import { useDebounceFn, useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { imgToNoise, waterMark } from '@jl-org/cvs'
import { Wand2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_IMAGE_URL } from '../_shared/releaseAssets'
import { useImageUpload } from '../_shared/useImageUpload'

type ProcessType = 'noise' | 'watermark'

export default function ImgProcessingTest() {
  const [config, setConfig] = useGetState({
    noiseLevel: 150,
    watermarkText: '水印',
    watermarkFontSize: 40,
    watermarkGap: 20,
    watermarkColor: '#ffffff88',
    watermarkRotate: 35,
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentImage, setCurrentImage] = useState<string>(DEMO_IMAGE_URL)
  const [processType, setProcessType] = useState<ProcessType>('noise')
  const [isProcessing, setIsProcessing] = useState(false)
  const [watermarkResult, setWatermarkResult] = useState<{ base64: string; size: number } | null>(null)

  const { imgSrc, onUpload, previewImgs } = useImageUpload()

  useEffect(() => {
    if (imgSrc) setCurrentImage(imgSrc)
  }, [imgSrc])

  const processNoise = useCallback(async () => {
    if (!canvasRef.current || !currentImage) return

    setIsProcessing(true)
    try {
      const img = new Image()
      img.onload = () => {
        const latestConfig = setConfig.getLatest()
        const resultCanvas = imgToNoise(img, latestConfig.noiseLevel)

        if (originalCanvasRef.current) {
          originalCanvasRef.current.width = img.width
          originalCanvasRef.current.height = img.height
          originalCanvasRef.current.getContext('2d')?.drawImage(img, 0, 0)
        }

        if (canvasRef.current) {
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          canvasRef.current.getContext('2d')?.drawImage(resultCanvas, 0, 0)
        }
      }
      img.src = currentImage
    }
    catch (error) {
      console.error('噪点化处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [setConfig, currentImage])

  const processWatermark = useCallback(async () => {
    if (!canvasRef.current || !currentImage) return

    setIsProcessing(true)
    try {
      const latestConfig = setConfig.getLatest()
      const result = waterMark({
        text: latestConfig.watermarkText,
        fontSize: latestConfig.watermarkFontSize,
        gap: latestConfig.watermarkGap,
        color: latestConfig.watermarkColor,
        rotate: latestConfig.watermarkRotate,
      })

      setWatermarkResult(result)

      const img = new Image()
      img.onload = () => {
        if (originalCanvasRef.current) {
          originalCanvasRef.current.width = img.width
          originalCanvasRef.current.height = img.height
          originalCanvasRef.current.getContext('2d')?.drawImage(img, 0, 0)
        }

        if (canvasRef.current) {
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          canvasRef.current.getContext('2d')?.drawImage(img, 0, 0)
        }
      }
      img.src = currentImage
    }
    catch (error) {
      console.error('水印处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [setConfig, currentImage])

  const processImage = useDebounceFn(
    async () => {
      switch (processType) {
        case 'noise':
          await processNoise()
          break
        case 'watermark':
          await processWatermark()
          break
      }
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
      title="图像处理"
      desc="像素级噪点化与平铺水印生成，参数实时生效"
      icon={ Wand2 }
    >
      <Stage>
        <div className="grid size-full grid-cols-1 gap-5 overflow-auto lg:grid-cols-2">
          <div className="flex min-h-72 flex-col items-center justify-center">
            <div className="mb-2 self-start text-xs font-medium tracking-widest text-text3 uppercase">
              { processType === 'watermark'
                ? '底图'
                : '原图' }
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
            <div className="relative">
              <canvas
                ref={ canvasRef }
                className="max-h-[56svh] max-w-full rounded-lg"
              />
              { processType === 'watermark' && watermarkResult && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-lg"
                  style={ {
                    backgroundImage: `url(${watermarkResult.base64})`,
                    backgroundSize: `${watermarkResult.size}px ${watermarkResult.size}px`,
                    backgroundRepeat: 'repeat',
                  } }
                />
              ) }
            </div>
            { watermarkResult && processType === 'watermark' && (
              <p className="mt-3 text-xs text-text3">
                水印尺寸 { watermarkResult.size }px · Base64 可直接用于 CSS background-image
              </p>
            ) }
          </div>
        </div>
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="处理模式">
          <div className="flex gap-2">
            <Button
              size="sm"
              rounded="lg"
              variant={ processType === 'noise'
                ? 'primary'
                : 'secondary' }
              onClick={ () => setProcessType('noise') }
            >
              噪点化
            </Button>
            <Button
              size="sm"
              rounded="lg"
              variant={ processType === 'watermark'
                ? 'primary'
                : 'secondary' }
              onClick={ () => setProcessType('watermark') }
            >
              平铺水印
            </Button>
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

        { processType === 'noise'
          ? (
            <ConfigGroup title="噪点参数">
              <Field label="噪点强度" value={ config.noiseLevel }>
                <Slider
                  value={ config.noiseLevel }
                  onChange={ (v) => updateConfig('noiseLevel', v) }
                  min={ 10 }
                  max={ 500 }
                />
              </Field>
            </ConfigGroup>
          )
          : (
            <ConfigGroup title="水印参数">
              <Field label="水印文字">
                <Input
                  value={ config.watermarkText }
                  onChange={ (v) => updateConfig('watermarkText', v) }
                />
              </Field>

              <Field label="字号 (px)" value={ config.watermarkFontSize }>
                <Slider
                  value={ config.watermarkFontSize }
                  onChange={ (v) => updateConfig('watermarkFontSize', v) }
                  min={ 12 }
                  max={ 120 }
                />
              </Field>

              <Field label="间距 (px)" value={ config.watermarkGap }>
                <Slider
                  value={ config.watermarkGap }
                  onChange={ (v) => updateConfig('watermarkGap', v) }
                  min={ 0 }
                  max={ 100 }
                />
              </Field>

              <Field label="旋转角度 (°)" value={ config.watermarkRotate }>
                <Slider
                  value={ config.watermarkRotate }
                  onChange={ (v) => updateConfig('watermarkRotate', v) }
                  min={ 0 }
                  max={ 90 }
                />
              </Field>

              <Field label="颜色" value={ config.watermarkColor }>
                <Input
                  value={ config.watermarkColor }
                  onChange={ (v) => updateConfig('watermarkColor', v) }
                />
              </Field>
            </ConfigGroup>
          ) }
      </ConfigPanel>
    </DemoPage>
  )
}
