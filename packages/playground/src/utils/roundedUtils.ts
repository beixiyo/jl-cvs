import type { Rounded } from '../types'

/**
 * 圆角类型对应的 Tailwind 类名映射
 */
export const roundedMapping: Record<Rounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-xs',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

/**
 * 圆角档位对应的像素值映射（与 roundedMapping 的 Tailwind 类名一一对应）
 */
export const roundedRadiusMapping: Record<Rounded, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
}

/**
 * 获取圆角对应的像素值（数值原样返回，档位查表，识别不到用 fallback）
 * @param rounded 圆角档位或数值（兼容 cva variant 可能为 null）
 * @param fallback 识别不到时的兜底像素值
 * @default
 * @returns 圆角像素值
 */
export function getRoundedRadius(rounded: Rounded | number | null | undefined, fallback = 12): number {
  if (typeof rounded === 'number') {
    return rounded
  }
  if (rounded == null) {
    return fallback
  }
  return roundedRadiusMapping[rounded] ?? fallback
}

/**
 * 获取圆角样式
 * @param rounded 圆角大小或数值
 * @returns 对应的类名或样式对象
 */
export function getRoundedStyles(rounded: Rounded | number | undefined) {
  if (rounded === undefined) {
    return { className: '', style: {} }
  }

  if (typeof rounded === 'number') {
    return {
      className: '',
      style: { borderRadius: `${rounded}px` },
    }
  }

  return {
    className: roundedMapping[rounded] || '',
    style: {},
  }
}
