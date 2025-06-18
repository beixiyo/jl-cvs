import { memo } from 'react'
import { useTheme } from '@/hooks'
import { cn } from '@/utils'
import styles from './styles.module.scss'

export const Skeleton = memo<SkeletonProps>((props) => {
  const [theme] = useTheme()

  const {
    className,
    style,
    active = true,
    baseColor = theme === 'light'
      ? '#e2e8f0'
      : '#334155',
    highlightColor = theme === 'light'
      ? '#cbd5e1'
      : '#475569',
    animationDuration = 1,
    children,
    ...rest
  } = props

  return (
    <div
      className={ cn(
        'animate-skeleton',
        styles.skeleton,
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
   * @default #e2e2e2
   */
  baseColor?: string
  /**
   * 高亮颜色
   * @default #999999
   */
  highlightColor?: string
  /**
   * 动画持续时间（秒）
   * @default 1
   */
  animationDuration?: number
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>
