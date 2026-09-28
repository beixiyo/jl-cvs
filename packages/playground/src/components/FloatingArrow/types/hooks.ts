import type { UseFloatingPositionOptions, UseFloatingPositionReturn } from '@/hooks'
import type { CSSProperties, RefObject } from 'react'
import type { FloatingArrowPlacement, FloatingArrowProps } from './base'
import type { FloatingArrowConfig, FloatingArrowOptions } from './config'

export type UseFloatingArrowOptions = {
  /** 是否启用自动测量 */
  enabled: boolean
  /** 浮层相对 reference 的最终方向 */
  placement: FloatingArrowPlacement
  /** 浮层定位样式，用于在位置变化后重新测量 */
  floatingStyle: CSSProperties
  /** reference 容器；默认优先测量其首个子元素 */
  referenceRef: RefObject<HTMLElement | null>
  /** floating 元素 */
  floatingRef: RefObject<HTMLElement | null>
  /** 虚拟 reference 的视口矩形 */
  virtualReferenceRect?: DOMRect | null
  /** 箭头宽度，单位 px */
  size?: number
  /** 受控中心偏移；传入后跳过自动测量 */
  centerOffset?: number
  /** 箭头外缘与浮层交叉轴边界的最小距离，单位 px */
  padding?: number
}

export type UseFloatingArrowStateOptions = {
  arrow?: FloatingArrowConfig
  enabled: boolean
  placement: FloatingArrowPlacement
  floatingStyle: CSSProperties
  referenceRef: RefObject<HTMLElement | null>
  floatingRef: RefObject<HTMLElement | null>
  virtualReferenceRect?: DOMRect | null
}

export type UseFloatingArrowStateResult = {
  options: FloatingArrowOptions | null
  centerOffset: number
  fill?: CSSProperties['fill']
  style: CSSProperties
}

export interface UseFloatingLayerOptions extends UseFloatingPositionOptions {
  /**
   * 箭头配置；关闭时 arrowProps 为 null
   * @default undefined
   */
  arrow?: FloatingArrowConfig
  /**
   * 箭头是否绘制与浮层连续的边框，需与浮层自身的边框保持一致
   * @default false
   */
  bordered?: boolean
  /**
   * 目标元素到浮层可见边缘的间距，单位 px
   *
   * 开启箭头时以箭头尖端为准，关闭箭头时以面板边缘为准
   * @default 8
   */
  offset?: number
}

export interface UseFloatingLayerReturn extends UseFloatingPositionReturn {
  /** 可直接展开给 FloatingArrow 的属性；未开启箭头时为 null */
  arrowProps: FloatingArrowProps | null
}
