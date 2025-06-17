import type { mouseMoveCb, ScratchOpts } from './types'

/**
 * 刮刮乐，请确保有定位元素的包含块作为父级元素
 * @param canvas
 * @param onScratch 刮动回调函数
 * @param opts 配置
 * @returns 返回清理函数
 */
export function createScratch(
  canvas: HTMLCanvasElement,
  opts: ScratchOpts = {},
  onScratch?: mouseMoveCb,
) {
  const ctx = setStyle(canvas, opts)
  return bindEvent(canvas, ctx, onScratch)
}

/**
 * 绘制刮奖区域样式
 */
function setStyle(canvas: HTMLCanvasElement, opts: ScratchOpts) {
  const {
    width,
    height,
    bg = '#999',
    lineWidth = 15,
    lineCap = 'round',
    lineJoin = 'round',
  } = opts || {}

  width && (canvas.width = width)
  height && (canvas.height = height)

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  /** 什么颜色都行 */
  ctx.fillStyle = 'transparent'
  ctx.lineWidth = lineWidth
  ctx.lineCap = lineCap
  ctx.lineJoin = lineJoin
  /* 仅展示后图与前图重叠部分 */
  ctx.globalCompositeOperation = 'destination-out'

  const s = canvas.style
  s.position = 'absolute'
  s.left = '0'
  s.top = '0'
  s.right = '0'
  s.bottom = '0'
  s.zIndex = '9999'

  return ctx
}

function bindEvent(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  onScratch?: mouseMoveCb,
) {
  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mouseup', onMouseUp)

  return rmEvent

  function onMouseDown({ clientX, clientY }: MouseEvent) {
    ctx.moveTo(clientX, clientY)
    canvas.addEventListener('mousemove', onMouseMove)
  }

  function onMouseMove(e: MouseEvent) {
    ctx.lineTo(e.clientX, e.clientY)
    ctx.stroke()
    onScratch?.(e)
  }

  function onMouseUp() {
    canvas.removeEventListener('mousemove', onMouseMove)
  }

  function rmEvent() {
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseup', onMouseUp)
  }
}
