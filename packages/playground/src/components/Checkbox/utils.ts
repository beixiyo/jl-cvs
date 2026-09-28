import type { Size } from '../../types'

/**
 * 将 Size 类型转换为数字
 * @param size - 大小值，可以是数字或 Size 类型（'sm' | 'md' | 'lg' | number）
 * @returns 对应的数字大小值
 */
export function getSizeValue(size: Size): number {
  if (typeof size === 'number') {
    return size
  }
  const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
    sm: 18,
    md: 22,
    lg: 28,
  }
  return sizeMap[size]
}
