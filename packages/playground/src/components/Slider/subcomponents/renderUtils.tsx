import { cn } from '@/utils'
import { COMPONENT_DATA_ATTR } from '../../../constants/dataAttributes'
import type { SliderStyleConfig } from '../types'

/**
 * 渲染刻度标记
 */
export function renderMarks(
  marks: Record<number, any> | undefined,
  min: number,
  max: number,
  currentValue: number | [number, number],
  included: boolean,
  vertical: boolean,
  valueToPixel: (val: number) => number,
  finalStyleConfig: SliderStyleConfig,
) {
  if (!marks) return null

  return Object.entries(marks).map(([key, mark]) => {
    const value = Number(key)
    if (value < min || value > max) return null

    const position = valueToPixel(value)
    const isActive = Array.isArray(currentValue)
      ? value >= currentValue[0] && value <= currentValue[1]
      : value <= (currentValue as number)

    const markStyle = vertical
      ? { bottom: `${position}%` }
      : { left: `${position}%` }

    const label = mark && typeof mark === 'object' && 'label' in mark
      ? mark.label
      : mark
    const markCustomStyle = mark && typeof mark === 'object' && 'style' in mark
      ? mark.style
      : undefined

    return (
      <div
        key={ key }
        className={ cn(
          'absolute flex items-center justify-center',
          vertical
            ? 'right-0 translate-x-full'
            : 'top-full translate-y-1',
        ) }
        style={ { ...markStyle, ...markCustomStyle } }
      >
        <div
          className={ cn(
            'w-1 h-1 rounded-full border',
            isActive && included
              ? finalStyleConfig.marks?.activeDotColor
              : finalStyleConfig.marks?.dotColor,
            vertical
              ? 'mr-2'
              : 'mb-2',
          ) }
        />
        { label && (
          <span
            className={ cn(
              'text-xs whitespace-nowrap',
              finalStyleConfig.marks?.labelColor,
              vertical
                ? 'ml-1'
                : 'mt-1',
            ) }
          >
            { label }
          </span>
        ) }
      </div>
    )
  })
}

/**
 * 渲染滑块手柄
 */
export function renderHandle(
  val: number,
  index: number,
  vertical: boolean,
  keyboard: boolean,
  disabled: boolean,
  isDragging: boolean,
  dragIndex: number,
  tooltip: any,
  reverse: boolean,
  min: number,
  max: number,
  valueToPixel: (val: number) => number,
  finalStyleConfig: SliderStyleConfig,
  handleStart: (event: React.MouseEvent | React.TouchEvent, index: number) => void,
  handleKeyDown: (event: React.KeyboardEvent, index: number) => void,
  ariaLabel?: string,
) {
  const position = valueToPixel(val)

  /** 修复小球定位，确保完美居中对齐到轨道 */
  const handleStyle = vertical
    ? {
      bottom: `${position}%`,
      left: '50%',
      transform: 'translate(-50%, 50%)',
    }
    : {
      left: `${position}%`,
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }

  const handleElement = (
    <div
      key={ index }
      className={ cn(
        'absolute cursor-pointer group',
        finalStyleConfig.handle?.size,
        finalStyleConfig.handle?.color,
        finalStyleConfig.handle?.border,
        finalStyleConfig.handle?.rounded,
        /** 只在非拖拽状态下启用过渡动画 */
        !(isDragging && dragIndex === index) && 'transition-all duration-150',
        finalStyleConfig.handle?.hover,
        finalStyleConfig.handle?.focus,
        disabled && 'cursor-not-allowed opacity-50 border-border',
        isDragging && dragIndex === index && 'scale-110 shadow-lg',
      ) }
      style={ handleStyle }
      tabIndex={ keyboard && !disabled
        ? 0
        : -1 }
      role="slider"
      aria-label={ ariaLabel }
      aria-valuemin={ min }
      aria-valuemax={ max }
      aria-valuenow={ val }
      aria-disabled={ disabled }
      aria-orientation={ vertical
        ? 'vertical'
        : 'horizontal' }
      { ...{ [COMPONENT_DATA_ATTR.slider.handle]: index } }
      onMouseDown={ (event) => {
        event.currentTarget.focus()
        handleStart(event, index)
      } }
      onTouchStart={ (event) => {
        event.currentTarget.focus()
        handleStart(event, index)
      } }
      onKeyDown={ (e) => handleKeyDown(e, index) }
    >
      { /* 内联 Tooltip 实现，确保正确跟随滑块位置 */ }
      { tooltip && (
        <div
          className={ cn(
            'absolute px-2 py-1 text-xs text-background bg-button rounded-xs whitespace-nowrap pointer-events-none z-10',
            'transition-opacity duration-150',
            /** 根据位置设置tooltip位置 */
            typeof tooltip === 'object' && tooltip.position && tooltip.position !== 'auto'
              ? (tooltip.position === 'top'
                ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
                : tooltip.position === 'bottom'
                ? 'top-full mt-2 left-1/2 -translate-x-1/2'
                : tooltip.position === 'left'
                ? 'right-full mr-2 top-1/2 -translate-y-1/2'
                : 'left-full ml-2 top-1/2 -translate-y-1/2')
              : (vertical
                ? (reverse
                  ? 'left-full ml-2 top-1/2 -translate-y-1/2'
                  : 'right-full mr-2 top-1/2 -translate-y-1/2')
                : (reverse
                  ? 'top-full mt-2 left-1/2 -translate-x-1/2'
                  : 'bottom-full mb-2 left-1/2 -translate-x-1/2')),
            /** 显示/隐藏逻辑：拖拽时显示，或者悬停时显示 */
            isDragging && dragIndex === index
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100',
          ) }
        >
          { typeof tooltip === 'object' && tooltip.formatter
            ? tooltip.formatter(val)
            : val }

          { /* 箭头指示器 */ }
          <div
            className={ cn(
              'absolute w-0 h-0',
              /** 根据位置设置箭头方向 */
              typeof tooltip === 'object' && tooltip.position && tooltip.position !== 'auto'
                ? (tooltip.position === 'top'
                  ? 'top-full border-l-4 border-r-4 border-t-4 border-transparent border-t-button left-1/2 -translate-x-1/2'
                  : tooltip.position === 'bottom'
                  ? 'bottom-full border-l-4 border-r-4 border-b-4 border-transparent border-b-button left-1/2 -translate-x-1/2'
                  : tooltip.position === 'left'
                  ? 'left-full border-t-4 border-b-4 border-l-4 border-transparent border-l-button top-1/2 -translate-y-1/2'
                  : 'right-full border-t-4 border-b-4 border-r-4 border-transparent border-r-button top-1/2 -translate-y-1/2')
                : (vertical
                  ? (reverse
                    ? 'right-full border-t-4 border-b-4 border-r-4 border-transparent border-r-button top-1/2 -translate-y-1/2'
                    : 'left-full border-t-4 border-b-4 border-l-4 border-transparent border-l-button top-1/2 -translate-y-1/2')
                  : (reverse
                    ? 'bottom-full border-l-4 border-r-4 border-b-4 border-transparent border-b-button left-1/2 -translate-x-1/2'
                    : 'top-full border-l-4 border-r-4 border-t-4 border-transparent border-t-button left-1/2 -translate-x-1/2')),
            ) }
          />
        </div>
      ) }
    </div>
  )

  return handleElement
}
