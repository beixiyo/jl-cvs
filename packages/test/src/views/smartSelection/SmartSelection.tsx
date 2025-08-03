import type { Binary } from '@/utils/handleMask'
import { NoteBoardWithBase64 } from '@jl-org/cvs'
import { cutImg, getImg, throttle } from '@jl-org/tool'
import { memo } from 'react'
import { Loading } from '@/components/Loading'

import { BRUSH_COLOR, DEFAULT_STROKE_WIDTH } from '@/config'
import { useAsyncEffect, useUpdateEffect } from '@/hooks'
import { cn, composeBase64 } from '@/utils'
import { getAlphaMask, getImgDataMatrix } from '@/utils/handleMask'

export const SmartSelection = memo<SmartSelectionProps>((
  {
    style,
    className,
    imgUrl,
    maskData,
  },
) => {
  const [hoverIndex, setHoverIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number[]>([])
  const [maskSegs, setMaskSegs] = useState<MaskData[]>([])

  /**
   * NoteBoard
   */
  const containerRef = useRef<HTMLDivElement>(null)
  const noteBoard = useRef<NoteBoardWithBase64>()
  const rect = useRef<DOMRect>()

  const imgInfo = useMemo(
    () => noteBoard.current?.imgInfo,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      noteBoard.current?.imgInfo?.x,
      noteBoard.current?.imgInfo?.y,
    ],
  )
  const transferRect = getTransferRect()

  function getRectAndSize() {
    if (containerRef.current) {
      rect.current = containerRef.current.getBoundingClientRect()
    }
  }

  function initNoteBoard() {
    if (!containerRef.current || !rect.current) {
      return
    }

    noteBoard.current = new NoteBoardWithBase64({
      el: containerRef.current!,
      width: rect.current.width,
      height: rect.current.height,
      lineWidth: DEFAULT_STROKE_WIDTH,
      strokeStyle: BRUSH_COLOR,
      drawGlobalCompositeOperation: 'xor',
      minScale: 0.9,
      maxScale: 3.5,

      onWheel({ scale }) {
        const canvas = noteBoard.current
        if (!canvas || scale < 1)
          return

        canvas.setStyle({ lineWidth: DEFAULT_STROKE_WIDTH / scale })
        if (canvas.mode !== 'draw')
          return
        canvas.setCursor()
      },
    })

    noteBoard.current.setMode('none')
    noteBoard.current.isEnableZoom = false
  }

  function drawImg() {
    const canvas = noteBoard.current
    if (!canvas) {
      return
    }

    canvas.drawImg(imgUrl, {
      autoFit: true,
      center: true,
      needClear: true,
    })
  }

  /***************************************************
   *                 Smart Selection
   ***************************************************/

  async function getMaskData() {
    const res: MaskData[] = []
    for (const mask of maskData) {
      const alphaMask = await getAlphaMask(composeBase64(mask))
      const matrix = await getImgDataMatrix(composeBase64(alphaMask))
      res.push({
        mask: alphaMask,
        matrix,
      })
    }

    setMaskSegs(res)
  }

  function getTransferRect() {
    const _rect = rect.current
    if (!imgInfo || !maskSegs.length || !_rect)
      return

    const maskWidth = maskSegs[0].matrix.length
    const maskHeight = maskSegs[0].matrix[0].length

    const scaleX = imgInfo.drawWidth / maskWidth
    const scaleY = imgInfo.drawHeight / maskHeight

    const rawScaleX = imgInfo.rawWidth / maskWidth
    const rawScaleY = imgInfo.rawHeight / maskHeight

    return {
      scaleX,
      scaleY,
      minScale: Math.min(scaleX, scaleY),

      rawScaleX,
      rawScaleY,
      rawMinScale: Math.min(rawScaleX, rawScaleY),

      maskWidth,
      maskHeight,
    }
  }

  async function drawSmartMask(index: number) {
    const canvas = noteBoard.current
    if (!canvas)
      return

    const img = await getImg(maskSegs[index].mask)
    const rect = getTransferRect()
    if (!rect || !img)
      return

    const imgSrc = await cutImg(img, {
      scaleX: rect.rawMinScale,
      scaleY: rect.rawMinScale,
    })

    return canvas.drawImg(imgSrc, {
      autoFit: true,
      center: true,
      needClear: false,
      context: canvas.ctx,
      needRecordImgInfo: false,
    })
  }

  function removeMask(index: number) {
    if (!noteBoard.current || !maskSegs.length || !imgInfo)
      return

    const maskMatrix = maskSegs[index].matrix
    const transferData = getTransferRect()
    if (!transferData)
      return

    const { scaleX, scaleY } = transferData
    const { y: top, x: left } = imgInfo

    /**
     * 大小转换，否则无法清理干净
     */
    const mapPixelWidth = Math.ceil(imgInfo.scaleX * 1.3)
    const mapPixelHeight = Math.ceil(imgInfo.scaleY * 1.3)

    for (let x = 0; x < maskMatrix.length; x++) {
      const item = maskMatrix[x]

      for (let y = 0; y < item.length; y++) {
        const item = maskMatrix[x][y]
        if (item == 1) {
          const _x = Math.round(x * scaleX) + left
          const _y = Math.round(y * scaleY) + top
          noteBoard.current.ctx.clearRect(_x, _y, mapPixelWidth, mapPixelHeight)
        }
      }
    }
  }

  function _onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const _rect = rect.current
    if (!imgInfo || !_rect || !maskSegs.length) {
      return
    }

    const { clientX, clientY } = e
    const transferData = getTransferRect()
    if (!transferData)
      return
    const { scaleX, scaleY, maskWidth, maskHeight } = transferData

    const left = clientX - _rect.left - imgInfo.x
    const top = clientY - _rect.top - imgInfo.y

    const x = Math.round(left / scaleX)
    const y = Math.round(top / scaleY)

    if (
      x > maskWidth || x < 0
      || y > maskHeight || y < 0
    ) {
      mouseLeave()
      return
    }

    const i = maskSegs.findIndex((seg) => {
      const { matrix } = seg
      return matrix[x]?.[y] == 1
    })

    if (i >= 0) {
      setHoverIndex(i)
    }
    else {
      mouseLeave()
    }
  }

  function mouseLeave() {
    setHoverIndex(-1)
  }

  function onSelectIndex() {
    if (hoverIndex < 0) {
      return
    }

    setSelectedIndex((prev) => {
      if (prev.includes(hoverIndex)) {
        removeMask(hoverIndex)
        return prev.filter(i => i != hoverIndex)
      }
      drawSmartMask(hoverIndex)
      return [...prev, hoverIndex]
    })
  }

  const onMouseMove = throttle(_onMouseMove, 50)

  /***************************************************
   *                    Effects
   ***************************************************/

  useAsyncEffect(async () => {
    setLoading(true)

    getRectAndSize()
    initNoteBoard()
    drawImg()

    try {
      await getMaskData()
    }
    catch (e) {
      alert('loaded fail')
    }
    finally {
      setLoading(false)
    }
  }, [])

  useUpdateEffect(
    () => {
      drawImg()
    },
    [imgUrl],
  )

  return <div
    ref={ containerRef }
    className={ cn(
      'SmartSelectionContainer size-full relative',
      className,
    ) }
    style={ style }

    onMouseMove={ onMouseMove }
    onMouseLeave={ mouseLeave }
    onMouseOut={ mouseLeave }
    onClick={ onSelectIndex }
  >
    { hoverIndex >= 0 && maskSegs[hoverIndex]?.mask && transferRect && <img
      src={ maskSegs[hoverIndex].mask }
      alt="Hover Mask"
      style={ {
        position: 'absolute',
        transform: imgInfo
          ? `translate(${imgInfo.x}px, ${imgInfo.y}px)`
          : 'none',
        width: imgInfo
          ? imgInfo.drawWidth
          : 0,
        height: imgInfo
          ? imgInfo.drawHeight
          : 0,
        zIndex: 50,
        pointerEvents: 'none',
      } }
    /> }

    <Loading loading={ loading } />
  </div>
})

SmartSelection.displayName = 'SmartSelection'

export type SmartSelectionProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  imgUrl: string
  maskData: string[]
}

type MaskData = {
  mask: string
  matrix: Binary[][]
}
