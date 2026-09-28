import { clamp } from '@jl-org/tool'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import { useLatestCallback } from '../../memo'
import { useResizeObserver } from '../../ob'
import { buildPlacement, calcCoords, calcOverflow, oppositeSide, parsePlacement } from './geometry'
import { getScrollParents } from './getScrollParents'
import type { FloatingPlacement, UseFloatingPositionOptions, UseFloatingPositionReturn } from './types'

/**
 * 通用浮层定位 Hook：基于 reference/floating 的 DOMRect 计算 x/y，
 * 支持翻面（flip）、贴边（shift/clamp）以及 scroll/resize 自动更新
 * 支持虚拟 reference（`virtualReferenceRect` / `getVirtualReferenceRect`，如鼠标、选区）
 */
export function useFloatingPosition(
  referenceRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  options: UseFloatingPositionOptions = {},
): UseFloatingPositionReturn {
  const {
    enabled = true,
    placement = 'bottom',
    offset = 8,
    boundaryPadding = 8,
    flip = true,
    shift = true,
    autoUpdate = true,
    scrollCapture = true,
    strategy: strategyOption = 'fixed',
    scrollContainers,
    virtualReferenceRect,
    getVirtualReferenceRect,
    containerRef,
  } = options

  const canUseDOM = typeof document !== 'undefined'
  /** 跟随滚动模式：以 containerRef 为定位上下文，浮层随容器内滚动一起移动 */
  const containerEl = containerRef?.current
  const followScroll = Boolean(canUseDOM && containerEl && containerEl !== document.body)
  const strategy = followScroll
    ? 'absolute'
    : strategyOption

  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)
  const [resolvedPlacement, setResolvedPlacement] = useState<FloatingPlacement>(placement)

  const update = useLatestCallback(() => {
    if (!enabled) {
      setCoords((prev) =>
        prev === null
          ? prev
          : null
      )
      setResolvedPlacement((prev) =>
        prev === placement
          ? prev
          : placement
      )
      return
    }

    const floatingEl = floatingRef.current
    if (!floatingEl) {
      setCoords(null)
      setResolvedPlacement(placement)
      return
    }

    /** 获取参考元素的矩形区域：动态 getter > 静态虚拟矩形 > DOM ref */
    let referenceRect: DOMRect
    if (getVirtualReferenceRect) {
      const r = getVirtualReferenceRect()
      if (!r) {
        setCoords(null)
        setResolvedPlacement(placement)
        return
      }
      referenceRect = r
    }
    else if (virtualReferenceRect) {
      referenceRect = virtualReferenceRect
    }
    else {
      const referenceEl = referenceRef.current
      if (!referenceEl) {
        setCoords(null)
        setResolvedPlacement(placement)
        return
      }
      referenceRect = referenceEl.getBoundingClientRect()
    }

    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight
    let viewportOffsetX = 0
    let viewportOffsetY = 0
    if (followScroll && containerEl) {
      const containerRect = containerEl.getBoundingClientRect()
      viewportWidth = containerEl.clientWidth
      viewportHeight = containerEl.clientHeight
      viewportOffsetX = containerEl.scrollLeft
      viewportOffsetY = containerEl.scrollTop
      /**
       * 将 referenceRect 从视口坐标转换为容器内容坐标
       * - getBoundingClientRect() 得到的是元素在视口中的可视位置
       * - position:absolute 需要的是相对容器 padding box 的内容坐标
       */
      referenceRect = new DOMRect(
        (referenceRect.left - containerRect.left) + containerEl.scrollLeft - containerEl.clientLeft,
        (referenceRect.top - containerRect.top) + containerEl.scrollTop - containerEl.clientTop,
        referenceRect.width,
        referenceRect.height,
      )
    }

    const floatingRect = floatingEl.getBoundingClientRect()
    /**
     * 注意：getBoundingClientRect 会受 transform/scale 动画影响（例如 Tooltip/Popover 的 scale 动画），
     * 可能导致测量到的尺寸随动画帧变化，产生位移抖动
     * 这里优先使用 offsetWidth/offsetHeight：它们是布局尺寸，不受 transform 影响，
     * 也不会像 scrollWidth/scrollHeight 那样把向右、向下溢出的绝对定位子元素
     * （例如浮层箭头）算进盒子尺寸，否则 top/left 方向的浮层会被多推开一段箭头高度
     */
    const floatingWidth = floatingEl.offsetWidth || floatingRect.width
    const floatingHeight = floatingEl.offsetHeight || floatingRect.height

    const floatingBox = {
      top: floatingRect.top,
      left: floatingRect.left,
      bottom: floatingRect.bottom,
      right: floatingRect.right,
      width: floatingWidth,
      height: floatingHeight,
    }

    const preferred = placement
    const preferredMeta = parsePlacement(preferred)
    const opposite = buildPlacement(oppositeSide(preferredMeta.side), preferredMeta.align)

    const preferredCoords = calcCoords(referenceRect, floatingBox, preferred, offset)
    const preferredOverflow = calcOverflow(
      preferredCoords.x - viewportOffsetX,
      preferredCoords.y - viewportOffsetY,
      floatingBox,
      viewportWidth,
      viewportHeight,
      boundaryPadding,
    )

    let bestPlacement = preferred
    let bestCoords = preferredCoords
    let bestOverflow = preferredOverflow

    if (flip) {
      const oppositeCoords = calcCoords(referenceRect, floatingBox, opposite, offset)
      const oppositeOverflow = calcOverflow(
        oppositeCoords.x - viewportOffsetX,
        oppositeCoords.y - viewportOffsetY,
        floatingBox,
        viewportWidth,
        viewportHeight,
        boundaryPadding,
      )

      if (oppositeOverflow.total < preferredOverflow.total) {
        bestPlacement = opposite
        bestCoords = oppositeCoords
        bestOverflow = oppositeOverflow
      }
    }

    let x = bestCoords.x
    let y = bestCoords.y

    if (shift && bestOverflow.total > 0) {
      /** 计算最大可用空间 */
      const maxAvailableWidth = viewportWidth - 2 * boundaryPadding
      const maxAvailableHeight = viewportHeight - 2 * boundaryPadding

      const minX = viewportOffsetX + boundaryPadding
      const minY = viewportOffsetY + boundaryPadding

      /** 如果浮层尺寸大于视口可用空间，确保至少有最小可见区域 */
      if (floatingBox.width > maxAvailableWidth) {
        /** 确保左侧至少有边界填充的区域可见 */
        x = Math.max(minX, x)
      }
      else {
        const maxX = Math.max(minX, viewportOffsetX + viewportWidth - floatingBox.width - boundaryPadding)
        x = clamp(x, minX, maxX)
      }

      if (floatingBox.height > maxAvailableHeight) {
        /** 确保顶部至少有边界填充的区域可见 */
        y = Math.max(minY, y)
      }
      else {
        const maxY = Math.max(minY, viewportOffsetY + viewportHeight - floatingBox.height - boundaryPadding)
        y = clamp(y, minY, maxY)
      }
    }

    setResolvedPlacement((prev) =>
      prev === bestPlacement
        ? prev
        : bestPlacement
    )
    setCoords((prev) =>
      prev && prev.x === x && prev.y === y
        ? prev
        : { x, y }
    )
  })

  /** 当 ref 目标发生尺寸变化时自动更新（显示期间更重要） */
  useResizeObserver(
    [
      referenceRef,
      floatingRef,
      ...(containerRef
        ? [containerRef]
        : []),
    ] as RefObject<HTMLElement>[],
    update,
  )

  /**
   * 当「布局语义」变化时同步重算
   * - 依赖项：开关、placement/offset、静态虚拟锚点、getter 引用、容器跟随模式
   * - ref 上 DOM 的尺寸变化由 ResizeObserver 触发 update；滚动由下一 effect
   * - `update` 为 useLatestCallback，引用稳定，列入依赖仅为满足 exhaustive-deps
   */
  useEffect(
    update,
    [
      enabled,
      placement,
      offset,
      boundaryPadding,
      flip,
      shift,
      virtualReferenceRect,
      getVirtualReferenceRect,
      followScroll,
      containerEl,
      update,
    ],
  )

  /**
   * 当「滚动监听拓扑」变化时重绑 window / 滚动容器；回调内调稳定的 update()，故不把 update 列入依赖
   */
  useEffect(() => {
    if (!enabled || !autoUpdate) return

    const onResize = () => update()
    window.addEventListener('resize', onResize, { passive: true })

    /** 跟随滚动模式下浮层在容器内，随滚动自然移动，无需监听 scroll */
    if (!followScroll) {
      const onScroll = () => update()
      window.addEventListener('scroll', onScroll, { capture: scrollCapture, passive: true })

      let containers: HTMLElement[] = []
      if (scrollContainers) {
        containers = scrollContainers
      }
      else {
        const referenceEl = referenceRef.current
        if (referenceEl) {
          containers = getScrollParents(referenceEl)
        }
      }
      containers.forEach((container) => {
        container.addEventListener('scroll', onScroll, { passive: true })
      })

      return () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', onScroll, { capture: scrollCapture } as EventListenerOptions)
        containers.forEach((container) => {
          container.removeEventListener('scroll', onScroll)
        })
      }
    }

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [
    enabled,
    autoUpdate,
    scrollCapture,
    scrollContainers,
    referenceRef,
    followScroll,
  ])

  return {
    style: coords
      ? {
        position: strategy,
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      }
      : {
        position: strategy,
        left: '-9999px',
        top: '-9999px',
      },
    placement: resolvedPlacement,
    strategy,
    update,
  }
}
