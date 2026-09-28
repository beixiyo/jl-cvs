import { Slider } from '@/components/Slider'
import { Uploader } from '@/components/Uploader'
import { useDebounceFn, useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { getImgEdge } from '@jl-org/cvs'
import { ScanSearch } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_IMAGE_URL } from '../_shared/releaseAssets'
import { useImageUpload } from '../_shared/useImageUpload'

export default function ImgEdgeDetectionTest() {
  const [config, setConfig] = useGetState({
    threshold: 128,
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentImage, setCurrentImage] = useState<string>(DEMO_IMAGE_URL)
  const [isProcessing, setIsProcessing] = useState(false)

  const { imgSrc, onUpload, previewImgs } = useImageUpload()

  useEffect(() => {
    if (imgSrc) setCurrentImage(imgSrc)
  }, [imgSrc])

  /** 边缘检测（防抖）；useDebounceFn 实例稳定且闭包始终最新，避免旧定时器在 deps 变化后用旧图覆盖结果 */
  const processEdgeDetection = useDebounceFn(
    async () => {
      if (!canvasRef.current || !originalCanvasRef.current || !currentImage) {
        return
      }

      setIsProcessing(true)
      try {
        const latestConfig = setConfig.getLatest()

        const edgeData = await getImgEdge(currentImage, {
          threshold: latestConfig.threshold,
        })

        canvasRef.current.width = edgeData.width
        canvasRef.current.height = edgeData.height
        originalCanvasRef.current.width = edgeData.width
        originalCanvasRef.current.height = edgeData.height

        canvasRef.current.getContext('2d')?.putImageData(edgeData, 0, 0)

        const img = new Image()
        img.onload = () => {
          originalCanvasRef.current?.getContext('2d')?.drawImage(img, 0, 0, edgeData.width, edgeData.height)
        }
        img.src = currentImage
      }
      catch (error) {
        console.error('边缘检测处理失败:', error)
      }
      finally {
        setIsProcessing(false)
      }
    },
    { delay: 40 },
  )

  const updateConfig = useCallback((key: string, value: any) => {
    setConfig({ [key]: value })
  }, [setConfig])

  useEffect(() => {
    processEdgeDetection()
  }, [config, currentImage, processEdgeDetection])

  return (
    <DemoPage
      title="边缘检测"
      desc="Sobel 卷积算子提取图像边缘，拖动阈值实时观察轮廓变化"
      icon={ ScanSearch }
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
              边缘结果
              { isProcessing && <span className="ml-2 text-brand">处理中…</span> }
            </div>
            <canvas
              ref={ canvasRef }
              className="max-h-[56svh] max-w-full rounded-lg bg-black"
            />
          </div>
        </div>
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="图片来源">
          <Uploader
            accept="image/*"
            maxCount={ 1 }
            previewImgs={ previewImgs }
            onChange={ onUpload }
          />
        </ConfigGroup>

        <ConfigGroup title="检测参数">
          <Field
            label="阈值"
            value={ config.threshold }
            hint="低于该梯度的像素被视作背景，越高轮廓越精简"
          >
            <Slider
              value={ config.threshold }
              onChange={ (v) => updateConfig('threshold', v) }
              min={ 0 }
              max={ 255 }
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
