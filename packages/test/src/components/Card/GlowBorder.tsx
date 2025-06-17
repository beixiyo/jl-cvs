import { cn } from '@/utils'
import { memo, useEffect, useRef, useState } from 'react'

export const GlowBorder = memo(({
  className,
  children,
  borderSize = 2,
  gradientColors = ['#f0f', '#0ff', '#ff0'],
  animationDuration = '4s',
  ...rest
}: GlowBorderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [glowSize, setGlowSize] = useState(0)

  useEffect(() => {
    if (!containerRef.current)
      return

    const updateSize = () => {
      const el = containerRef.current
      if (!el)
        return

      const { width, height } = el.getBoundingClientRect()
      const maxSize = Math.max(width, height)
      setGlowSize(maxSize * 1.3)
    }

    /** 初始化尺寸 */
    updateSize()

    /** 监听容器尺寸变化 */
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      ref={ containerRef }
      className={ cn('relative overflow-hidden', className) }
      style={ { padding: borderSize } }
      { ...rest }
    >
      {/* 发光边框元素 */}
      {glowSize > 0 && (
        <div
          style={ {
            width: glowSize,
            height: glowSize,
            background: `conic-gradient(from 0deg, ${gradientColors.join(', ')}, ${gradientColors[0]})`,
            translate: '-50% -50%',
            animationDuration,
          } }
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 animate-spin"
        />
      )}

      {/* 内容容器 */}
      <div
        className="relative z-2 h-full w-full overflow-hidden"
        style={ {
          borderRadius: 'inherit',
        } }
      >
        {children}
      </div>
    </div>
  )
})

GlowBorder.displayName = 'GlowBorder'

export type GlowBorderProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  /** 子元素 */
  children: React.ReactNode
  /** 边框大小 */
  borderSize?: number
  /** 渐变边框颜色 */
  gradientColors?: string[]
  /** 边框动画持续时间 */
  animationDuration?: string
}
