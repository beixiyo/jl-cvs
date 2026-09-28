import { cn } from '@/utils'
import { memo } from 'react'
import type { Size } from '../../types'
import styles from './styles.module.scss'

export const Skeleton = memo<SkeletonProps>((props) => {
  const {
    className,
    style,
    active = true,
    /** 使用设计 token，自适应明暗主题 */
    baseColor = 'rgb(var(--skeletonBase) / 1)',
    highlightColor = 'rgb(var(--skeletonHighlight) / 1)',
    animationDuration = 1,
    rounded = false,
    size,
    children,
    ...rest
  } = props

  /** 预设尺寸样式 */
  const sizeClasses = {
    xs: 'h-3 w-16',
    sm: 'h-4 w-24',
    md: 'h-5 w-32',
    lg: 'h-6 w-48',
    xl: 'h-8 w-64',
    full: 'h-full w-full',
  }

  /** 获取尺寸相关的样式 */
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      return {
        className: undefined,
        style: {
          height: `${size}px`,
          width: `${size * 4}px`, // 默认宽度是高度的 4 倍
        },
      }
    }
    if (size === 'full') {
      return {
        className: sizeClasses.full,
        style: undefined,
      }
    }
    return {
      className: size
        ? sizeClasses[size]
        : undefined,
      style: undefined,
    }
  }

  const sizeStyles = getSizeStyles()

  return (
    <div
      className={ cn(
        styles.skeleton,
        rounded && 'rounded-full',
        sizeStyles.className,
        className,
      ) }
      style={ {
        ...(active && {
          backgroundSize: '400%',
          backgroundImage: `linear-gradient(to right,
            ${baseColor} 0, ${baseColor} 30%,
            ${highlightColor} 45%, ${highlightColor} 50%,
            ${baseColor} 60%, ${baseColor})`,
          animationDuration: `${animationDuration}s`,
        }),
        ...sizeStyles.style,
        ...style,
      } }
      { ...rest }
    >
      { children }
    </div>
  )
})

export type SkeletonProps = {
  className?: string
  style?: React.CSSProperties
  /**
   * 是否激活
   * @default true
   */
  active?: boolean
  /**
   * 基础颜色
   * @default 根据主题自动设置
   */
  baseColor?: string
  /**
   * 高亮颜色
   * @default 根据主题自动设置
   */
  highlightColor?: string
  /**
   * 动画持续时间（秒）
   * @default 1
   */
  animationDuration?: number
  /**
   * 是否圆角
   * @default false
   */
  rounded?: boolean
  /**
   * 预设尺寸
   */
  size?: 'xs' | Size | 'xl' | 'full'
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>
