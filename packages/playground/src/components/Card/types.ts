/**
 * Card 组件类型声明
 */
import type * as React from 'react'
import type { Rounded, SemanticVariant, Size } from '../../types'

export type CardVariant = SemanticVariant | 'primary' | 'transparent' | 'glass'
export type CardPadding = 'none' | 'sm' | 'default' | 'lg' | 'xl' | (string & {})
export type CardShadow = 'none' | Exclude<Size, number> | 'xl' | '2xl' | 'inner' | number

export type CardProps =
  & {
    /**
     * 卡片标题
     */
    title?: React.ReactNode
    /**
     * title 为字符串时渲染的标签，用于控制文档标题层级
     * @default 'h3'
     */
    titleTag?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
    /**
     * 卡片图片，可以是图片URL或React节点
     */
    image?: string | React.ReactNode
    /**
     * 图片alt属性
     * @default ''
     */
    imageAlt?: string
    /**
     * 卡片底部内容
     */
    footer?: React.ReactNode
    /**
     * 卡片变体样式
     * @default 'default'
     */
    variant?: CardVariant
    /**
     * 是否显示边框
     * @default light: false, dark: true
     */
    bordered?: boolean
    /**
     * 阴影大小
     * @default 'md'
     */
    shadow?: CardShadow
    /**
     * 圆角大小
     * @default 'xl'
     */
    rounded?: Rounded | number
    /**
     * 头部是否有分隔线
     * @default false
     */
    headerDivider?: boolean
    /**
     * 底部是否有分隔线
     * @default false
     */
    footerDivider?: boolean
    /**
     * 头部右侧操作区
     */
    headerActions?: React.ReactNode
    /**
     * 头部自定义类名
     */
    headerClassName?: string
    /**
     * 内容区自定义类名
     */
    bodyClassName?: string
    /**
     * 底部自定义类名
     */
    footerClassName?: string
    /**
     * 图片容器自定义类名
     */
    imageClassName?: string
    /**
     * 图片自定义样式
     */
    imageStyle?: React.CSSProperties
    /**
     * 鼠标悬浮时显示阴影和边框效果
     * @default true
     */
    hoverEffect?: boolean
    /**
     * 卡片各区域内边距（头部/内容/底部）
     * @default 'default'
     */
    padding?: CardPadding
  }
  & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

export type Card3DProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties

  /** 是否启用3D效果 */
  enable3D?: boolean
  /** 3D透视距离 */
  perspective?: number
  /** X轴旋转范围 [最小角度, 最大角度] */
  xRotateRange?: [number, number]
  /** Y轴旋转范围 [最小角度, 最大角度] */
  yRotateRange?: [number, number]
  /** 过渡动画速度(秒) */
  transitionSpeed?: number

  /** 是否启用边框 */
  enableBorder?: boolean
  /** 边框大小 */
  borderSize?: number
  /** 渐变边框颜色 */
  gradientColors?: string[]
  /** 阴影颜色 */
  shadowColor?: string
  /** 边框动画持续时间 */
  animationDuration?: string

  /** 在移动设备上禁用3D效果 */
  disableOnMobile?: boolean
  /** 3D效果强度系数 (1为正常) */
  intensity?: number
}

export type GlowBorderProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  /** 子元素 */
  children: React.ReactNode
  /** 边框大小 */
  borderSize?: number
  /** 渐变边框颜色 */
  gradientColors?: string[]
  /** 边框动画持续时间 */
  animationDuration?: string
}
