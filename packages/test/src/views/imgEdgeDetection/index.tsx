import { getImgEdge } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Slider } from '@/components/Slider'
import { type FileItem, Uploader } from '@/components/Uploader'
import { useGetState, useTheme } from '@/hooks'

export default function ImgEdgeDetectionTest() {
  const [theme] = useTheme()

  const [config, setConfig] = useGetState({
    threshold: 128,
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentImage, setCurrentImage] = useState<string>(() => new URL('@/assets/img/umr.webp', import.meta.url).href)
  const [isProcessing, setIsProcessing] = useState(false)

  /** 处理边缘检测 */
  const processEdgeDetection = useCallback(debounce(async () => {
    if (!canvasRef.current || !originalCanvasRef.current || !currentImage) {
      return
    }

    setIsProcessing(true)
    try {
      const latestConfig = setConfig.getLatest()

      /** 获取边缘检测结果 */
      const edgeData = await getImgEdge(currentImage, {
        threshold: latestConfig.threshold,
      })

      /** 设置画布尺寸 */
      canvasRef.current.width = edgeData.width
      canvasRef.current.height = edgeData.height
      originalCanvasRef.current.width = edgeData.width
      originalCanvasRef.current.height = edgeData.height

      /** 显示边缘检测结果 */
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.putImageData(edgeData, 0, 0)
      }

      /** 显示原图 */
      const img = new Image()
      img.onload = () => {
        const originalCtx = originalCanvasRef.current?.getContext('2d')
        if (originalCtx) {
          originalCtx.drawImage(img, 0, 0, edgeData.width, edgeData.height)
        }
      }
      img.src = currentImage
    }
    catch (error) {
      console.error('边缘检测处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, 40), [setConfig, currentImage])

  /** 上传图片 */
  const handleImageUpload = (files: FileItem[]) => {
    if (files.length > 0) {
      setCurrentImage(files[0].base64)
    }
  }

  /** 更新配置 */
  const updateConfig = useCallback((key: string, value: any) => {
    setConfig({ [key]: value })
  }, [setConfig])

  /** 监听配置变化，自动重新处理 */
  useEffect(() => {
    processEdgeDetection()
  }, [config, currentImage, processEdgeDetection])

  return (
    <div className="min-h-screen from-purple-50 to-blue-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 */}
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          🔍 图像边缘检测
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          使用 Sobel 算子进行图像边缘检测，支持阈值调节
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 原图显示 */}
            <Card className="">
              <h3 className="mb-4 text-center text-lg text-gray-800 font-semibold dark:text-white">
                原图
              </h3>
              <div className="min-h-[300px] flex items-center justify-center">
                <canvas
                  ref={ originalCanvasRef }
                  className="border border-gray-300 rounded-lg bg-white shadow-md dark:border-gray-600 dark:bg-gray-800"
                  style={ { maxWidth: '100%', height: 'auto' } }
                />
              </div>
            </Card>

            {/* 边缘检测结果显示 */}
            <Card className="">
              <h3 className="mb-4 text-center text-lg text-gray-800 font-semibold dark:text-white">
                边缘检测结果
                {isProcessing && <span className="ml-2 text-sm text-blue-500">处理中...</span>}
              </h3>
              <div className="min-h-[300px] flex items-center justify-center">
                <canvas
                  ref={ canvasRef }
                  className="border border-gray-300 rounded-lg bg-white shadow-md dark:border-gray-600 dark:bg-gray-800"
                  style={ { maxWidth: '100%', height: 'auto' } }
                />
              </div>
            </Card>
          </div>
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-full lg:w-96">
          <Card>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
                控制面板
              </h2>

              {/* 图片上传 */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  图片上传
                </h3>
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

              {/* 参数调节 */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-200">
                  检测参数
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      边缘检测阈值 (
                      {config.threshold}
                      )
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 0 }
                        max={ 255 }
                        value={ config.threshold }
                        onChange={ (value) => {
                          if (typeof value === 'number') {
                            updateConfig('threshold', value)
                          }
                          else if (Array.isArray(value)) {
                            updateConfig('threshold', value[0])
                          }
                        } }
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      阈值越高，检测到的边缘越少；阈值越低，检测到的边缘越多
                    </p>
                  </div>
                </div>
              </div>

              {/* 预设配置 */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  快速设置
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={ () => updateConfig('threshold', 50) }
                    variant="default"
                    size="sm"
                  >
                    低阈值
                  </Button>
                  <Button
                    onClick={ () => updateConfig('threshold', 128) }
                    variant="default"
                    size="sm"
                  >
                    中阈值
                  </Button>
                  <Button
                    onClick={ () => updateConfig('threshold', 200) }
                    variant="default"
                    size="sm"
                  >
                    高阈值
                  </Button>
                  <Button
                    onClick={ () => updateConfig('threshold', 255) }
                    variant="default"
                    size="sm"
                  >
                    最高阈值
                  </Button>
                </div>
              </div>

              {/* 使用说明 */}
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  使用说明
                </h3>
                <div className="text-sm text-gray-600 space-y-3 dark:text-gray-300">
                  <div>
                    <strong>边缘检测：</strong>
                    使用 Sobel 算子检测图像中的边缘
                  </div>
                  <div>
                    <strong>阈值参数：</strong>
                    控制边缘检测的敏感度，范围 0-255
                  </div>
                  <div>
                    <strong>处理过程：</strong>
                    先转换为灰度图，再应用 Sobel 卷积核
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
