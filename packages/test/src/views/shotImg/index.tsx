import { ShotImg } from '@jl-org/cvs'
import { memo, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { type FileItem, Uploader } from '@/components/Uploader'
import { useAsyncEffect } from '@/hooks'
import { cn } from '@/utils'

export default function ShotImgTest() {
  return (
    <div className="min-h-screen flex flex-col gap-6 bg-gray-100 p-6 dark:bg-gray-900">
      <h1 className="text-3xl text-gray-800 font-bold dark:text-gray-100">截图工具测试</h1>
      <div className="flex flex-col gap-4">
        <ShotImgDemo />
      </div>
    </div>
  )
}

const ShotImgDemo = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shotInstance, setShotInstance] = useState<ShotImg | null>(null)
  const [imageUrl, setImageUrl] = useState<string>(() => new URL('@/assets/img/umr.webp', import.meta.url).href)
  const [resultImage, setResultImage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  /** 初始化ShotImg实例 */
  useAsyncEffect(async () => {
    if (!canvasRef.current) {
      return
    }

    const shotImg = new ShotImg(canvasRef.current)
    setShotInstance(shotImg)
    shotImg.setImg(new URL('@/assets/img/umr.webp', import.meta.url).href)
  }, [canvasRef])

  /** 处理文件选择 */
  const handleFileChange = (files: FileItem[]) => {
    if (!shotInstance) {
      return
    }

    const imageUrl = files[0].base64
    setImageUrl(imageUrl)
    shotInstance.setImg(imageUrl)
    setResultImage('')
  }

  /** 获取截图 */
  const handleGetScreenshot = async () => {
    if (!shotInstance)
      return

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

  /** 重置 */
  const handleReset = () => {
    setImageUrl('')
    setResultImage('')
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">上传图片</h2>
        <div className="flex items-center gap-4">

          <Uploader
            onChange={ handleFileChange }
            accept="image/*"
            className="w-72"
          />

          { imageUrl && (
            <Button onClick={ handleReset } className="shrink-0">
              重置
            </Button>
          ) }
        </div>
      </div>

      <div className={ cn('flex flex-col md:flex-row gap-6', !imageUrl && 'opacity-50 pointer-events-none') }>
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">原图 (拖动选择区域)</h2>
          <div className="relative overflow-hidden border border-gray-300 rounded dark:border-gray-600">
            <canvas
              ref={ canvasRef }
              className="h-auto max-w-full cursor-crosshair"
            />
            { isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="h-8 w-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) }
          </div>
          <Button
            onClick={ handleGetScreenshot }
            disabled={ !shotInstance || isLoading }
            className="mt-2"
          >
            获取截图
          </Button>
        </div>

        { resultImage && (
          <div className="flex flex-1 flex-col gap-4">
            <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">截图结果</h2>
            <div className="overflow-hidden border border-gray-300 rounded dark:border-gray-600">
              <img
                src={ resultImage }
                alt="截图结果"
                className="h-auto max-w-full"
              />
            </div>
            <Button
              onClick={ () => {
                const link = document.createElement('a')
                link.href = resultImage
                link.download = `screenshot-${Date.now()}.png`
                link.click()
              } }
            >
              下载截图
            </Button>
          </div>
        ) }
      </div>

      <div className="mt-4 rounded bg-gray-100 p-4 dark:bg-gray-700">
        <h3 className="mb-2 text-lg text-gray-800 font-semibold dark:text-gray-200">使用说明</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-1 dark:text-gray-300">
          <li>选择一张图片上传</li>
          <li>在图片上按住鼠标左键并拖动，选择要截取的区域</li>
          <li>点击"获取截图"按钮查看结果</li>
          <li>可以点击"下载截图"保存结果</li>
        </ol>
      </div>

      <div className="mt-4 border border-blue-200 rounded bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
        <h3 className="mb-2 text-lg text-blue-800 font-semibold dark:text-blue-200">更新说明</h3>
        <p className="text-blue-700 dark:text-blue-300">
          ShotImg类已更新，增加了坐标转换逻辑，解决了大图片截图时坐标不准确的问题。现在无论图片尺寸大小，截图区域都能准确对应。
        </p>
      </div>
    </div>
  )
})

ShotImgDemo.displayName = 'ShotImgDemo'
