import type { FloatingArrowConfig, FloatingArrowOptions, ResolveFloatingOffsetOptions } from '../types'
import { resolveFloatingArrowGeometry } from './geometry'

/** 箭头默认压入浮层的距离，单位 px，用于消除亚像素接缝 */
export const DEFAULT_FLOATING_ARROW_SEAM_OVERLAP = 1

const DEFAULT_OPTIONS: FloatingArrowOptions = {}

/** 将箭头开关统一归一化为配置对象 */
export function resolveFloatingArrowOptions(
  arrow?: FloatingArrowConfig | null,
): FloatingArrowOptions | null {
  if (!arrow) return null

  return arrow === true
    ? DEFAULT_OPTIONS
    : arrow
}

/**
 * 箭头尖端超出浮层边缘的可见距离，单位 px
 *
 * 取轮廓的实际高度，再扣除压入浮层的接缝重叠；关闭箭头时为 0
 */
export function getFloatingArrowProtrusion(
  arrow?: FloatingArrowConfig | null,
  seamOverlap = DEFAULT_FLOATING_ARROW_SEAM_OVERLAP,
): number {
  const options = resolveFloatingArrowOptions(arrow)
  if (!options) return 0

  const { height } = resolveFloatingArrowGeometry(options)
  return Math.max(height - seamOverlap, 0)
}

/**
 * 把「目标元素到浮层可见边缘」的间距换算为定位用的主轴偏移
 *
 * 设计稿标注的间距以可见边缘为准：开启箭头时是箭头尖端，
 * 关闭箭头时是面板边缘。定位 Hook 只认面板边缘，因此开启箭头时
 * 需要把箭头凸出的部分加回去，保证两种状态下视觉间距一致
 */
export function resolveFloatingOffset(options: ResolveFloatingOffsetOptions): number {
  const {
    offset,
    arrow,
    seamOverlap,
  } = options

  return offset + getFloatingArrowProtrusion(arrow, seamOverlap)
}
