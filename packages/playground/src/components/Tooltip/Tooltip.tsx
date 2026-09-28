'use client'

import { cn } from '@/utils'
import { motion } from 'motion/react'
import { memo } from 'react'
import { FloatingArrow } from '../FloatingArrow'
import { SafePortal } from '../SafePortal'
import { useTooltip } from './hooks/useTooltip'
import type { TooltipProps } from './types'

export const Tooltip = memo<TooltipProps>((props) => {
  const {
    children,
    content,
    placement,
    visible,
    trigger = 'hover',
    disabled = false,
    offset = 8,
    className,
    contentClassName,
    arrow = true,
    formatter,
    delay = 0,
    autoHideOnResize = false,
    interactive = false,
    escToClose = true,
    ...rest
  } = props

  const {
    shouldShow,
    style,
    arrowProps,
    triggerRef,
    tooltipRef,
    triggerProps,
  } = useTooltip({
    placement,
    visible,
    trigger,
    disabled,
    offset,
    arrow,
    delay,
    autoHideOnResize,
    escToClose,
  })

  /** 格式化内容 */
  const formattedContent = formatter && typeof content === 'number'
    ? formatter(content)
    : content

  /**
   * Tooltip 内容
   * 用显式判空而非真值判断，避免数字 0 / 空字符串等合法内容被吞掉
   */
  const hasContent = formattedContent != null && formattedContent !== ''
  const tooltipContent = shouldShow && hasContent
    ? (
      <motion.div
        ref={ tooltipRef }
        initial={ { opacity: 0, scale: 0.8 } }
        animate={ { opacity: 1, scale: 1 } }
        exit={ { opacity: 0, scale: 0.8 } }
        transition={ { duration: 0.15 } }
        className={ cn(
          'fixed z-tooltip px-3 py-1.5 rounded-lg w-max max-w-[60vw] wrap-break-word text-xs',
          /** 默认不拦截指针事件；interactive 时允许浮层内交互（点击链接/按钮等） */
          interactive
            ? 'pointer-events-auto'
            : 'pointer-events-none',
          /** 深色模式黑底、浅色模式白底，自动跟随主题 */
          'bg-background text-text',
          /**
           * Tooltip 内容盒仅 24px 高，drop-shadow-card 的 48px 模糊会把阴影摊到几乎不可见，
           * 这里改用贴合小浮层尺度的紧凑投影；用 filter 而非 box-shadow，
           * 才能让子级的 FloatingArrow 一起获得连续阴影
           */
          'drop-shadow-[0_2px_6px_rgb(0_0_0/0.18)]',
          contentClassName,
        ) }
        style={ style }
      >
        { formattedContent }

        { /* 与其他浮层共用同一套尖角绘制和接缝处理 */ }
        { arrowProps && <FloatingArrow { ...arrowProps } /> }
      </motion.div>
    )
    : null

  return (
    <>
      { /* 触发元素 */ }
      <div
        ref={ triggerRef }
        className={ cn('inline-block', className) }
        { ...triggerProps }
        { ...rest }
      >
        { children }
      </div>

      { /* 使用 Portal 渲染到 body，避免定位和层级问题 */ }
      <SafePortal>
        { tooltipContent }
      </SafePortal>
    </>
  )
})

Tooltip.displayName = 'Tooltip'

/** 类型定义 */
