import { getDPR } from '@/canvasTool'
import type { AddCanvasOpts, NoteBoardOptions, NoteBoardOptionsRequired } from './type'


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

export function setCanvas(opts: Required<AddCanvasOpts> & { parentEl: HTMLElement }) {
  const { width, height, center, canvas, parentEl } = opts
  const { offsetHeight, offsetWidth } = parentEl
  parentEl.appendChild(canvas)

  canvas.width = width
  canvas.height = height
  canvas.style.position = 'absolute'

  // 居中
  if (center) {
    canvas.style.top = `${(offsetHeight - height) / 2}px`
    canvas.style.left = `${(offsetWidth - width) / 2}px`
  }
}
