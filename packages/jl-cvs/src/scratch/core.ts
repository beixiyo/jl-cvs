import { getDPR } from '@/canvasTool'
import { applyHiDPI } from '../utils/dpr'
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

  const w = width ?? canvas.width
  const h = height ?? canvas.height

  const ctx = canvas.getContext('2d', opts.ctxOpts)
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  /** dpr 边界统一入口：未传尺寸时按 canvas 现有尺寸提升分辩率 */
  applyHiDPI(canvas, ctx, w, h)

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

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

  /** 移动端支持 */
  canvas.addEventListener('touchstart', onTouchStart)

  return rmEvent

  /**
   * 客户端坐标 → 画布逻辑坐标
   * ctx 在 applyHiDPI 后处于逻辑坐标系（setTransform(dpr)），
   * 因此这里必须除以 dpr 得到逻辑尺寸，不能用 canvas.width（物理尺寸）
   */
  function getCanvasCoordinates(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    const dpr = getDPR()
    const logicalW = canvas.width / dpr
    const logicalH = canvas.height / dpr
    return {
      x: (clientX - rect.left) * (logicalW / rect.width),
      y: (clientY - rect.top) * (logicalH / rect.height),
    }
  }

  function onMouseDown(e: MouseEvent) {
    e.preventDefault()
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)
    ctx.beginPath()
    ctx.moveTo(x, y)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
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
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd)
      window.addEventListener('touchcancel', onTouchEnd)
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
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  function onTouchEnd() {
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
  }

  function rmEvent() {
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
  }
}
