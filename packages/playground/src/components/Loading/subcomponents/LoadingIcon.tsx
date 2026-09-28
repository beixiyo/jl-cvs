import { useStable } from '@/hooks'
import { cn } from '@/utils'
import { isObj, isStr } from '@jl-org/tool'
import type { CSSProperties } from 'react'
import { memo, useEffect, useRef } from 'react'
import type { GradientOptions, LoadingIconProps, RingOptions } from '../types'

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
}

const SPIN_KEYFRAMES: Keyframe[] = [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' },
]

const DEFAULT_ANIMATION: KeyframeAnimationOptions = {
  duration: 800,
  iterations: Infinity,
  easing: 'linear',
}

/**
 * 渐变环的形状遮罩
 *
 * conic 渐变负责颜色，SVG 圆弧负责形状：
 * - `stroke-linecap="round"` 让两端成为圆头，颜色取自它盖住的那段渐变，不是叠加上去的色块
 * - `stroke-dasharray` 留出的缺口正对 conic 渐变 0°/360° 的接缝，接缝的直角断口被挖掉
 *
 * @param size 图标尺寸
 * @param thickness 环宽
 */
function getGradientMask(size: number, thickness: number) {
  const center = size / 2
  const radius = (size - thickness) / 2
  const perimeter = 2 * Math.PI * radius

  /** 缺口弧长取两倍环宽：两端各占半个圆头后，恰好留出一个环宽的空隙 */
  const gap = Math.min(thickness * 2, perimeter / 4)
  const dash = perimeter - gap
  /** 缺口以正上方为中心，渐变最淡与最浓的两端各落在缺口一侧 */
  const startDeg = -90 + (gap / perimeter) * 180

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`
    + `<circle cx="${center}" cy="${center}" r="${radius.toFixed(3)}" fill="none" stroke="#000"`
    + ` stroke-width="${thickness}" stroke-linecap="round"`
    + ` stroke-dasharray="${dash.toFixed(3)} ${gap.toFixed(3)}"`
    + ` transform="rotate(${startDeg.toFixed(3)} ${center} ${center})" /></svg>`

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") center / 100% 100% no-repeat`
}

export const LoadingIcon = memo<LoadingIconProps>((
  {
    style,
    className,
    size = 'md',
    thickness,
    ring,
    gradient,
    animation,
  },
) => {
  const spinnerRef = useRef<HTMLDivElement>(null)
  /** 稳定引用，避免调用方传对象字面量时反复重建动画 */
  const stableAnimation = useStable(animation)

  const resolved = isStr(size)
    ? sizeMap[size]
    : size
  const resolvedThickness = thickness ?? Math.max(2, Math.round(resolved / 10))

  /** 默认渲染渐变环，只有显式传 ring 或 gradient={ false } 才退回单色环 */
  const isGradient = !ring && gradient !== false
  const ringOpts: RingOptions = isObj(ring)
    ? ring
    : {}
  const gradientOpts: GradientOptions = isObj(gradient)
    ? gradient
    : {}

  const {
    color = 'rgb(var(--text) / 0.5)',
    trackColor = 'rgb(var(--text) / 0.12)',
  } = ringOpts
  const {
    from = 'transparent',
    to = 'rgb(var(--text) / 0.8)',
  } = gradientOpts

  const gradientMask = isGradient
    ? getGradientMask(resolved, resolvedThickness)
    : ''

  const shapeStyle: CSSProperties = isGradient
    ? {
      background: `conic-gradient(from 0deg, ${from} 0deg, ${to} 360deg)`,
      mask: gradientMask,
      WebkitMask: gradientMask,
    }
    : {
      border: `${resolvedThickness}px solid ${trackColor}`,
      borderTopColor: color,
    }

  useEffect(() => {
    const el = spinnerRef.current
    if (!el) return

    const spin = el.animate(SPIN_KEYFRAMES, {
      ...DEFAULT_ANIMATION,
      ...stableAnimation,
    })

    return () => {
      spin.cancel()
    }
  }, [stableAnimation])

  return (
    <div
      ref={ spinnerRef }
      className={ cn(
        'LoadingIconContainer rounded-full shrink-0',
        className,
      ) }
      style={ {
        width: resolved,
        height: resolved,
        ...shapeStyle,
        ...style,
      } }
    />
  )
})

LoadingIcon.displayName = 'LoadingIcon'
