import type { Size } from '../types'

/**
 * Size 样式配置
 * 用于将 Size 类型转换为类名或行内样式
 */
export interface SizeStyleConfig<T extends string = Exclude<Size, number>> {
  /** 字符串尺寸对应的类名 */
  classes: Record<T, string>
  /** 数字尺寸对应的样式映射函数 */
  getInlineStyle?: (size: number) => React.CSSProperties
}

/**
 * 获取 Size 对应的类名和行内样式
 * @param size - 尺寸值
 * @param config - 样式配置
 * @returns 包含类名和行内样式的对象
 */
export function getSizeStyles<T extends string>(
  size: T | number,
  config: SizeStyleConfig<T>,
): {
  className?: string
  style?: React.CSSProperties
} {
  if (typeof size === 'number') {
    return {
      style: config.getInlineStyle?.(size) || {},
    }
  }
  return {
    className: config.classes[size],
  }
}

/**
 * 获取 Size 对应的类名（仅用于字符串尺寸）
 * @param size - 尺寸值
 * @param classes - 类名映射
 * @returns 类名字符串或 undefined
 */
export function getSizeClassName<T extends string>(
  size: T | number,
  classes: Record<T, string>,
): string | undefined {
  if (typeof size === 'number') {
    return undefined
  }
  return classes[size]
}

/**
 * 获取 Size 对应的行内样式（仅用于数字尺寸）
 * @param size - 尺寸值
 * @param getStyle - 样式生成函数
 * @returns 样式对象或 undefined
 */
export function getSizeInlineStyle<T extends string>(
  size: T | number,
  getStyle: (size: number) => React.CSSProperties,
): React.CSSProperties | undefined {
  if (typeof size === 'number') {
    return getStyle(size)
  }
  return undefined
}
