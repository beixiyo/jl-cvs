import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { badgeVariants } from './styles'

/**
 * Badge 组件属性
 *
 * - 默认（附着）模式：包住触发元素，在角上展示 count / content / 圆点
 * - `standalone`：仅渲染徽章胶囊，`children` 为文案（用于促销条、标签等）
 */
export type BadgeProps =
  & Omit<HTMLAttributes<HTMLDivElement>, 'content'>
  & VariantProps<typeof badgeVariants>
  & {
    /**
     * 颜色变体
     * @default 'default'
     */
    variant?: VariantProps<typeof badgeVariants>['variant']
    /**
     * 尺寸
     * @default 'md'
     */
    size?: VariantProps<typeof badgeVariants>['size']
    /**
     * 显示的数字（附着模式）
     */
    count?: number
    /**
     * 是否显示为点（附着模式）
     */
    dot?: boolean
    /**
     * 最大显示数字
     * @default 99
     */
    maxCount?: number
    /**
     * 是否显示零
     * @default false
     */
    showZero?: boolean
    /**
     * 角标自定义节点（附着模式，与 count 二选一展示）
     */
    content?: ReactNode
    /**
     * 附着模式下仅作用于内侧角标容器；`standalone` 时与 `className` 合并到同一节点
     * 默认以自身中心对齐 children 的右上角，可通过定位和 transform 类覆盖
     */
    badgeClassName?: string
    /**
     * 附着模式下作用于内侧角标容器；`standalone` 时等同于根节点 `style`
     */
    badgeStyle?: CSSProperties
  }
