import type { Theme } from '@jl-org/tool'
import type { CSSProperties } from 'react'
import { memo, useMemo } from 'react'
import { useTheme } from '@/hooks'
import { cn, toggleThemeWithTransition } from '@/utils'

export type ThemeToggleProps = {
  /**
   * 当前的主题，用于决定显示太阳还是月亮
   */
  theme?: Theme
  /**
   * 切换器的宽度，高度会根据比例自动计算
   * @default 80
   */
  size?: number
  /**
   * 点击事件的回调，通常用于触发主题切换逻辑
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  /**
   * 自定义容器的 className
   */
  className?: string
}

// --- 数据部分保持不变 ---
const starsData = [
  { x: '18%', y: 20, r1: 6, r2: 7 },
  { x: '35%', y: 45, r1: 1, r2: 2 },
  { x: '10%', y: 70, r1: 2.5, r2: 3.5 },
  { x: '25%', y: 15, r1: 3, r2: 4 },
  { x: '15%', y: 50, r1: 1.5, r2: 2.5 },
  { x: '30%', y: 75, r1: 5, r2: 6 },
  { x: '5%', y: 30, r1: 0.5, r2: 1.5 },
  { x: '25%', y: 60, r1: 0.5, r2: 1.5 },
  { x: '7%', y: 35, r1: 0.5, r2: 1.5 },
]
const cloudShadowsData = [
  { x: 10, y: 60, s: 10, c: '#fff' },
  { x: 65, y: 60, s: 5, c: '#fff' },
  { x: 95, y: 70, s: 10, c: '#fff' },
  { x: 135, y: 45, s: 5, c: '#fff' },
  { x: 170, y: 35, s: 10, c: '#fff' },
  { x: 195, y: -5, s: 10, c: '#fff' },
  { x: -10, y: 0, s: 50, c: 'rgba(255, 255, 255, 0.2)' },
  { x: 15, y: 0, s: 50, c: 'rgba(255, 255, 255, 0.15)' },
  { x: 40, y: 0, s: 50, c: 'rgba(255, 255, 255, 0.21)' },
  { x: 10, y: 40, s: 10, c: '#abc1d9' },
  { x: 70, y: 35, s: 10, c: '#abc1d9' },
  { x: 95, y: 40, s: 10, c: '#abc1d9' },
  { x: 135, y: 20, s: 10, c: '#abc1d9' },
  { x: 155, y: 15, s: 10, c: '#abc1d9' },
  { x: 190, y: -20, s: 10, c: '#abc1d9' },
]

export const ThemeToggle = memo<ThemeToggleProps>((props) => {
  const [_theme, setTheme] = useTheme()
  const { theme = _theme, size = 80, onClick, className } = props
  const handleToggle = toggleThemeWithTransition(theme, setTheme)

  const isDark = theme === 'dark'

  // --- 尺寸计算部分保持不变 ---
  const baseWidth = 220
  const scaleFactor = size / baseWidth
  const width = size
  const height = (width * 90) / baseWidth
  const borderRadius = height
  const circleInset = height / 12
  const circleSize = height - circleInset * 2
  const translateX = width - height

  // --- useMemo 计算部分保持不变 ---
  const { scaledStarsBackground, scaledCloudsShadow, scaledCloudsShadowHidden } = useMemo(() => {
    const format = (n: number): number => Number.parseFloat(n.toFixed(2))
    const scaledStars = starsData.map(star => `radial-gradient(circle at ${star.x} ${format(star.y * scaleFactor)}px, #fff, #fff ${format(star.r1 * scaleFactor)}px, transparent ${format(star.r2 * scaleFactor)}px)`).join(', ')
    const finalStarsBg = `${scaledStars}, linear-gradient(90deg, #2b303e, #2b303e 50%, #5a81b4 50%, #5a81b4)`
    const generateCloudShadow = (colorTransformer: (c: string) => string) => cloudShadowsData.map(shadow => `${format(shadow.x * scaleFactor)}px ${format(shadow.y * scaleFactor)}px 0 ${format(shadow.s * scaleFactor)}px ${colorTransformer(shadow.c)}`).join(', ')
    const finalCloudsShadow = generateCloudShadow(c => c)
    const finalCloudsShadowHidden = generateCloudShadow(() => 'transparent')
    return { scaledStarsBackground: finalStarsBg, scaledCloudsShadow: finalCloudsShadow, scaledCloudsShadowHidden: finalCloudsShadowHidden }
  }, [scaleFactor])

  // --- 动画与样式定义 ---
  const transitionDuration = '0.5s'
  const transitionTimingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)'

  const moonCraters = `
    radial-gradient(circle at 50% 20%, #939aa5, #939aa5 6.5px, transparent 7px),
    radial-gradient(circle at 35% 45%, #939aa5, #939aa5 11.5px, transparent 12px),
    radial-gradient(circle at 72% 50%, #939aa5, #939aa5 8.5px, transparent 9px),
    radial-gradient(#cbcdda, #cbcdda)
  `
  const sunShadow = '0 0 5px #333, inset 2px 2px 3px #f8f4e4, inset -2px -2px 3px #665613'

  const containerStyle: CSSProperties = {
    width,
    height,
    borderRadius,
    background: scaledStarsBackground,
    backgroundSize: '200% 100%',
    boxShadow: '0 -3px 4px #999, inset 0 3px 5px #333, 0 4px 4px #ffe, inset 0 -3px 5px #ddd',
    /** 背景定位：深色模式时，背景在 0% (显示星空)；浅色模式时，在 100% (显示蓝天)。 */
    backgroundPosition: isDark
      ? '0% 0%'
      : '100% 0%',
    transition: `background-position ${transitionDuration} ${transitionTimingFunction}`,
  }

  const cloudsStyle: CSSProperties = {
    position: 'absolute',
    width: `${(70 * scaleFactor).toFixed(2)}px`,
    height: `${(70 * scaleFactor).toFixed(2)}px`,
    top: `${(10 * scaleFactor).toFixed(2)}px`,
    left: `${(10 * scaleFactor).toFixed(2)}px`,
    borderRadius: '50%',
    /** 云朵阴影：深色模式时隐藏，浅色模式时显示。 */
    boxShadow: isDark
      ? scaledCloudsShadowHidden
      : scaledCloudsShadow,
    /** 云朵移动：深色模式时移动到右侧，浅色模式时在左侧。 */
    transform: `translateX(${isDark
      ? translateX
      : 0}px)`,
    transition: `transform ${transitionDuration} ${transitionTimingFunction}, box-shadow ${transitionDuration} ${transitionTimingFunction}`,
  }

  const sliderTrackStyle: CSSProperties = {
    position: 'absolute',
    zIndex: 1,
    width: circleSize,
    height: circleSize,
    top: circleInset,
    left: circleInset,
    /** 滑块移动：深色模式时移动到右侧，浅色模式时在左侧。 */
    transform: `translateX(${isDark
      ? translateX
      : 0}px)`,
    transition: `transform ${transitionDuration} ${transitionTimingFunction}`,
  }

  const sunAndMoonBaseStyle: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    transition: `opacity ${transitionDuration} ${transitionTimingFunction}`,
  }

  const sunStyle: CSSProperties = {
    ...sunAndMoonBaseStyle,
    background: '#e9cb50',
    boxShadow: sunShadow,
    /** 太阳可见性：深色模式时隐藏 (opacity: 0)，浅色模式时可见 (opacity: 1)。 */
    opacity: isDark
      ? 0
      : 1,
  }

  const moonStyle: CSSProperties = {
    ...sunAndMoonBaseStyle,
    background: moonCraters,
    boxShadow: sunShadow,
    /** 月亮可见性：深色模式时可见 (opacity: 1)，浅色模式时隐藏 (opacity: 0)。 */
    opacity: isDark
      ? 1
      : 0,
  }

  return (
    <div
      className={ cn('relative shrink-0 m-auto cursor-pointer overflow-hidden', className) }
      style={ containerStyle }
      onClick={ (e) => {
        handleToggle(e)
        onClick?.(e)
      } }
      aria-label={ isDark
        ? '切换到浅色模式'
        : '切换到深色模式' }
    >
      <div style={ cloudsStyle } />
      <div style={ sliderTrackStyle }>
        <div style={ sunStyle } />
        <div style={ moonStyle } />
      </div>
    </div>
  )
})

ThemeToggle.displayName = 'ThemeToggle'
