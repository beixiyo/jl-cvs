import type { Rect } from './types'

/**
 * 规范化矩形
 * - 将可能出现的负宽高转为标准轴对齐矩形
 */
export function normalizeRect(r: Rect): Rect {
  const x = Math.min(r.x, r.x + r.width)
  const y = Math.min(r.y, r.y + r.height)
  const w = Math.abs(r.width)
  const h = Math.abs(r.height)
  return { x, y, width: w, height: h }
}

/**
 * 判断两个轴对齐矩形是否相交
 */
export function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width < b.x
    || b.x + b.width < a.x
    || a.y + a.height < b.y
    || b.y + b.height < a.y
  )
}

/**
 * 计算两个矩形的并集矩形
 */
export function unionRect(a: Rect, b: Rect): Rect {
  const x1 = Math.min(a.x, b.x)
  const y1 = Math.min(a.y, b.y)
  const x2 = Math.max(a.x + a.width, b.x + b.width)
  const y2 = Math.max(a.y + a.height, b.y + b.height)
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }
}
