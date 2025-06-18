import { useElBounding } from '@/hooks'
import { primaryColor } from '@/styles/variable'
import { cn } from '@/utils'
import { memo, useEffect, useState } from 'react'

export const Border = memo((props: BorderProps) => {
  const {
    dashLength = 10,
    dashGap = 12,
    strokeColor = '#bbb',
    hoverStrokeColor = primaryColor,
    strokeWidth = 2,
    animated = true,
    enterAnimate = true,
    animationSpeed = 50,
    borderRadius = 20,
    className,
    children,
    style,
  } = props

  const [dashOffset, setDashOffset] = useState(0)
  const [isEnter, setIsEnter] = useState(false)
  const elRef = useRef<HTMLDivElement>(null)
  const elBounds = useElBounding(elRef)

  /** 处理流动动画 */
  useEffect(() => {
    if (!animated)
      return
    if (enterAnimate && !isEnter)
      return

    const interval = setInterval(() => {
      setDashOffset(prev => (prev + 1))
    }, animationSpeed)

    return () => clearInterval(interval)
  }, [animated, animationSpeed, dashLength, dashGap, enterAnimate, isEnter])

  return (
    <div
      ref={ elRef }
      className={ cn('relative w-full h-full') }
      onMouseEnter={ () => setIsEnter(true) }
      onMouseMove={ () => setIsEnter(true) }
      onMouseLeave={ () => setIsEnter(false) }
      onMouseOut={ () => setIsEnter(false) }
      style={ style }
    >
      {/* SVG边框 */ }
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={ strokeWidth / 2 }
          y={ strokeWidth / 2 }
          width={ Math.max(0, elBounds.width - strokeWidth) }
          height={ Math.max(0, elBounds.height - strokeWidth) }
          rx={ borderRadius }
          ry={ borderRadius }
          fill="none"
          stroke={
            isEnter
              ? hoverStrokeColor
              : strokeColor
          }
          strokeWidth={ strokeWidth }
          strokeDasharray={ `${dashLength},${dashGap}` }
          strokeDashoffset={ animated
            ? dashOffset
            : 0 }
          className="transition-all duration-300"
        />
      </svg>

      {/* 内容区域 */ }
      <div
        className={ cn('h-full w-full', className) }
        style={ {
          padding: `${strokeWidth}px`,
          borderRadius: `${borderRadius}px`,
        } }
      >
        { children }
      </div>
    </div>
  )
})

Border.displayName = 'Border'

export type BorderProps = {
  /**
   * 虚线段的长度
   * @default 10
   */
  dashLength?: number
  /**
   * 虚线段之间的间距
   * @default 12
   */
  dashGap?: number
  /**
   * 边框颜色
   * @default '#bbb'
   */
  strokeColor?: string
  /**
   * 边框颜色（鼠标悬停）
   * @default '#f30'
   */
  hoverStrokeColor?: string
  /**
   * 边框宽度
   * @default 2
   */
  strokeWidth?: number
  /**
   * 是否启用流动动画
   * @default true
   */
  animated?: boolean
  /**
   * 鼠标进入时才触发动画
   * @default true
   */
  enterAnimate?: boolean
  /**
   * 动画速度（毫秒）
   * @default 50
   */
  animationSpeed?: number
  /**
   * 边框圆角半径
   * @default 20
   */
  borderRadius?: number
}
& React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLDivElement>, HTMLDivElement>
