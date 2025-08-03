import type { mouseMoveCb, ScratchOpts } from './types'

/**
 * 刮刮乐，请确保有定位元素的包含块作为父级元素
 * @param canvas
 * @param opts 配置
 * @returns 返回清理函数
 */
export function createScratch(
  canvas: HTMLCanvasElement,
  opts: ScratchOpts = {},
) {
  const ctx = setStyle(canvas, opts)
  return bindEvent(canvas, ctx, opts.onScratch)
}

/**
 * 绘制刮奖区域样式
 * @param canvas - 画布
 * @param opts - 配置
 * @returns 返回上下文
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

  const ctx = canvas.getContext('2d', opts.ctxOpts)
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

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

/**
 * 绑定事件
 * @param canvas - 画布
 * @param ctx - 上下文
 * @param onScratch - 刮动回调函数
 */
function bindEvent(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  onScratch?: mouseMoveCb,
) {
  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mouseup', onMouseUp)

  /** 移动端支持 */
  canvas.addEventListener('touchstart', onTouchStart)
  canvas.addEventListener('touchend', onTouchEnd)
  canvas.addEventListener('touchcancel', onTouchEnd)

  return rmEvent

  function getCanvasCoordinates(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  function onMouseDown(e: MouseEvent) {
    e.preventDefault()
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvas.addEventListener('mousemove', onMouseMove)
  }

  function onMouseMove(e: MouseEvent) {
    e.preventDefault()
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)
    ctx.lineTo(x, y)
    ctx.stroke()
    onScratch?.(e)
  }

  function onTouchStart(e: TouchEvent) {
    e.preventDefault()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY)
      ctx.beginPath()
      ctx.moveTo(x, y)
      canvas.addEventListener('touchmove', onTouchMove)
    }
  }

  function onTouchMove(e: TouchEvent) {
    e.preventDefault()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY)
      ctx.lineTo(x, y)
      ctx.stroke()
      onScratch?.(e as any)
    }
  }

  function onMouseUp() {
    canvas.removeEventListener('mousemove', onMouseMove)
  }

  function onTouchEnd() {
    canvas.removeEventListener('touchmove', onTouchMove)
  }

  function rmEvent() {
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseup', onMouseUp)
    canvas.removeEventListener('touchstart', onTouchStart)
    canvas.removeEventListener('touchmove', onTouchMove)
    canvas.removeEventListener('touchend', onTouchEnd)
    canvas.removeEventListener('touchcancel', onTouchEnd)
  }
}
