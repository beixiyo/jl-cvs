import { getDPR } from '@/canvasTool'
import type { NoteBoardOptions, NoteBoardOptionsRequired } from './type'


export function mergeOpts(
  opts: NoteBoardOptions,
): NoteBoardOptionsRequired {

  const defaultOpts: NoteBoardOptionsRequired = {
    width: 800 * getDPR(),
    height: 600 * getDPR(),
    minScale: 0.5,
    maxScale: 8,

    lineWidth: 1,
    strokeStyle: '#000',
    lineCap: 'round' as CanvasLineCap,
    globalCompositeOperation: 'source-over'
  }

  return {
    ...defaultOpts,
    ...opts,
  }
}

export function setCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  canvas.width = width
  canvas.height = height
  canvas.style.position = 'absolute'

  const parent = canvas.parentElement!,
    { offsetHeight, offsetWidth } = parent

  // 居中
  canvas.style.top = `${(offsetHeight - height) / 2}px`
  canvas.style.left = `${(offsetWidth - width) / 2}px`
}
