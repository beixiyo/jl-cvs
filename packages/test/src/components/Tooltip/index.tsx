import { AnimatePresence, motion } from 'framer-motion'
import { memo, useEffect, useRef, useState } from 'react'
import { useTheme } from '@/hooks'
import { cn } from '@/utils/tool'

export const Tooltip = memo<TooltipProps>((props) => {
  const [_theme] = useTheme()

  const {
    children,
    content,
    placement = 'top',
    visible,
    trigger = 'hover',
    disabled = false,
    offset = 8,
    theme = _theme,
    className,
    contentClassName,
    arrow = true,
    formatter,
    delay = 0,
    ...rest
  } = props

  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  /** 控制显示状态 */
  const shouldShow = visible !== undefined
    ? visible
    : isVisible

  /** 计算 tooltip 位置 */
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current)
      return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    let x = 0
    let y = 0

    /** 根据 placement 计算基础位置 */
    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        y = triggerRect.top - tooltipRect.height - offset
        break
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        y = triggerRect.bottom + offset
        break
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
      case 'right':
        x = triggerRect.right + offset
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
    }

    /** 边界检测和调整 */
    if (x < 0)
      x = 8
    if (x + tooltipRect.width > viewport.width)
      x = viewport.width - tooltipRect.width - 8
    if (y < 0)
      y = 8
    if (y + tooltipRect.height > viewport.height)
      y = viewport.height - tooltipRect.height - 8

    setPosition({ x, y })
  }

  /** 显示 tooltip */
  const showTooltip = () => {
    if (disabled)
      return

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    }
    else {
      setIsVisible(true)
    }
  }

  /** 隐藏 tooltip */
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  /** 处理触发事件 */
  const handleMouseEnter = () => {
    if (trigger === 'hover' || trigger === 'focus') {
      showTooltip()
    }
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideTooltip()
    }
  }

  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip()
    }
  }

  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip()
    }
  }

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip()
      }
      else {
        showTooltip()
      }
    }
  }

  /** 更新位置 */
  useEffect(() => {
    if (shouldShow) {
      calculatePosition()

      const handleResize = () => calculatePosition()
      const handleScroll = () => calculatePosition()

      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll, true)

      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [shouldShow, placement, offset])

  /** 清理定时器 */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  /** 获取箭头样式 */
  const getArrowStyle = () => {
    const arrowSize = 6
    const arrowOffset = 12

    switch (placement) {
      case 'top':
        return {
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid ${theme === 'dark'
            ? '#374151'
            : '#ffffff'}`,
        }
      case 'bottom':
        return {
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid ${theme === 'dark'
            ? '#374151'
            : '#ffffff'}`,
        }
      case 'left':
        return {
          right: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize}px solid ${theme === 'dark'
            ? '#374151'
            : '#ffffff'}`,
        }
      case 'right':
        return {
          left: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid ${theme === 'dark'
            ? '#374151'
            : '#ffffff'}`,
        }
      default:
        return {}
    }
  }

  /** 格式化内容 */
  const formattedContent = formatter && typeof content === 'number'
    ? formatter(content)
    : content

  return (
    <>
      {/* 触发元素 */ }
      <div
        ref={ triggerRef }
        className={ cn('inline-block', className) }
        onMouseEnter={ handleMouseEnter }
        onMouseLeave={ handleMouseLeave }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        onClick={ handleClick }
        { ...rest }
      >
        { children }
      </div>

      {/* Tooltip 内容 */ }
      <AnimatePresence>
        { shouldShow && formattedContent && (
          <motion.div
            ref={ tooltipRef }
            initial={ { opacity: 0, scale: 0.8 } }
            animate={ { opacity: 1, scale: 1 } }
            exit={ { opacity: 0, scale: 0.8 } }
            transition={ { duration: 0.15 } }
            className={ cn(
              'fixed z-50 px-2 py-1 text-xs rounded shadow-lg pointer-events-none whitespace-nowrap',
              theme === 'dark'
                ? 'bg-gray-700 text-white border border-gray-600'
                : 'bg-white text-gray-900 border border-gray-200',
              contentClassName,
            ) }
            style={ {
              left: position.x,
              top: position.y,
            } }
          >
            { formattedContent }

            {/* 箭头 */ }
            { arrow && (
              <div
                className="absolute h-0 w-0"
                style={ getArrowStyle() }
              />
            ) }
          </motion.div>
        ) }
      </AnimatePresence>
    </>
  )
})

Tooltip.displayName = 'Tooltip'

/** 类型定义 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TooltipTrigger = 'hover' | 'focus' | 'click'
export type TooltipTheme = 'dark' | 'light'

export type TooltipProps = {
  /**
   * 触发元素
   */
  children: React.ReactNode
  /**
   * Tooltip 内容
   */
  content?: React.ReactNode
  /**
   * 显示位置
   * @default 'top'
   */
  placement?: TooltipPlacement
  /**
   * 是否显示（受控模式）
   */
  visible?: boolean
  /**
   * 触发方式
   * @default 'hover'
   */
  trigger?: TooltipTrigger
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 偏移距离
   * @default 8
   */
  offset?: number
  /**
   * 容器类名
   */
  className?: string
  /**
   * 内容区域类名
   */
  contentClassName?: string
  /**
   * 是否显示箭头
   * @default true
   */
  arrow?: boolean
  /**
   * 主题
   * @default 'dark'
   */
  theme?: TooltipTheme
  /**
   * 内容格式化函数
   */
  formatter?: (value: number) => React.ReactNode
  /**
   * 显示延迟（毫秒）
   * @default 0
   */
  delay?: number
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>
