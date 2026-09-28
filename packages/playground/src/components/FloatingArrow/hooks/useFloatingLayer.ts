/**
 * 浮层定位 + 箭头的组合 hook
 *
 * 把「offset 换算、useFloatingPosition 定位、箭头交叉轴测量」三步合成一次调用，
 * 让 Tooltip / Popover / DatePicker 等消费方只需把 arrowProps 交给 FloatingArrow 渲染，
 * 而不必各自重复接线
 */
import { useFloatingPosition } from '@/hooks'
import type { RefObject } from 'react'
import type { FloatingArrowProps, UseFloatingLayerOptions, UseFloatingLayerReturn } from '../types'
import { resolveFloatingOffset } from '../utils/config'
import { useFloatingArrowState } from './useFloatingArrowState'

export function useFloatingLayer(
  referenceRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  options: UseFloatingLayerOptions = {},
): UseFloatingLayerReturn {
  const {
    arrow,
    bordered = false,
    offset = 8,
    enabled = true,
    virtualReferenceRect,
    ...positionOptions
  } = options

  const position = useFloatingPosition(referenceRef, floatingRef, {
    ...positionOptions,
    enabled,
    offset: resolveFloatingOffset({
      offset,
      arrow,
    }),
    virtualReferenceRect,
  })

  const arrowState = useFloatingArrowState({
    arrow,
    enabled,
    placement: position.placement,
    floatingStyle: position.style,
    referenceRef,
    floatingRef,
    virtualReferenceRect,
  })

  const arrowProps: FloatingArrowProps | null = arrowState.options
    ? {
      placement: position.placement,
      centerOffset: arrowState.centerOffset,
      size: arrowState.options.size,
      height: arrowState.options.height,
      bordered,
      fill: arrowState.fill,
      className: arrowState.options.className,
      style: arrowState.style,
    }
    : null

  return {
    ...position,
    arrowProps,
  }
}
