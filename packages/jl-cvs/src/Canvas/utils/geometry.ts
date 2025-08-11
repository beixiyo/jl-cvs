import type { BoundRect } from '@/Shapes/type'

/**
 * 判断两个轴对齐矩形是否相交
 */
export function rectsIntersect(a: BoundRect, b: BoundRect): boolean {
  return !(
    a.x + a.width < b.x
    || b.x + b.width < a.x
    || a.y + a.height < b.y
    || b.y + b.height < a.y
  )
}
