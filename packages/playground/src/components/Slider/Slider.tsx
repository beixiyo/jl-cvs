'use client'

import { cn } from '@/utils'
import { memo, useCallback, useRef } from 'react'
import { COMPONENT_DATA_ATTR } from '../../constants/dataAttributes'
import { DEFAULT_PROPS, DEFAULT_STYLE_CONFIG } from './constants'
import { useDragHandlers, useDragState, useGlobalEvents, useKeyboardHandler, usePixelConversion, useSliderValue } from './hooks'
import { renderHandle, renderMarks } from './subcomponents/renderUtils'
import type { SliderProps } from './types'
import { mergeStyleConfig } from './utils'

function InnerSlider<T extends number | [number, number] = number>(
  {
    style,
    className,
    disabled = DEFAULT_PROPS.disabled,
    keyboard = DEFAULT_PROPS.keyboard,
    dots = DEFAULT_PROPS.dots,
    included = DEFAULT_PROPS.included,
    marks,
    max = DEFAULT_PROPS.max,
    min = DEFAULT_PROPS.min,
    range = DEFAULT_PROPS.range,
    reverse = DEFAULT_PROPS.reverse,
    step = DEFAULT_PROPS.step,
    tooltip,
    value,
    defaultValue,
    vertical = DEFAULT_PROPS.vertical,
    ariaLabel,
    onChange,
    onChangeComplete,
    styleConfig,
    ...rest
  }: SliderProps<T>,
) {
  const sliderRef = useRef<HTMLDivElement>(null)

  /** 值管理 */
  const { currentValue, updateValue, clampFn } = useSliderValue(
    value,
    min,
    max,
    step,
    dots,
    marks,
    range,
    onChange,
    defaultValue,
  )

  /** 拖拽状态管理 */
  const { isDragging, dragIndex, setDragIndex, startDrag, endDrag } = useDragState()

  /** 像素转换 */
  const { pixelToValue, valueToPixel } = usePixelConversion(
    sliderRef as React.RefObject<HTMLDivElement>,
    min,
    max,
    vertical,
    reverse,
    clampFn,
  )

  /** 拖拽事件处理 */
  const { handleStart, handleMove, handleEnd } = useDragHandlers(
    isDragging,
    disabled,
    vertical,
    range,
    currentValue,
    dragIndex,
    pixelToValue,
    updateValue,
    endDrag,
    startDrag,
    setDragIndex,
  )

  /** 键盘事件处理 */
  const { handleKeyDown } = useKeyboardHandler(
    keyboard,
    disabled,
    step,
    min,
    max,
    range,
    currentValue,
    clampFn,
    updateValue,
    onChangeComplete,
  )

  /** 全局事件监听 */
  useGlobalEvents(isDragging, handleMove, handleEnd, onChangeComplete)

  /** 合并样式配置 */
  const finalStyleConfig = mergeStyleConfig(
    {
      ...DEFAULT_STYLE_CONFIG,
      track: {
        ...DEFAULT_STYLE_CONFIG.track,
        size: vertical
          ? 'w-1'
          : 'h-1',
      },
    },
    styleConfig,
  )

  /** 处理轨道点击，移动最近的滑块到点击位置 */
  const handleTrackMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return

    /** 如果点击的是滑块本身，则让滑块自己的事件处理器来管理 */
    if ((event.target as HTMLElement).closest(`[${COMPONENT_DATA_ATTR.slider.handle}]`)) return

    const newValue = pixelToValue(
      vertical
        ? event.clientY
        : event.clientX,
    )

    let indexToDrag = 0
    if (range && Array.isArray(currentValue)) {
      const [start, end] = currentValue
      const distToStart = Math.abs(start - newValue)
      const distToEnd = Math.abs(end - newValue)
      if (distToStart > distToEnd) indexToDrag = 1
    }

    sliderRef.current
      ?.querySelector<HTMLElement>(
        `[${COMPONENT_DATA_ATTR.slider.handle}="${indexToDrag}"]`,
      )
      ?.focus()
    handleStart(event, indexToDrag)
  }, [disabled, vertical, pixelToValue, range, currentValue, handleStart])

  return (
    <div
      ref={ sliderRef }
      className={ cn(
        'relative select-none',
        vertical
          ? 'h-full w-6 py-2'
          : 'w-full px-2',
        disabled && 'cursor-not-allowed',
        className,
      ) }
      style={ style }
      { ...rest }
    >
      <div
        className={ cn(
          'relative flex',
          vertical
            ? 'h-full items-center'
            : 'w-full justify-center',
        ) }
      >
        <div
          onMouseDown={ handleTrackMouseDown }
          className={ cn(
            'relative',
            vertical
              ? 'h-full w-1'
              : 'w-full h-1',
            !disabled && 'cursor-pointer',
          ) }
        >
          { /* 轨道背景 */ }
          <div
            className={ cn(
              'absolute w-full h-full',
              finalStyleConfig.track.background,
              finalStyleConfig.track.rounded,
            ) }
          />

          { /* 轨道填充 */ }
          { included && (
            <div
              className={ cn(
                'absolute',
                finalStyleConfig.fill?.rounded,
                finalStyleConfig.fill?.color,
                /** 只在非拖拽状态下启用过渡动画 */
                !isDragging && 'transition-all duration-150',
                disabled && 'bg-border2',
              ) }
              style={ (() => {
                const trackFillStyle: React.CSSProperties = {}
                const isRange = Array.isArray(currentValue)

                const startValue = isRange
                  ? currentValue[0]
                  : min
                const endValue = isRange
                  ? currentValue[1]
                  : currentValue as number

                const startPosPercent = valueToPixel(startValue)
                const endPosPercent = valueToPixel(endValue)

                const position = Math.min(startPosPercent, endPosPercent)
                const size = Math.abs(startPosPercent - endPosPercent)

                if (vertical) {
                  if (reverse) {
                    trackFillStyle.top = `${position}%`
                  }
                  else {
                    trackFillStyle.bottom = `${position}%`
                  }
                  trackFillStyle.height = `${size}%`
                  trackFillStyle.width = '100%'
                }
                else {
                  trackFillStyle.left = `${position}%`
                  trackFillStyle.width = `${size}%`
                  trackFillStyle.height = '100%'
                }
                return trackFillStyle
              })() }
            />
          ) }

          { /* 刻度标记 */ }
          { renderMarks(
            marks,
            min,
            max,
            currentValue,
            included,
            vertical,
            valueToPixel,
            finalStyleConfig,
          ) }

          { /* 滑块手柄 */ }
          { Array.isArray(currentValue)
            ? (
              <>
                { renderHandle(
                  currentValue[0],
                  0,
                  vertical,
                  keyboard,
                  disabled,
                  isDragging,
                  dragIndex,
                  tooltip,
                  reverse,
                  min,
                  max,
                  valueToPixel,
                  finalStyleConfig,
                  handleStart,
                  handleKeyDown,
                  ariaLabel,
                ) }
                { renderHandle(
                  currentValue[1],
                  1,
                  vertical,
                  keyboard,
                  disabled,
                  isDragging,
                  dragIndex,
                  tooltip,
                  reverse,
                  min,
                  max,
                  valueToPixel,
                  finalStyleConfig,
                  handleStart,
                  handleKeyDown,
                  ariaLabel,
                ) }
              </>
            )
            : (
              renderHandle(
                currentValue,
                0,
                vertical,
                keyboard,
                disabled,
                isDragging,
                dragIndex,
                tooltip,
                reverse,
                min,
                max,
                valueToPixel,
                finalStyleConfig,
                handleStart,
                handleKeyDown,
                ariaLabel,
              )
            ) }
        </div>
      </div>
    </div>
  )
}

InnerSlider.displayName = 'Slider'

export const Slider = memo(InnerSlider) as typeof InnerSlider
