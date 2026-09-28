import type { CSSProperties, RefObject } from 'react'

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right'
export type FloatingAlign = 'start' | 'center' | 'end'
export type FloatingPlacement = FloatingSide | `${FloatingSide}-${FloatingAlign}`

export type UseFloatingPositionOptions = {
  /**
   * 是否启用自动更新与位置计算
   * @default true
   */
  enabled?: boolean

  /**
   * 首选位置
   * @default 'bottom'
   */
  placement?: FloatingPlacement

  /**
   * 与触发器的主轴偏移距离（像素）
   * @default 8
   */
  offset?: number

  /**
   * 与视口边缘的最小间距（像素）
   * @default 8
   */
  boundaryPadding?: number

  /**
   * 当首选位置不可用时是否翻面（使用相反 side）
   * @default true
   */
  flip?: boolean

  /**
   * 是否将浮层贴到视口可见范围内（clamp）
   * @default true
   */
  shift?: boolean

  /**
   * 是否监听 window scroll/resize 自动更新
   * @default true
   */
  autoUpdate?: boolean

  /**
   * scroll 监听是否使用 capture，以覆盖更多滚动容器
   * @default true
   */
  scrollCapture?: boolean

  /**
   * 定位策略
   * @default 'fixed'
   */
  strategy?: 'fixed' | 'absolute'

  /**
   * 自定义滚动容器，不提供则自动检测
   */
  scrollContainers?: HTMLElement[]

  /**
   * 虚拟 reference 的矩形区域，用于不依赖 DOM ref 的定位（如鼠标坐标、光标坐标）
   */
  virtualReferenceRect?: DOMRect | null

  /**
   * 每次 `update` 时拉取锚点矩形；与 `virtualReferenceRect` 二选一优先用本项（选区、滚动中更准）
   */
  getVirtualReferenceRect?: () => DOMRect | null

  /**
   * 跟随滚动模式：传入定位容器 ref 时，浮层以该容器为坐标系、position: absolute，
   * 随容器内滚动一起移动，无需监听 scroll 更新位置
   */
  containerRef?: RefObject<HTMLElement | null>
}

export type UseFloatingPositionReturn = {
  style: CSSProperties
  placement: FloatingPlacement
  strategy: 'fixed' | 'absolute'
  update: () => void
}
