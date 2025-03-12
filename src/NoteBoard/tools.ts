import type { AddCanvasOpts, NoteBoardOptions, NoteBoardOptionsRequired } from './type'


export function mergeOpts(
  opts: NoteBoardOptions,
  dpr: number
): NoteBoardOptionsRequired {

  const defaultOpts: NoteBoardOptionsRequired = {
    width: 800 * dpr,
    height: 600 * dpr,
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

export function setCanvas(
  opts: Required<AddCanvasOpts> & {
    parentEl: HTMLElement
  },
  dpr: number
) {
  const { width, height, center, canvas, parentEl } = opts
  const { offsetHeight, offsetWidth } = parentEl

  canvas.width = width * dpr
  canvas.height = height * dpr

  canvas.style.position = 'absolute'
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  // 居中
  if (center) {
    canvas.style.top = `${(offsetHeight - height) / 2}px`
    canvas.style.left = `${(offsetWidth - width) / 2}px`
  }
}
