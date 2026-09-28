import type { BaseType } from '@jl-org/tool'
import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type * as React from 'react'

export type IconProps =
  & {
    iconClass?: string
    iconStyle?: React.CSSProperties

    /**
     * 是否需要包裹一个容器
     * @default true
     */
    needContainer?: boolean

    /**
     * 使用 lucide-react 的组件
     */
    icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

    src?: string
    width?: BaseType
    height?: BaseType
    /**
     * 同时指定 width 和 height
     * 或者是 icon-font 的 font-size
     */
    size?: BaseType

    iconfont?: string
    asChild?: boolean
  }
  & Omit<LucideProps, 'ref'>
  & RefAttributes<SVGSVGElement>
  & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
