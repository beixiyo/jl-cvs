import { applyHiDPI } from '@/utils/dpr'
import type { AddCanvasOpts, NoteBoardOptions, NoteBoardOptionsRequired } from './type'

export function mergeOpts(opts: NoteBoardOptions): NoteBoardOptionsRequired {
  const defaultOpts: Omit<NoteBoardOptionsRequired, 'el'> = {
    width: 800,
    height: 600,
    minScale: 0.5,
    maxScale: 8,
    canvasZIndex: '20',
    enableRightDrag: true,
    isImgCanvasFollow: true,

    lineWidth: 1,
    strokeStyle: '#000',
    lineCap: 'round' as CanvasLineCap,
    globalCompositeOperation: 'source-over',
    drawGlobalCompositeOperation: 'source-over',
    shapeGlobalCompositeOperation: 'source-over',
  }

  return {
    ...defaultOpts,
    ...opts,
  }
}

export function setCanvas(
  opts: Required<AddCanvasOpts> & {
    parentEl: HTMLElement
  },
  dpr: number,
) {
  const { width, height, center, canvas, parentEl } = opts
  const { offsetHeight, offsetWidth } = parentEl

  applyHiDPI(canvas, canvas.getContext('2d') as CanvasRenderingContext2D, width, height, dpr)

  canvas.style.position = 'absolute'

  /** 居中 */
  if (center) {
    canvas.style.top = `${(offsetHeight - height) / 2}px`
    canvas.style.left = `${(offsetWidth - width) / 2}px`
  }
}
