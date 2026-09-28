/**
 * Loading 类型声明
 */

import type { CSSProperties, ReactNode } from 'react'
import type { Size } from '../../types'
import type { SkeletonProps } from '../Skeleton'
export interface LoadingProps {
  className?: string
  style?: CSSProperties
  loadingStyle?: CSSProperties

  /**
   * @default true
   */
  loading?: boolean
  /**
   * @default 50
   */
  zIndex?: number
  size?: number

  /**
   * 加载类型
   * @default 'spinner'
   */
  variant?: 'spinner' | 'skeleton' | 'custom'

  /**
   * spinner 模式下透传给 LoadingIcon 的属性，可覆盖 size
   */
  iconProps?: LoadingIconProps

  /**
   * 骨架屏属性
   */
  skeletonProps?: SkeletonProps

  /**
   * 自定义渲染
   */
  custom?: ReactNode
  children?: ReactNode
}

export type LoadingIconProps = LoadingIconBaseProps & LoadingIconShape

export type LoadingIconBaseProps = {
  className?: string
  style?: CSSProperties
  /**
   * @default 'md'
   */
  size?: Size
  /**
   * 圆环宽度，默认根据 size 自动计算
   */
  thickness?: number
  /**
   * 旋转动画参数，浅合并进默认值后传给 `Element.animate`
   *
   * 如反向旋转传 `{ direction: 'reverse' }`，放慢传 `{ duration: 2000 }`
   * @default { duration: 800, iterations: Infinity, easing: 'linear' }
   */
  animation?: KeyframeAnimationOptions
}

/**
 * 图标形态，`ring` 与 `gradient` 互斥，同时传会报类型错误
 * 都不传时按默认的 `gradient` 渲染
 */
export type LoadingIconShape =
  | {
    /**
     * 单色圆环，仅顶部一段着色，末端为直角。传对象可定制颜色
     */
    ring?: boolean | RingOptions
    gradient?: never
  }
  | {
    /**
     * 整圈渐变圆环，末端为圆头，默认形态。传对象可定制渐变，传 `false` 退回单色环
     */
    gradient?: boolean | GradientOptions
    ring?: never
  }

export type RingOptions = {
  /**
   * 旋转段颜色
   * @default 'rgb(var(--text) / 0.5)'
   */
  color?: string
  /**
   * 轨道颜色
   * @default 'rgb(var(--text) / 0.12)'
   */
  trackColor?: string
}

export type GradientOptions = {
  /**
   * 渐变起始色
   * @default 'transparent'
   */
  from?: string
  /**
   * 渐变终止色
   * @default 'rgb(var(--text) / 0.8)'
   */
  to?: string
}
