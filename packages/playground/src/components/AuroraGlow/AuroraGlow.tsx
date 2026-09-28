'use client'

import { useInsertStyle } from '@/hooks'
import { cn } from '@/utils'
import { memo } from 'react'
import type { AuroraGlowProps } from './types'

/**
 * 注入一次：用 `@property` 让 conic 角度可被平滑动画
 * 这样只让「颜色绕圈」而非旋转元素本身，胶囊等非正方形也不会抖动
 */
const AURORA_STYLE = `
@property --aurora-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@keyframes aurora-spin { to { --aurora-angle: 360deg; } }
`

/** 默认柔和极光色：玫瑰 / 薰衣草 / 天蓝 / 浅粉，贴合设计稿那种轻柔的彩色辉光 */
const DEFAULT_COLORS = ['#fecdd3', '#ddd6fe', '#bae6fd', '#fbcfe8']

/**
 * 辉光容器：在子内容外围渲染一圈柔和、可自动流动的彩色辉光（类似设计稿胶囊按钮的辉光阴影）
 * 与 hover 触发的 BorderGlow 不同，这里**默认自动旋转**，无需鼠标交互
 *
 * @example
 * <AuroraGlow>
 *   <button className="rounded-full bg-white px-5 py-2.5">+ Ask Acme</button>
 * </AuroraGlow>
 */
export const AuroraGlow = memo<AuroraGlowProps>((props) => {
  const {
    children,
    className,
    style,
    colors = DEFAULT_COLORS,
    radius = 9999,
    spread = 4,
    blur = 18,
    intensity = 0.8,
    durationMs = 3000,
    animated = true,
    bloom = true,
    ...rest
  } = props

  useInsertStyle(AURORA_STYLE)

  /** 首尾同色，conic 环无缝衔接 */
  const ringBackground = `conic-gradient(from var(--aurora-angle, 0deg), ${[...colors, colors[0]].join(', ')})`

  return (
    <div
      className={ cn('AuroraGlow relative inline-flex isolate', className) }
      style={ { borderRadius: radius, ...style } }
      { ...rest }
    >
      { /* 彩色辉光环：模糊 + 角度动画（向外扩散到内容之外） */ }
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={ {
          inset: -spread,
          borderRadius: 'inherit',
          background: ringBackground,
          filter: `blur(${blur}px)`,
          opacity: intensity,
          animation: animated
            ? `aurora-spin ${durationMs}ms linear infinite`
            : undefined,
        } }
      />

      { /* 内侧白色柔光，营造明亮的内圈过渡 */ }
      { bloom && (
        <div
          aria-hidden
          className="pointer-events-none absolute bg-white"
          style={ {
            inset: -1,
            borderRadius: 'inherit',
            filter: `blur(${Math.max(blur / 2.5, 4)}px)`,
            opacity: 0.85,
          } }
        />
      ) }

      { /* 内容 */ }
      <div className="relative z-10 w-full" style={ { borderRadius: 'inherit' } }>
        { children }
      </div>
    </div>
  )
})

AuroraGlow.displayName = 'AuroraGlow'
