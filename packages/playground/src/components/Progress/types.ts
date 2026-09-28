/**
 * Progress 类型声明
 */

import type { CSSProperties, ReactNode } from 'react'
export type ProgressBarProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  /**
   * Progress value between 0 and 1
   */
  value: number
  /**
   * 渐变颜色数组，支持多个颜色
   * @default ['rgb(var(--brand) / 0.1)', 'rgb(var(--brand) / 1)']
   */
  colors?: string[]
  /**
   * 进度条高度
   * @default 5
   */
  height?: number
  /**
   * 是否启用动画
   * @default true
   */
  animated?: boolean
  /**
   * 动画持续时间（秒）
   * @default 0.8
   */
  animationDuration?: number
  /**
   * 动画缓动函数
   * @default 'easeOut'
   */
  animationEase?: string
}

export type FakeProgressProps = {
  className?: string
  style?: CSSProperties
  children?: ReactNode

  done?: boolean
  onChange?: (val: number) => void

  showText?: boolean
  showBar?: boolean
  onlyProgressBar?: boolean
  /**
   * 自定义提示文案，覆盖默认的等待提示
   * @default 'Estimated 2 minutes, please wait patiently... '
   */
  text?: ReactNode
  /**
   * 渐变颜色数组，支持多个颜色
   * @default ['rgb(var(--brand) / 0.1)', 'rgb(var(--brand) / 1)']
   */
  colors?: string[]

  /**
   * 唯一 ID，保持持久化进度用的
   */
  uniqueKey?: string
}

export type FakeProgressRef = {
  /** 获取当前进度值 (0-1) */
  getProgress: () => number
  /** 设置进度值 (0-1) */
  setProgress: (value: number) => void
  /** 开始进度 */
  start: () => void
  /** 停止进度 */
  stop: () => void
  /** 完成进度 */
  end: () => void
  /** 清除进度 */
  clear: () => void
}
