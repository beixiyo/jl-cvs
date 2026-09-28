/**
 * Animate 组件类型声明
 */
import type { MotionProps } from 'motion/react'
import type { CSSProperties } from 'react'
import type * as React from 'react'
import { variantsMap } from './constants'

export type AnimateProps =
  & {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode

    duration?: number

    /**
     * 动画变体配置
     * 支持字符串枚举或自定义 Variants 对象
     * @default 'top-bottom'
     */
    variants?: keyof typeof variantsMap | MotionProps['variants']
  }
  & Omit<MotionProps, 'variants'>

export type AnimateShowProps =
  & {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode

    show?: boolean
    display?: string
    visibilityMode?: boolean
    duration?: number

    /**
     * 动画变体配置
     * 支持字符串枚举或自定义 Variants 对象
     * @default 'top-bottom'
     */
    variants?: keyof typeof variantsMap | MotionProps['variants']

    /**
     * 退出动画是否采用 set 同步模式
     * 这将关闭退出动画
     * ### 适用于路由动画，可以解决布局异常问题
     */
    exitSetMode?: boolean

    /**
     * 是否在组件挂载时播放动画
     * @default false
     */
    animateOnMount?: boolean
  }
  & Omit<MotionProps, 'variants'>
  & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
