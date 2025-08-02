import { cutoutImg as cutoutImgFn, cutoutImgToMask, getImg, NoteBoardWithBase64, type NoteBoardWithBase64Mode } from '@jl-org/cvs'
import { colorAddOpacity, downloadByUrl, resizeImg } from '@jl-org/tool'
import {
  ImageIcon,
  Info,
  Sparkles,
} from 'lucide-react'

import { memo, useCallback, useState } from 'react'
import { Loading } from '@/components/Loading'
import { Toolbar, type ToolbarMode } from '@/components/Toolbar'
import { onMounted, useAsyncEffect, useGetState, useUpdateEffect } from '@/hooks'
import { addTimestampParam, BRUSH_COLOR, cn, DEFAULT_STROKE_WIDTH } from '@/utils'

/**
 * 抠图组件
 */
export const CutoutImg = memo<CutoutImgProps>((
  {
    style,
    className,

    originImg,
    cutoutImg,

    onLoading,
    onChangeMask,
    onChangePreviewImg,
  },
) => {
  const brushColor = colorAddOpacity(BRUSH_COLOR, 1)
  const [loading, setLoading] = useState(false)
  const [maskImg, setMaskImg] = useState('')
  const [activeMode, setActiveMode] = useState<NoteBoardWithBase64Mode>('draw')
  const [brushSize, setBrushSize] = useGetState(DEFAULT_STROKE_WIDTH, true)
  const size = {
    width: 500,
    height: 500,
  }

  /**
   * 实时预览变化图
   */
  const previewContainer = useRef<HTMLDivElement>(null)
  const previewNoteboard = useRef<NoteBoardWithBase64>()

  /**
   * 涂抹画板
   */
  const brushContainer = useRef<HTMLDivElement>(null)
  const brushNoteboard = useRef<NoteBoardWithBase64>()

  // ======================
  // * Fns
  // ======================
  const getPreviewImg = useCallback(async () => {
    const rawImgCanvas = brushNoteboard.current
    const imgCanvas = previewNoteboard.current
    if (!rawImgCanvas || !imgCanvas)
      return ''

    const rawSrc = addTimestampParam(originImg)
    const mask = await rawImgCanvas.exportMask({ exportOnlyImgArea: true })
    onChangeMask?.(mask)

    /**
     * 解决跨域
     */
    const originCrossImg = await getImg(addTimestampParam(rawSrc), img => img.crossOrigin = 'anonymous') as HTMLImageElement
    const maskImg = await getImg(addTimestampParam(mask), img => img.crossOrigin = 'anonymous') as HTMLImageElement
    const img = await cutoutImgFn(originCrossImg, maskImg)
    return img
  }, [onChangeMask, originImg])

  const drawImg = useCallback(async (
    url: string,
    canvas?: NoteBoardWithBase64,
    beforeDraw?: VoidFunction,
  ) => {
    if (!canvas)
      return

    const img = await getImg(addTimestampParam(url), img => img.crossOrigin = 'anonymous')
    if (!img) {
      canvas.clear()
    }

    beforeDraw?.()
    canvas.drawImg(img as HTMLImageElement, { autoFit: true, center: true, needClear: false })
  }, [])

  const drawPreviewImg = useCallback(async () => {
    setLoading(true)
    onLoading?.(true)
    try {
      const previewImg = await getPreviewImg()

      if (previewImg) {
        onChangePreviewImg?.(previewImg)
        /**
         * 绘制变化的图片
         */
        drawImg(previewImg, previewNoteboard.current, () => previewNoteboard.current?.clear())
      }
    }
    finally {
      onLoading?.(false)
      setLoading(false)
    }
  }, [drawImg, getPreviewImg, onChangePreviewImg, onLoading])

  const drawInitImg = useCallback(async () => {
    drawImg(cutoutImg, previewNoteboard.current, () => previewNoteboard.current?.clear())
    drawImg(originImg, brushNoteboard.current)
  }, [cutoutImg, drawImg, originImg])

  const drawInitMask = useCallback(async () => {
    const { base64 } = await cutoutImgToMask(cutoutImg, brushColor)
    const resizedBase64 = await resizeImg(base64, size.width, size.height)

    setMaskImg(base64)
    brushNoteboard.current?.history.add(resizedBase64)
  }, [brushColor, cutoutImg, size.height, size.width])

  const drawUnRedoReizeMask = useCallback(
    async (img: HTMLImageElement) => {
      const board = brushNoteboard.current
      if (!board) {
        return false
      }
      const size = board.imgInfo
      if (!size) {
        return false
      }

      const resizedMask = await resizeImg(img.src, size.rawWidth, size.rawHeight)
      await board.drawImg(resizedMask, {
        autoFit: true,
        context: board.ctx,
      })
      return true
    },
    [],
  )

  // ======================
  // * Init
  // ======================
  onMounted(() => {
    if (!brushContainer.current! || !previewContainer.current)
      return

    /**
     * 实时预览变化图
     */
    previewNoteboard.current = new NoteBoardWithBase64({
      el: previewContainer.current!,
      width: size.width as number,
      height: size.height as number,
    })
    previewNoteboard.current.setMode('none')
    previewNoteboard.current.isEnableZoom = false
    previewNoteboard.current.rmEvent()

    return () => {
      previewNoteboard.current?.dispose()
    }
  })

  // ======================
  // * Watch
  // ======================
  useEffect(
    () => {
      const lineWidth = setBrushSize.getLatest()

      /**
       * 涂抹画板
       */
      const noteBoard = new NoteBoardWithBase64({
        el: brushContainer.current!,
        width: size.width as number,
        height: size.height as number,
        lineWidth,
        strokeStyle: brushColor,
        // drawGlobalCompositeOperation: 'xor',
        minScale: 0.9,
        maxScale: 2.5,

        onMouseUp: drawPreviewImg,
        onWheel({ scale }) {
          const lineWidth = setBrushSize.getLatest()
          noteBoard.setStyle({
            lineWidth: lineWidth / scale,
          })
          noteBoard.setCursor()
        },
      })

      brushNoteboard.current = noteBoard
      noteBoard.setMode('draw')

      drawInitImg().then(() => {
        drawInitMask()
      })

      return () => {
        brushNoteboard.current?.dispose()
      }
    },
    [brushColor, drawInitImg, drawInitMask, drawPreviewImg, setBrushSize, size.height, size.width],
  )

  /**
   * 绘制预览图和涂抹图
   */
  useAsyncEffect(
    drawInitImg,
    [cutoutImg, originImg],
    {
      onlyRunInUpdate: true,
    },
  )

  /**
   * 设置初始遮罩
   */
  useAsyncEffect(
    drawInitMask,
    [cutoutImg],
    {
      onlyRunInUpdate: true,
    },
  )

  /**
   * 画遮罩
   */
  useEffect(
    () => {
      if (!maskImg || !brushNoteboard.current)
        return

      brushNoteboard.current.clear(false, true)
      brushNoteboard.current.drawImg(maskImg, {
        autoFit: true,
        center: true,
        needClear: false,
        context: brushNoteboard.current.canvasList.find(item => item.name === 'brushCanvas')!.ctx,
      })
    },
    [maskImg],
  )

  /**
   * 设置画笔粗细
   */
  useUpdateEffect(
    () => {
      const noteBoard = brushNoteboard.current
      if (!noteBoard)
        return

      noteBoard.setStyle({ lineWidth: brushSize })
      noteBoard.setCursor()
    },
    [brushSize],
  )

  // ======================
  // * Handle
  // ======================
  const handleDownload = useCallback(async () => {
    const previewImg = await previewNoteboard.current?.exportImg()
    if (previewImg) {
      downloadByUrl(previewImg)
    }
  }, [])

  const handleModeChange = useCallback((mode: NoteBoardWithBase64Mode) => {
    setActiveMode(mode)
    brushNoteboard.current?.setMode(mode)
  }, [])

  const handleResetSize = useCallback(() => {
    brushNoteboard.current?.resetSize()
  }, [])

  const handleUndo = useCallback(async () => {
    await brushNoteboard.current?.undo(drawUnRedoReizeMask)
    drawPreviewImg()
  }, [drawPreviewImg, drawUnRedoReizeMask])

  const handleRedo = useCallback(async () => {
    await brushNoteboard.current?.redo(drawUnRedoReizeMask)
    drawPreviewImg()
  }, [drawPreviewImg, drawUnRedoReizeMask])

  const handleClear = useCallback(() => {
    brushNoteboard.current?.clear(false, true)
    drawPreviewImg()
  }, [drawPreviewImg])

  const modes: ToolbarMode[] = [
    { value: 'draw', label: '涂抹', hasBrushSlider: true },
    { value: 'erase', label: '擦除', hasBrushSlider: true },
  ]

  return <div
    className={ cn(
      'CutoutImgContainer flex gap-4 p-6 flex-col bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors',
      'md:p-8',
      className,
    ) }
    style={ style }
  >
    <Toolbar
      modes={ modes }
      activeMode={ activeMode }
      onModeChange={ handleModeChange as any }
      brushSize={ brushSize }
      onBrushSizeChange={ setBrushSize }
      onDownload={ handleDownload }
      onResetSize={ handleResetSize }
      onUndo={ handleUndo }
      onRedo={ handleRedo }
      onClear={ handleClear }
    />

    <div className="flex flex-col gap-4 md:flex-row">
      {/* 预览区域 */ }
      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-center gap-1.5 text-sm text-gray-700 font-medium dark:text-gray-300">
          <Sparkles className="h-4 w-4 text-amber-500" />
          预览效果
        </div>
        <div
          className="relative overflow-hidden border border-gray-200 rounded-lg shadow-sm dark:border-gray-700"
          ref={ previewContainer }
          style={ {
            backgroundImage: `url(${new URL('@/assets/img/transparentBg.png', import.meta.url).href})`,
            height: size.height,
            width: size.width,
          } }
        >
        </div>
      </div>

      {/* 编辑区域 */ }
      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-center gap-1.5 text-sm text-gray-700 font-medium dark:text-gray-300">
          <ImageIcon className="h-4 w-4 text-blue-500" />
          编辑区域
        </div>
        <div className="relative">
          <div
            className="overflow-hidden border border-gray-200 rounded-lg shadow-sm dark:border-gray-700"
            ref={ brushContainer }
            style={ {
              backgroundImage: `url(${new URL('@/assets/img/transparentBg.png', import.meta.url).href})`,
              height: size.height,
              width: size.width,
            } }
          ></div>
          <Loading loading={ loading } />
        </div>
      </div>
    </div>

    {/* 底部提示 */ }
    <div className="mt-3 flex items-center rounded-md bg-gray-50 p-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      <Info className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
      <span>提示：使用涂抹工具标记需要保留的区域，使用擦除工具移除不需要的部分。每次操作后会自动更新预览效果。</span>
    </div>
  </div>
})

CutoutImg.displayName = 'CutoutImg'

export type CutoutImgProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode

  /**
   * 抠好的图
   */
  cutoutImg: string
  /**
   * 原图
   */
  originImg: string

  onChangeMask?: (mask: string) => void
  onChangePreviewImg?: (img: string) => void
  onLoading?: (loading: boolean) => void
}
