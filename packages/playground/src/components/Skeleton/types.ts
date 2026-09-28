import type { MotionProps } from 'motion/react'

/**
 * 骨架屏卡片组件的属性类型
 */
export type SkeletonCardProps = {
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 动画延迟时间（秒） */
  delay?: number
  /** 是否显示标题骨架 */
  showTitle?: boolean
  /** 是否显示内容骨架 */
  showContent?: boolean
  /** 是否显示标签骨架 */
  showTags?: boolean
  /** 标题骨架宽度 */
  titleWidth?: string
  /** 内容行数 */
  contentLines?: number
  /** 标签数量 */
  tagCount?: number
} & MotionProps
