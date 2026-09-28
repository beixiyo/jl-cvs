'use client'

import { cn } from '@/utils'
import { colorAddOpacity } from '@jl-org/tool'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { Card3DProps } from '../types'
import { GlowBorder } from './GlowBorder'

export const Card3D = memo(({
  children,
  className,
  enable3D = true,
  perspective = 800,
  xRotateRange = [-15, 15],
  yRotateRange = [-15, 15],
  transitionSpeed = 0.3,
  style,
  shadowColor,
  // --- Border Props ---
  enableBorder = true,
  borderSize = 2,
  gradientColors = ['#f0f', '#0ff', '#ff0'],
  animationDuration = '4s',
  disableOnMobile = true,
  intensity = 1,
  // --- ---
  ...rest
}: Card3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const timerIdsRef = useRef<number[]>([])

  const clearTimers = () => {
    timerIdsRef.current.forEach((id) => clearTimeout(id))
    timerIdsRef.current = []
  }

  const [{ rotateX, rotateY }, setRotation] = useState({ rotateX: 0, rotateY: 0 })
  const [_isHovered, setIsHovered] = useState(false)
  const [isInnerHovered, setIsInnerHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  /** 卸载时清理所有 timer */
  useEffect(() => {
    return clearTimers
  }, [])

  /** 检查是否为移动设备 */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  /** 根据是否为移动设备和用户设置决定是否启用3D效果 */
  const shouldEnable3D = enable3D && !(disableOnMobile && isMobile)

  // --- Event Handlers ---
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldEnable3D || !cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const [minRotateX, maxRotateX] = xRotateRange
    const [minRotateY, maxRotateY] = yRotateRange

    // Normalized mouse position (0 to 1)
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Calculate rotation: map mouse position (0-1) across the full range, centered
    // (y: 0 -> maxRotateX, y: 1 -> minRotateX)
    // (x: 0 -> minRotateY, x: 1 -> maxRotateY)
    const targetRotateX = (((maxRotateX + minRotateX) / 2) - (y - 0.5) * (maxRotateX - minRotateX)) * intensity
    const targetRotateY = (((minRotateY + maxRotateY) / 2) + (x - 0.5) * (maxRotateY - minRotateY)) * intensity

    setRotation({ rotateX: targetRotateX, rotateY: targetRotateY })
  }, [shouldEnable3D, xRotateRange, yRotateRange, intensity])

  const handleMouseLeave = useCallback(() => {
    if (!shouldEnable3D) return

    clearTimers()
    setIsHovered(false)
    setIsAnimating(true)
    setRotation({ rotateX: 0, rotateY: 0 })

    const id = window.setTimeout(() => setIsAnimating(false), transitionSpeed * 1000)
    timerIdsRef.current.push(id)
  }, [shouldEnable3D, transitionSpeed])

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldEnable3D) return

    clearTimers()
    setIsHovered(true)
    setIsAnimating(true)

    const id1 = window.setTimeout(() => setIsAnimating(false), transitionSpeed * 1000)
    const id2 = window.setTimeout(() => {
      if (cardRef.current) {
        handleMouseMove(e)
      }
    }, 50)
    timerIdsRef.current.push(id1, id2)
  }, [shouldEnable3D, transitionSpeed, handleMouseMove])

  const getBoxShadow = useCallback(() =>
    shadowColor && isInnerHovered
      ? `
      0 0 10px ${colorAddOpacity(shadowColor, 0.6)},
      0 0 20px ${colorAddOpacity(shadowColor, 0.3)},
      0 0 30px ${colorAddOpacity(shadowColor, 0.1)},
      0 0 5px ${shadowColor}
    `
      : undefined, [shadowColor, isInnerHovered])

  /** 渲染内容 */
  const renderContent = () => (
    <div
      className="relative z-2 overflow-hidden"
      style={ {
        transformStyle: 'preserve-3d',
        height: '100%',
        borderRadius: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        /** 添加以下属性以优化文字渲染 */
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      } }
    >
      { children }
    </div>
  )

  return (
    <div
      className={ cn(
        'relative h-full',
      ) }
      style={ style }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
      { ...rest }
    >
      <div
        ref={ cardRef }
        className={ className }
        style={ {
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          height: '100%',
          boxShadow: getBoxShadow(),
          willChange: shouldEnable3D
            ? 'transform'
            : undefined,
          perspective: shouldEnable3D
            ? `${perspective}px`
            : undefined,
          transform: shouldEnable3D
            ? `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
            : 'none',
          transition: `all ${transitionSpeed}s ${
            isAnimating
              ? 'cubic-bezier(0.23, 1, 0.32, 1)'
              : 'ease-out'
          }`,
          transformStyle: shouldEnable3D
            ? 'preserve-3d'
            : undefined,
        } }
        onMouseMove={ handleMouseMove }
        onMouseEnter={ () => setIsInnerHovered(true) }
        onMouseLeave={ () => setIsInnerHovered(false) }
      >
        { enableBorder
          ? (
            <GlowBorder
              borderSize={ borderSize }
              gradientColors={ gradientColors }
              animationDuration={ animationDuration }
              className="h-full"
            >
              { renderContent() }
            </GlowBorder>
          )
          : renderContent() }
      </div>
    </div>
  )
})

Card3D.displayName = 'Card3D'
