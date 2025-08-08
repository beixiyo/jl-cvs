import { imgToNoise, waterMark } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { type FileItem, Uploader } from '@/components/Uploader'
import { useGetState } from '@/hooks'

type ProcessType = 'noise' | 'watermark'

export default function ImgProcessingTest() {
  const [config, setConfig] = useGetState({
    /** 噪点化配置 */
    noiseLevel: 150,
    /** 水印配置 */
    watermarkText: '水印',
    watermarkFontSize: 40,
    watermarkGap: 20,
    watermarkColor: '#ffffff88',
    watermarkRotate: 35,
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentImage, setCurrentImage] = useState<string>(() => new URL('@/assets/img/umr.webp', import.meta.url).href)
  const [processType, setProcessType] = useState<ProcessType>('noise')
  const [isProcessing, setIsProcessing] = useState(false)
  const [watermarkResult, setWatermarkResult] = useState<{ base64: string, size: number } | null>(null)

  /** 处理图像噪点化 */
  const processNoise = useCallback(async () => {
    if (!canvasRef.current || !currentImage)
      return

    setIsProcessing(true)
    try {
      const img = new Image()
      img.onload = () => {
        const latestConfig = setConfig.getLatest()
        const resultCanvas = imgToNoise(img, latestConfig.noiseLevel)

        /** 显示原图 */
        if (originalCanvasRef.current) {
          originalCanvasRef.current.width = img.width
          originalCanvasRef.current.height = img.height
          const originalCtx = originalCanvasRef.current.getContext('2d')
          if (originalCtx) {
            originalCtx.drawImage(img, 0, 0)
          }
        }

        /** 设置画布尺寸并显示结果 */
        if (canvasRef.current) {
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            ctx.drawImage(resultCanvas, 0, 0)
          }
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

  /** 处理水印生成 */
  const processWatermark = useCallback(async () => {
    if (!canvasRef.current || !currentImage)
      return

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

      /** 加载原图并显示在两个画布上 */
      const img = new Image()
      img.onload = () => {
        /** 显示原图（左侧） */
        if (originalCanvasRef.current) {
          originalCanvasRef.current.width = img.width
          originalCanvasRef.current.height = img.height
          const originalCtx = originalCanvasRef.current.getContext('2d')
          if (originalCtx) {
            originalCtx.drawImage(img, 0, 0)
          }
        }

        /** 显示带水印的图片（右侧） */
        if (canvasRef.current) {
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            /** 先绘制原图 */
            ctx.drawImage(img, 0, 0)
          }
        }
      }
      img.src = currentImage
    }
    catch (error) {
      console.error('水印生成失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [setConfig, currentImage])

  /** 根据处理类型执行相应处理 */
  const processImage = useCallback(debounce(async () => {
    switch (processType) {
      case 'noise':
        await processNoise()
        break
      case 'watermark':
        await processWatermark()
        break
    }
  }, 40), [processType, processNoise, processWatermark])

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
    processImage()
  }, [config, currentImage, processType, processImage])

  return (
    <div className="min-h-screen from-green-50 to-teal-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 */ }
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          🎨 图像处理工具
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          图像噪点化、水印生成、图像合成等多种图像处理功能
        </p>
      </div>

      {/* 响应式布局容器 */ }
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */ }
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 原图/输入显示 */ }
            <Card>
              <h3 className="mb-4 text-center text-lg text-gray-800 font-semibold dark:text-white">
                { processType === 'watermark'
                  ? '水印参数'
                  : '原图' }
              </h3>
              <div className="min-h-[300px] flex items-center justify-center">
                <canvas
                  ref={ originalCanvasRef }
                  className="border border-gray-300 rounded-lg bg-white shadow-md dark:border-gray-600 dark:bg-gray-800"
                  style={ { maxWidth: '100%', height: 'auto' } }
                />
              </div>
            </Card>

            {/* 处理结果显示 */ }
            <Card>
              <h3 className="mb-4 text-center text-lg text-gray-800 font-semibold dark:text-white">
                处理结果
                { isProcessing && <span className="ml-2 text-sm text-blue-500">处理中...</span> }
              </h3>
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="relative">
                  <canvas
                    ref={ canvasRef }
                    className="border border-gray-300 rounded-lg bg-white shadow-md dark:border-gray-600 dark:bg-gray-800"
                    style={ { maxWidth: '100%', height: 'auto' } }
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
              </div>
              { watermarkResult && processType === 'watermark' && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    水印尺寸:
                    { watermarkResult.size }
                    px
                  </p>
                  <p>Base64 已生成，可用于 CSS background-image</p>
                </div>
              ) }
            </Card>
          </div>
        </div>

        {/* 右侧：控制面板 */ }
        <div className="w-full lg:w-96">
          <Card>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
                控制面板
              </h2>

              {/* 处理类型选择 */ }
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  处理类型
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={ () => setProcessType('noise') }
                    variant={ processType === 'noise'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    🔊 噪点化
                  </Button>
                  <Button
                    onClick={ () => setProcessType('watermark') }
                    variant={ processType === 'watermark'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    💧 水印
                  </Button>
                </div>
              </div>

              {/* 图片上传 */ }
              { processType === 'noise' && (
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
              ) }

              {/* 噪点化参数 */ }
              { processType === 'noise' && (
                <div className="mb-6">
                  <h3 className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-200">
                    噪点参数
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        噪点等级 (
                        { config.noiseLevel }
                        )
                      </label>
                      <div className="px-2">
                        <Slider
                          min={ 0 }
                          max={ 255 }
                          value={ config.noiseLevel }
                          onChange={ (value) => {
                            if (typeof value === 'number') {
                              updateConfig('noiseLevel', value)
                            }
                            else if (Array.isArray(value)) {
                              updateConfig('noiseLevel', value[0])
                            }
                          } }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) }

              {/* 水印参数 */ }
              { processType === 'watermark' && (
                <div className="mb-6">
                  <h3 className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-200">
                    水印参数
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        水印文字
                      </label>
                      <Input
                        type="text"
                        value={ config.watermarkText }
                        onChange={ v => updateConfig('watermarkText', v) }
                        placeholder="输入水印文字"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        字体大小 (
                        { config.watermarkFontSize }
                        px)
                      </label>
                      <div className="px-2">
                        <Slider
                          min={ 20 }
                          max={ 100 }
                          value={ config.watermarkFontSize }
                          onChange={ (value) => {
                            if (typeof value === 'number') {
                              updateConfig('watermarkFontSize', value)
                            }
                            else if (Array.isArray(value)) {
                              updateConfig('watermarkFontSize', value[0])
                            }
                          } }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        间隙 (
                        { config.watermarkGap }
                        px)
                      </label>
                      <div className="px-2">
                        <Slider
                          min={ 10 }
                          max={ 50 }
                          value={ config.watermarkGap }
                          onChange={ (value) => {
                            if (typeof value === 'number') {
                              updateConfig('watermarkGap', value)
                            }
                            else if (Array.isArray(value)) {
                              updateConfig('watermarkGap', value[0])
                            }
                          } }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        旋转角度 (
                        { config.watermarkRotate }
                        °)
                      </label>
                      <div className="px-2">
                        <Slider
                          min={ 0 }
                          max={ 90 }
                          value={ config.watermarkRotate }
                          onChange={ (value) => {
                            if (typeof value === 'number') {
                              updateConfig('watermarkRotate', value)
                            }
                            else if (Array.isArray(value)) {
                              updateConfig('watermarkRotate', value[0])
                            }
                          } }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        颜色
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={ config.watermarkColor.slice(0, 7) }
                          onChange={ v => updateConfig('watermarkColor', v + config.watermarkColor.slice(7)) }
                          className="h-10 w-16 border-0 rounded p-1"
                        />
                        <Input
                          type="text"
                          value={ config.watermarkColor }
                          onChange={ v => updateConfig('watermarkColor', v) }
                          className="flex-1"
                          placeholder="#ffffff88"
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
                  { processType === 'noise' && (
                    <>
                      <div>
                        <strong>噪点化：</strong>
                        为图像添加随机噪点效果
                      </div>
                      <div>
                        <strong>噪点等级：</strong>
                        控制噪点的强度，数值越大噪点越明显
                      </div>
                    </>
                  ) }
                  { processType === 'watermark' && (
                    <>
                      <div>
                        <strong>水印生成：</strong>
                        生成可重复的水印图案
                      </div>
                      <div>
                        <strong>CSS 使用：</strong>
                        可将生成的 base64 用于 background-image
                      </div>
                      <div>
                        <strong>颜色格式：</strong>
                        支持 #rrggbbaa 格式（含透明度）
                      </div>
                    </>
                  ) }
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
