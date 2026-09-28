'use client'

import { cn } from '@/utils'
import { memo, useId } from 'react'
import { DATA_ATTR } from '../../constants/dataAttributes'
import type { FloatingArrowProps, FloatingArrowSide } from './types'
import { DEFAULT_FLOATING_ARROW_SEAM_OVERLAP } from './utils/config'
import { resolveFloatingArrowGeometry } from './utils/geometry'

const DEFAULT_BORDER_WIDTH = 1

/**
 * 浮层角标
 *
 * 使用双层 SVG path 连接浮层背景与边框，并通过轻微重叠消除浏览器
 * 亚像素渲染产生的接缝。轮廓走 {@link resolveFloatingArrowGeometry}：
 * 根部与浮层边缘相切、尖端磨圆，看上去是从浮层长出来而不是贴上去的三角形
 * 组件只负责绘制，reference 测量由调用方完成
 */
export const FloatingArrow = memo<FloatingArrowProps>((props) => {
  const {
    placement,
    centerOffset,
    size: sizeOption,
    height,
    bordered = false,
    borderWidth = DEFAULT_BORDER_WIDTH,
    seamOverlap = DEFAULT_FLOATING_ARROW_SEAM_OVERLAP,
    fill,
    className,
    style,
  } = props

  const clipPathId = useId().replaceAll(':', '')
  /** 绘制区取箭头宽度的方形，rotate(±90deg) 后占位不变，四个方向共用同一套定位 */
  const { width: size, path } = resolveFloatingArrowGeometry({ size: sizeOption, height })
  const [side] = placement.split('-') as [FloatingArrowSide]
  const isVerticalSide = side === 'top' || side === 'bottom'
  const resolvedBorderWidth = bordered
    ? borderWidth
    : 0

  /** SVG stroke 居中绘制，因此使用两倍宽度后再裁掉面板内侧部分 */
  const strokeWidth = resolvedBorderWidth * 2
  const halfStrokeWidth = strokeWidth / 2
  const crossAxisOffset = centerOffset
    - (size + strokeWidth) / 2
    - (isVerticalSide
      ? resolvedBorderWidth
      : 0)
  const crossAxisProperty = isVerticalSide
    ? 'left'
    : 'top'

  const rotation = {
    top: '',
    right: 'rotate(90deg)',
    bottom: 'rotate(180deg)',
    left: 'rotate(-90deg)',
  }[side]

  return (
    <svg
      aria-hidden
      { ...{ [DATA_ATTR.floatingArrow]: true } }
      width={ size + strokeWidth }
      height={ size }
      viewBox={ `0 0 ${size} ${size}` }
      className={ cn(
        'pointer-events-none absolute z-1 fill-background',
        className,
      ) }
      style={ {
        [crossAxisProperty]: crossAxisOffset,
        [side]: isVerticalSide
          ? `calc(100% - ${seamOverlap}px)`
          : `calc(100% - ${halfStrokeWidth + seamOverlap}px)`,
        transform: rotation,
        ...style,
      } }
    >
      { bordered && (
        <path
          clipPath={ `url(#${clipPathId})` }
          fill="none"
          className="stroke-border"
          strokeWidth={ strokeWidth + 1 }
          d={ path }
        />
      ) }

      <path
        className={ cn(
          'fill-background',
          bordered && 'stroke-background',
        ) }
        style={ fill
          ? { fill }
          : undefined }
        d={ path }
      />

      <clipPath id={ clipPathId }>
        <rect
          x={ -halfStrokeWidth }
          y={ halfStrokeWidth }
          width={ size + strokeWidth }
          height={ size }
        />
      </clipPath>
    </svg>
  )
})

FloatingArrow.displayName = 'FloatingArrow'
