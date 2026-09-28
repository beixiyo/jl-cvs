import type { UseFloatingArrowStateOptions, UseFloatingArrowStateResult } from '../types'
import { resolveFloatingArrowOptions } from '../utils/config'
import { resolveFloatingArrowBox } from '../utils/geometry'
import { useFloatingArrow } from './useFloatingArrow'

const DEFAULT_ARROW_OFFSET = 24

/** 解析箭头配置，并根据浮层的最终位置计算交叉轴偏移 */
export function useFloatingArrowState(options: UseFloatingArrowStateOptions): UseFloatingArrowStateResult {
  const {
    arrow,
    enabled,
    placement,
    floatingStyle,
    referenceRef,
    floatingRef,
    virtualReferenceRect,
  } = options
  const arrowOptions = resolveFloatingArrowOptions(arrow)
  const centerOffset = useFloatingArrow({
    enabled: enabled && Boolean(arrowOptions),
    placement,
    floatingStyle,
    referenceRef,
    floatingRef,
    virtualReferenceRect,
    size: resolveFloatingArrowBox(arrowOptions ?? undefined).width,
    centerOffset: arrowOptions?.offset,
    padding: arrowOptions?.padding,
  })

  const {
    background,
    backgroundColor,
    ...style
  } = arrowOptions?.style ?? {}
  const fill = typeof backgroundColor === 'string'
    ? backgroundColor
    : typeof background === 'string'
    ? background
    : undefined

  return {
    options: arrowOptions,
    centerOffset: arrowOptions
      ? centerOffset
      : DEFAULT_ARROW_OFFSET,
    fill,
    style,
  }
}
