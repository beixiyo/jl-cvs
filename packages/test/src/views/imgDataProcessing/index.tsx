import { adaptiveBinarize, adaptiveGrayscale, changeImgColor, enhanceContrast } from '@jl-org/cvs'
import { debounce, getImgData } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { type FileItem, Uploader } from '@/components/Uploader'
import { useGetState } from '@/hooks'

type ProcessType = 'grayscale' | 'contrast' | 'binarize' | 'colorReplace'

export default function ImgDataProcessingTest() {
  const [config, setConfig] = useGetState({
    /** 对比度增强参数 */
    contrastFactor: 1.2,
    /** 二值化参数 */
    binarizeThreshold: 128,
    /** 颜色替换参数 */
    fromColor: '#ffffff',
    toColor: '#ff0000',
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentImage, setCurrentImage] = useState<string>(() => new URL('@/assets/img/umr.webp', import.meta.url).href)
  const [processType, setProcessType] = useState<ProcessType>('grayscale')
  const [isProcessing, setIsProcessing] = useState(false)

  /** 处理灰度化 */
  const processGrayscale = useCallback(async () => {
    if (!canvasRef.current || !currentImage)
      return

    setIsProcessing(true)
    try {
      const { imgData, width, height } = await getImgData(currentImage)
      const processedData = adaptiveGrayscale(new ImageData(new Uint8ClampedArray(imgData.data), width, height))

      /** 显示处理结果 */
      if (canvasRef.current) {
        canvasRef.current.width = width
        canvasRef.current.height = height
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.putImageData(processedData, 0, 0)
        }
      }

      /** 显示原图 */
      if (originalCanvasRef.current) {
        originalCanvasRef.current.width = width
        originalCanvasRef.current.height = height
        const originalCtx = originalCanvasRef.current.getContext('2d')
        if (originalCtx) {
          originalCtx.putImageData(imgData, 0, 0)
        }
      }
    }
    catch (error) {
      console.error('灰度化处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [currentImage])

  /** 处理对比度增强 */
  const processContrast = useCallback(async () => {
    if (!canvasRef.current || !currentImage)
      return

    setIsProcessing(true)
    try {
      const { imgData, width, height } = await getImgData(currentImage)
      const latestConfig = setConfig.getLatest()
      const processedData = enhanceContrast(new ImageData(new Uint8ClampedArray(imgData.data), width, height), latestConfig.contrastFactor)

      /** 显示处理结果 */
      if (canvasRef.current) {
        canvasRef.current.width = width
        canvasRef.current.height = height
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.putImageData(processedData, 0, 0)
        }
      }

      /** 显示原图 */
      if (originalCanvasRef.current) {
        originalCanvasRef.current.width = width
        originalCanvasRef.current.height = height
        const originalCtx = originalCanvasRef.current.getContext('2d')
        if (originalCtx) {
          originalCtx.putImageData(imgData, 0, 0)
        }
      }
    }
    catch (error) {
      console.error('对比度增强处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [currentImage, setConfig])

  /** 处理二值化 */
  const processBinarize = useCallback(async () => {
    if (!canvasRef.current || !currentImage)
      return

    setIsProcessing(true)
    try {
      const { imgData, width, height } = await getImgData(currentImage)
      const latestConfig = setConfig.getLatest()

      /** 先灰度化，再对比度增强，最后二值化 */
      let processedData = adaptiveGrayscale(new ImageData(new Uint8ClampedArray(imgData.data), width, height))
      processedData = enhanceContrast(processedData, 1.2)
      processedData = adaptiveBinarize(processedData, latestConfig.binarizeThreshold)

      /** 显示处理结果 */
      if (canvasRef.current) {
        canvasRef.current.width = width
        canvasRef.current.height = height
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.putImageData(processedData, 0, 0)
        }
      }

      /** 显示原图 */
      if (originalCanvasRef.current) {
        originalCanvasRef.current.width = width
        originalCanvasRef.current.height = height
        const originalCtx = originalCanvasRef.current.getContext('2d')
        if (originalCtx) {
          originalCtx.putImageData(imgData, 0, 0)
        }
      }
    }
    catch (error) {
      console.error('二值化处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [currentImage, setConfig])

  /** 处理颜色替换 */
  const processColorReplace = useCallback(async () => {
    if (!canvasRef.current || !currentImage)
      return

    setIsProcessing(true)
    try {
      const latestConfig = setConfig.getLatest()

      /** 先获取原图尺寸 */
      const { imgData: originalImgData, width, height } = await getImgData(currentImage)

      /** 进行颜色替换 */
      const result = await changeImgColor(currentImage, latestConfig.fromColor, latestConfig.toColor)

      /** 显示处理结果 - 使用原图尺寸 */
      if (canvasRef.current) {
        canvasRef.current.width = width
        canvasRef.current.height = height
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.putImageData(result.imgData, 0, 0)
        }
      }

      /** 显示原图 */
      if (originalCanvasRef.current) {
        originalCanvasRef.current.width = width
        originalCanvasRef.current.height = height
        const originalCtx = originalCanvasRef.current.getContext('2d')
        if (originalCtx) {
          originalCtx.putImageData(originalImgData, 0, 0)
        }
      }
    }
    catch (error) {
      console.error('颜色替换处理失败:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [currentImage, setConfig])

  /** 根据处理类型执行相应处理 */
  const processImage = useCallback(debounce(async () => {
    switch (processType) {
      case 'grayscale':
        await processGrayscale()
        break
      case 'contrast':
        await processContrast()
        break
      case 'binarize':
        await processBinarize()
        break
      case 'colorReplace':
        await processColorReplace()
        break
    }
  }, 40), [processType, processGrayscale, processContrast, processBinarize, processColorReplace])

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
    <div className="min-h-screen from-pink-50 to-rose-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 */}
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          🎯 图像数据处理
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          图像灰度化、对比度增强、二值化、颜色替换等 ImageData 层面的处理
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 原图显示 */}
            <Card>
              <h3 className="mb-4 text-center text-lg text-gray-800 font-semibold dark:text-white">
                原图
              </h3>
              <div className="flex items-center justify-center min-h-[300px]">
                <canvas
                  ref={ originalCanvasRef }
                  className="border border-gray-300 rounded-lg bg-white shadow-md dark:border-gray-600 dark:bg-gray-800"
                  style={ { maxWidth: '100%', height: 'auto' } }
                />
              </div>
            </Card>

            {/* 处理结果显示 */}
            <Card>
              <h3 className="mb-4 text-center text-lg text-gray-800 font-semibold dark:text-white">
                处理结果
                {isProcessing && <span className="ml-2 text-sm text-blue-500">处理中...</span>}
              </h3>
              <div className="flex items-center justify-center min-h-[300px]">
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

              {/* 处理类型选择 */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  处理类型
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={ () => setProcessType('grayscale') }
                    variant={ processType === 'grayscale'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    🔘 灰度化
                  </Button>
                  <Button
                    onClick={ () => setProcessType('contrast') }
                    variant={ processType === 'contrast'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    🔆 对比度
                  </Button>
                  <Button
                    onClick={ () => setProcessType('binarize') }
                    variant={ processType === 'binarize'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    ⚫ 二值化
                  </Button>
                  <Button
                    onClick={ () => setProcessType('colorReplace') }
                    variant={ processType === 'colorReplace'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    🎨 换色
                  </Button>
                </div>
              </div>

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

              {/* 对比度增强参数 */}
              {processType === 'contrast' && (
                <div className="mb-6">
                  <h3 className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-200">
                    对比度参数
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        增强因子 (
                        {config.contrastFactor.toFixed(1)}
                        )
                      </label>
                      <div className="px-2">
                        <Slider
                          min={ 0.5 }
                          max={ 3.0 }
                          step={ 0.1 }
                          value={ config.contrastFactor }
                          onChange={ (value) => {
                            if (typeof value === 'number') {
                              updateConfig('contrastFactor', value)
                            }
                            else if (Array.isArray(value)) {
                              updateConfig('contrastFactor', value[0])
                            }
                          } }
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        1.0 为原始对比度，大于 1.0 增强对比度，小于 1.0 降低对比度
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 二值化参数 */}
              {processType === 'binarize' && (
                <div className="mb-6">
                  <h3 className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-200">
                    二值化参数
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        二值化阈值 (
                        {config.binarizeThreshold}
                        )
                      </label>
                      <div className="px-2">
                        <Slider
                          min={ 0 }
                          max={ 255 }
                          value={ config.binarizeThreshold }
                          onChange={ (value) => {
                            if (typeof value === 'number') {
                              updateConfig('binarizeThreshold', value)
                            }
                            else if (Array.isArray(value)) {
                              updateConfig('binarizeThreshold', value[0])
                            }
                          } }
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        像素值大于等于阈值显示为白色，小于阈值显示为黑色
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 颜色替换参数 */}
              {processType === 'colorReplace' && (
                <div className="mb-6">
                  <h3 className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-200">
                    颜色替换参数
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        源颜色（需要替换的颜色）
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={ config.fromColor }
                          onChange={ v => updateConfig('fromColor', v) }
                          className="h-10 w-16 border-0 rounded p-1"
                        />
                        <Input
                          type="text"
                          value={ config.fromColor }
                          onChange={ v => updateConfig('fromColor', v) }
                          className="flex-1"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-200">
                        目标颜色（替换后的颜色）
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={ config.toColor }
                          onChange={ v => updateConfig('toColor', v) }
                          className="h-10 w-16 border-0 rounded p-1"
                        />
                        <Input
                          type="text"
                          value={ config.toColor }
                          onChange={ v => updateConfig('toColor', v) }
                          className="flex-1"
                          placeholder="#ff0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 快速设置 */}
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  快速设置
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {processType === 'contrast' && (
                    <>
                      <Button onClick={ () => updateConfig('contrastFactor', 0.8) } variant="default" size="sm">低对比度</Button>
                      <Button onClick={ () => updateConfig('contrastFactor', 1.2) } variant="default" size="sm">中对比度</Button>
                      <Button onClick={ () => updateConfig('contrastFactor', 1.8) } variant="default" size="sm">高对比度</Button>
                      <Button onClick={ () => updateConfig('contrastFactor', 2.5) } variant="default" size="sm">超高对比度</Button>
                    </>
                  )}
                  {processType === 'binarize' && (
                    <>
                      <Button onClick={ () => updateConfig('binarizeThreshold', 64) } variant="default" size="sm">低阈值</Button>
                      <Button onClick={ () => updateConfig('binarizeThreshold', 128) } variant="default" size="sm">中阈值</Button>
                      <Button onClick={ () => updateConfig('binarizeThreshold', 192) } variant="default" size="sm">高阈值</Button>
                      <Button onClick={ () => updateConfig('binarizeThreshold', 240) } variant="default" size="sm">超高阈值</Button>
                    </>
                  )}
                  {processType === 'colorReplace' && (
                    <>
                      <Button
                        onClick={ () => {
                          updateConfig('fromColor', '#ffffff')
                          updateConfig('toColor', '#ff0000')
                        } }
                        variant="default"
                        size="sm">
                        白→红
                      </Button>
                      <Button
                        onClick={ () => {
                          updateConfig('fromColor', '#000000')
                          updateConfig('toColor', '#00ff00')
                        } }
                        variant="default"
                        size="sm">
                        黑→绿
                      </Button>
                      <Button
                        onClick={ () => {
                          updateConfig('fromColor', '#ff0000')
                          updateConfig('toColor', '#0000ff')
                        } }
                        variant="default"
                        size="sm">
                        红→蓝
                      </Button>
                      <Button
                        onClick={ () => {
                          updateConfig('fromColor', '#0000ff')
                          updateConfig('toColor', '#ffff00')
                        } }
                        variant="default"
                        size="sm">
                        蓝→黄
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* 使用说明 */}
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  使用说明
                </h3>
                <div className="text-sm text-gray-600 space-y-3 dark:text-gray-300">
                  {processType === 'grayscale' && (
                    <>
                      <div>
                        <strong>灰度化：</strong>
                        使用加权公式 Y = 0.299*R + 0.587*G + 0.114*B
                      </div>
                      <div>
                        <strong>应用场景：</strong>
                        图像预处理、降低计算复杂度
                      </div>
                    </>
                  )}
                  {processType === 'contrast' && (
                    <>
                      <div>
                        <strong>对比度增强：</strong>
                        通过乘法因子增强图像对比度
                      </div>
                      <div>
                        <strong>增强因子：</strong>
                        0.5-3.0，数值越大对比度越强
                      </div>
                    </>
                  )}
                  {processType === 'binarize' && (
                    <>
                      <div>
                        <strong>二值化：</strong>
                        将灰度图转换为黑白图像
                      </div>
                      <div>
                        <strong>处理流程：</strong>
                        灰度化 → 对比度增强 → 二值化
                      </div>
                      <div>
                        <strong>阈值范围：</strong>
                        0-255，推荐先进行灰度化和对比度增强
                      </div>
                    </>
                  )}
                  {processType === 'colorReplace' && (
                    <>
                      <div>
                        <strong>颜色替换：</strong>
                        将图像中指定颜色替换为另一种颜色
                      </div>
                      <div>
                        <strong>精确匹配：</strong>
                        当前为精确匹配模式，需要颜色完全一致
                      </div>
                      <div>
                        <strong>透明度：</strong>
                        支持 RGBA 颜色空间处理
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
