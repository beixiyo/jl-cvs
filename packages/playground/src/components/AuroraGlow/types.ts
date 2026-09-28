/**
 * AuroraGlow 组件类型声明
 */
import type * as React from 'react'
export type AuroraGlowProps =
  & {
    /**
     * 辉光颜色（建议 3-5 个），首尾相接形成 conic 环
     * @default ['#fecdd3', '#ddd6fe', '#bae6fd', '#fbcfe8']
     */
    colors?: string[]
    /**
     * 圆角，px
     * @default 9999（胶囊）
     */
    radius?: number
    /**
     * 辉光向外扩散距离，px
     * @default 4
     */
    spread?: number
    /**
     * 辉光模糊半径，px
     * @default 18
     */
    blur?: number
    /**
     * 辉光不透明度，0-1
     * @default 0.8
     */
    intensity?: number
    /**
     * 颜色绕一圈的毫秒数
     * @default 3000
     */
    durationMs?: number
    /**
     * 是否自动旋转辉光
     * @default true
     */
    animated?: boolean
    /**
     * 是否显示内侧白色柔光圈
     * @default true
     */
    bloom?: boolean
  }
  & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
