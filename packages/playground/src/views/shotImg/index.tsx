import { Button } from '@/components/Button'
import { Uploader } from '@/components/Uploader'
import { useCustomEffect } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { ShotImg } from '@jl-org/cvs'
import { Camera, Download } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { DEMO_IMAGE_URL } from '../_shared/releaseAssets'
import { useImageUpload } from '../_shared/useImageUpload'

export default function ShotImgTest() {
  return (
    <DemoPage
      title="截图取帧"
      desc="在图片上拖拽框选区域，精确截取并导出，大图坐标同样准确"
      icon={ Camera }
    >
      <ShotImgDemo />
    </DemoPage>
  )
}

const ShotImgDemo = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shotInstance, setShotInstance] = useState<ShotImg | null>(null)
  const [resultImage, setResultImage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const { imgSrc, onUpload, previewImgs } = useImageUpload()

  /** 初始化 ShotImg 实例 */
  useCustomEffect(async () => {
    if (!canvasRef.current) {
      return
    }

    const shotImg = new ShotImg(canvasRef.current)
    setShotInstance(shotImg)
    shotImg.setImg(DEMO_IMAGE_URL)
  }, [canvasRef])

  /** 上传图片后替换画布内容 */
  useEffect(() => {
    if (imgSrc && shotInstance) {
      shotInstance.setImg(imgSrc)
      setResultImage(undefined)
    }
  }, [imgSrc, shotInstance])

  /** 获取截图 */
  const handleGetScreenshot = async () => {
    if (!shotInstance) return

    try {
      setIsLoading(true)
      const base64 = await shotInstance.getShotImg('base64')
      setResultImage(base64 as string)
    }
    catch (error) {
      console.error('获取截图失败', error)
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Stage>
        <div className="flex size-full flex-col gap-4">
          <div className="relative min-h-0 flex-1 overflow-auto">
            <canvas
              ref={ canvasRef }
              className="cursor-crosshair"
            />
            { isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                <div className="size-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
              </div>
            ) }
          </div>

          <Button
            rounded="lg"
            disabled={ !shotInstance || isLoading }
            onClick={ handleGetScreenshot }
          >
            获取截图
          </Button>
        </div>
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="图片来源">
          <Field label="上传图片" hint="或直接使用默认示例图">
            <Uploader
              accept="image/*"
              maxCount={ 1 }
              previewImgs={ previewImgs }
              onChange={ onUpload }
            />
          </Field>
        </ConfigGroup>

        <ConfigGroup title="操作步骤">
          <ol className="list-decimal space-y-1.5 pl-4.5 text-xs leading-relaxed text-text2">
            <li>上传图片（可选）</li>
            <li>按住鼠标左键拖动，框选要截取的区域</li>
            <li>点击「获取截图」查看结果</li>
            <li>满意后下载保存</li>
          </ol>
        </ConfigGroup>

        { resultImage && (
          <ConfigGroup title="截图结果">
            <div className="overflow-hidden rounded-lg border border-border">
              <img
                src={ resultImage }
                alt="截图结果"
                className="max-h-48 w-full object-contain"
              />
            </div>
            <Button
              block
              size="sm"
              rounded="lg"
              leftIcon={ <Download size={ 14 } /> }
              onClick={ () => {
                const link = document.createElement('a')
                link.href = resultImage
                link.download = `screenshot-${Date.now()}.png`
                link.click()
              } }
            >
              下载截图
            </Button>
          </ConfigGroup>
        ) }
      </ConfigPanel>
    </>
  )
})

ShotImgDemo.displayName = 'ShotImgDemo'
