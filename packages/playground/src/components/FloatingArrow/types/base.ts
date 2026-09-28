import type { CSSProperties } from 'react'

export type FloatingArrowSide = 'top' | 'right' | 'bottom' | 'left'
export type FloatingArrowAlign = 'start' | 'center' | 'end'
export type FloatingArrowPlacement = FloatingArrowSide | `${FloatingArrowSide}-${FloatingArrowAlign}`

export type FloatingArrowProps = {
  /** 浮层相对 reference 的最终方向，支持带 start/end 的 placement */
  placement: FloatingArrowPlacement
  /** 箭头中心到浮层交叉轴起始边的距离，单位 px */
  centerOffset: number
  /**
   * 箭头宽度，单位 px；不传时按 height 与默认宽高比推算
   * @default 24
   */
  size?: number
  /**
   * 箭头尖端凸出浮层边缘的高度，单位 px；不传时按 size 与默认宽高比推算
   * @default 7
   */
  height?: number
  /**
   * 是否绘制与浮层连续的边框
   * @default false
   */
  bordered?: boolean
  /**
   * 浮层边框宽度，单位 px
   * @default 1
   */
  borderWidth?: number
  /**
   * 箭头压入浮层的距离，用于消除亚像素接缝
   * @default 1
   */
  seamOverlap?: number
  /** 自定义箭头填充色 */
  fill?: CSSProperties['fill']
  className?: string
  style?: CSSProperties
}
