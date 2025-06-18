import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/tool'

export const Slider = memo<SliderProps>((
  {
    style,
    className,
    disabled = false,
    keyboard = true,
    dots = false,
    included = true,
    marks,
    max = 100,
    min = 0,
    range = false,
    reverse = false,
    step = 1,
    tooltip,
    value,
    vertical = false,
    onChange,
    onChangeComplete,
    styleConfig,
    ...rest
  },
) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number>(0)
  const [internalValue, setInternalValue] = useState<number | [number, number]>(() => {
    if (value !== undefined)
      return value
    if (range)
      return [min, min]
    return min
  })

  /** 默认样式配置 */
  const defaultStyleConfig: SliderStyleConfig = {
    handle: {
      size: 'w-4 h-4',
      color: 'bg-white border-blue-500 dark:bg-gray-800 dark:border-blue-400',
      border: 'border-2',
      rounded: 'rounded-full',
      hover: 'hover:scale-110',
      focus: 'focus:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:focus:ring-blue-400',
    },
    track: {
      background: 'bg-gray-200 dark:bg-gray-700',
      size: vertical
        ? 'w-1'
        : 'h-1',
      rounded: 'rounded-full',
    },
    fill: {
      color: 'bg-blue-500 dark:bg-blue-400',
      rounded: 'rounded-full',
    },
    marks: {
      dotColor: 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600',
      activeDotColor: 'bg-blue-500 border-blue-500 dark:bg-blue-400 dark:border-blue-400',
      labelColor: 'text-gray-600 dark:text-gray-300',
    },
  }

  /** 合并用户配置和默认配置 */
  const finalStyleConfig = {
    handle: { ...defaultStyleConfig.handle, ...styleConfig?.handle },
    track: { ...defaultStyleConfig.track, ...styleConfig?.track },
    fill: { ...defaultStyleConfig.fill, ...styleConfig?.fill },
    marks: { ...defaultStyleConfig.marks, ...styleConfig?.marks },
  }

  /** 获取当前值 */
  const currentValue = value !== undefined
    ? value
    : internalValue

  /** 确保值在有效范围内 */
  const clampValue = useCallback((val: number) => {
    let clampedVal = Math.max(min, Math.min(max, val))

    /** 如果有步长，调整到最近的步长点 */
    if (step !== null && step > 0) {
      const steps = Math.round((clampedVal - min) / step)
      clampedVal = min + steps * step
    }

    /** 如果只能拖拽到刻度点 */
    if (dots && marks) {
      const markValues = Object.keys(marks).map(Number).sort((a, b) => a - b)
      clampedVal = markValues.reduce((prev, curr) =>
        Math.abs(curr - clampedVal) < Math.abs(prev - clampedVal)
          ? curr
          : prev,
      )
    }

    return clampedVal
  }, [min, max, step, dots, marks])

  /** 将像素位置转换为值 */
  const pixelToValue = useCallback((pixel: number) => {
    if (!sliderRef.current)
      return min

    const rect = sliderRef.current.getBoundingClientRect()
    const size = vertical
      ? rect.height
      : rect.width
    const offset = vertical
      ? rect.bottom - pixel
      : pixel - rect.left

    let ratio = offset / size
    if (reverse)
      ratio = 1 - ratio
    if (vertical && !reverse)
      ratio = 1 - ratio

    const rawValue = min + ratio * (max - min)
    return clampValue(rawValue)
  }, [min, max, vertical, reverse, clampValue])

  /** 将值转换为像素位置 */
  const valueToPixel = useCallback((val: number) => {
    let ratio = (val - min) / (max - min)
    if (reverse)
      ratio = 1 - ratio
    if (vertical && !reverse)
      ratio = 1 - ratio

    return ratio * 100 // 返回百分比
  }, [min, max, vertical, reverse])

  /** 更新值 */
  const updateValue = useCallback((newValue: number | [number, number]) => {
    setInternalValue(newValue)
    onChange?.(newValue)
  }, [onChange])

  /** 处理鼠标/触摸开始 */
  const handleStart = useCallback((event: React.MouseEvent | React.TouchEvent, index: number = 0) => {
    if (disabled)
      return

    event.preventDefault()
    setIsDragging(true)
    setDragIndex(index)

    const clientX = 'touches' in event
      ? event.touches[0].clientX
      : event.clientX
    const clientY = 'touches' in event
      ? event.touches[0].clientY
      : event.clientY
    const newValue = pixelToValue(vertical
      ? clientY
      : clientX)

    if (range && Array.isArray(currentValue)) {
      const newRangeValue: [number, number] = [...currentValue]
      newRangeValue[index] = newValue
      /** 确保范围值的顺序正确 */
      if (newRangeValue[0] > newRangeValue[1]) {
        newRangeValue.reverse()
        setDragIndex(1 - index)
      }
      updateValue(newRangeValue)
    }
    else {
      updateValue(newValue)
    }
  }, [disabled, vertical, pixelToValue, range, currentValue, updateValue])

  /** 处理拖拽移动 */
  const handleMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging || disabled)
      return

    const clientX = 'touches' in event
      ? event.touches[0].clientX
      : event.clientX
    const clientY = 'touches' in event
      ? event.touches[0].clientY
      : event.clientY
    const newValue = pixelToValue(vertical
      ? clientY
      : clientX)

    if (range && Array.isArray(currentValue)) {
      const newRangeValue: [number, number] = [...currentValue]
      newRangeValue[dragIndex] = newValue
      /** 确保范围值的顺序正确 */
      if (newRangeValue[0] > newRangeValue[1]) {
        [newRangeValue[0], newRangeValue[1]] = [newRangeValue[1], newRangeValue[0]]
        setDragIndex(1 - dragIndex)
      }
      updateValue(newRangeValue)
    }
    else {
      updateValue(newValue)
    }
  }, [isDragging, disabled, vertical, pixelToValue, range, currentValue, dragIndex, updateValue])

  /** 处理拖拽结束 */
  const handleEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setDragIndex(0)
      onChangeComplete?.(currentValue)
    }
  }, [isDragging, currentValue, onChangeComplete])

  /** 处理键盘事件 */
  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number = 0) => {
    if (!keyboard || disabled)
      return

    let delta = 0
    const stepValue = step || 1

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -stepValue
        break
      case 'ArrowRight':
      case 'ArrowUp':
        delta = stepValue
        break
      case 'Home':
        delta = min - (Array.isArray(currentValue)
          ? currentValue[index]
          : currentValue)
        break
      case 'End':
        delta = max - (Array.isArray(currentValue)
          ? currentValue[index]
          : currentValue)
        break
      case 'PageDown':
        delta = -stepValue * 10
        break
      case 'PageUp':
        delta = stepValue * 10
        break
      default:
        return
    }

    event.preventDefault()

    if (range && Array.isArray(currentValue)) {
      const newRangeValue: [number, number] = [...currentValue]
      newRangeValue[index] = clampValue(currentValue[index] + delta)
      /** 确保范围值的顺序正确 */
      if (newRangeValue[0] > newRangeValue[1]) {
        [newRangeValue[0], newRangeValue[1]] = [newRangeValue[1], newRangeValue[0]]
      }
      updateValue(newRangeValue)
      onChangeComplete?.(newRangeValue)
    }
    else if (typeof currentValue === 'number') {
      const newValue = clampValue(currentValue + delta)
      updateValue(newValue)
      onChangeComplete?.(newValue)
    }
  }, [keyboard, disabled, step, min, max, range, currentValue, clampValue, updateValue, onChangeComplete])

  /** 添加全局事件监听器 */
  useEffect(() => {
    if (!isDragging)
      return

    const handleMouseMove = (e: MouseEvent) => handleMove(e)
    const handleMouseUp = () => handleEnd()
    const handleTouchMove = (e: TouchEvent) => handleMove(e)
    const handleTouchEnd = () => handleEnd()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMove, handleEnd])

  /** 渲染刻度标记 */
  const renderMarks = () => {
    if (!marks)
      return null

    return Object.entries(marks).map(([key, mark]) => {
      const value = Number(key)
      if (value < min || value > max)
        return null

      const position = valueToPixel(value)
      const isActive = Array.isArray(currentValue)
        ? value >= currentValue[0] && value <= currentValue[1]
        : value <= currentValue

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
                ? finalStyleConfig.marks.activeDotColor
                : finalStyleConfig.marks.dotColor,
              vertical
                ? 'mr-2'
                : 'mb-2',
            ) }
          />
          { label && (
            <span className={ cn(
              'text-xs whitespace-nowrap',
              finalStyleConfig.marks.labelColor,
              vertical
                ? 'ml-1'
                : 'mt-1',
            ) }>
              { label }
            </span>
          ) }
        </div>
      )
    })
  }

  /** 渲染滑块手柄 */
  const renderHandle = (val: number, index: number = 0) => {
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
          finalStyleConfig.handle.size,
          finalStyleConfig.handle.color,
          finalStyleConfig.handle.border,
          finalStyleConfig.handle.rounded,
          /** 只在非拖拽状态下启用过渡动画 */
          !(isDragging && dragIndex === index) && 'transition-all duration-150',
          finalStyleConfig.handle.hover,
          finalStyleConfig.handle.focus,
          disabled && 'cursor-not-allowed opacity-50 border-gray-300',
          isDragging && dragIndex === index && 'scale-110 shadow-lg',
        ) }
        style={ handleStyle }
        tabIndex={ keyboard && !disabled
          ? 0
          : -1 }
        role="slider"
        aria-valuemin={ min }
        aria-valuemax={ max }
        aria-valuenow={ val }
        aria-disabled={ disabled }
        aria-orientation={ vertical
          ? 'vertical'
          : 'horizontal' }
        onMouseDown={ e => handleStart(e, index) }
        onTouchStart={ e => handleStart(e, index) }
        onKeyDown={ e => handleKeyDown(e, index) }
      >
        {/* 内联 Tooltip 实现，确保正确跟随滑块位置 */ }
        { tooltip && (
          <div
            className={ cn(
              'absolute px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap pointer-events-none z-10',
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

            {/* 箭头指示器 */ }
            <div
              className={ cn(
                'absolute w-0 h-0',
                /** 根据位置设置箭头方向 */
                typeof tooltip === 'object' && tooltip.position && tooltip.position !== 'auto'
                  ? (tooltip.position === 'top'
                      ? 'top-full border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 left-1/2 -translate-x-1/2'
                      : tooltip.position === 'bottom'
                        ? 'bottom-full border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800 left-1/2 -translate-x-1/2'
                        : tooltip.position === 'left'
                          ? 'left-full border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800 top-1/2 -translate-y-1/2'
                          : 'right-full border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800 top-1/2 -translate-y-1/2')
                  : (vertical
                      ? (reverse
                          ? 'right-full border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800 top-1/2 -translate-y-1/2'
                          : 'left-full border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800 top-1/2 -translate-y-1/2')
                      : (reverse
                          ? 'bottom-full border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800 left-1/2 -translate-x-1/2'
                          : 'top-full border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 left-1/2 -translate-x-1/2')),
              ) }
            />
          </div>
        ) }
      </div>
    )

    return handleElement
  }

  /** 计算轨道填充样式 */
  const getTrackFillStyle = () => {
    if (Array.isArray(currentValue)) {
      const [start, end] = currentValue
      const startPos = valueToPixel(start)
      const endPos = valueToPixel(end)

      if (vertical) {
        return {
          bottom: `${Math.min(startPos, endPos)}%`,
          height: `${Math.abs(endPos - startPos)}%`,
        }
      }
      else {
        return {
          left: `${Math.min(startPos, endPos)}%`,
          width: `${Math.abs(endPos - startPos)}%`,
        }
      }
    }
    else {
      const pos = valueToPixel(currentValue)

      if (vertical) {
        return reverse
          ? { top: 0, height: `${100 - pos}%` }
          : { bottom: 0, height: `${pos}%` }
      }
      else {
        return reverse
          ? { right: 0, width: `${100 - pos}%` }
          : { left: 0, width: `${pos}%` }
      }
    }
  }

  return (
    <div
      ref={ sliderRef }
      className={ cn(
        'relative select-none',
        vertical
          ? 'h-full w-6 py-2'
          : 'w-full h-6 px-2',
        disabled && 'cursor-not-allowed',
        className,
      ) }
      style={ style }
      { ...rest }
    >
      <div className={ cn(
        'relative flex',
        vertical
          ? 'h-full items-center'
          : 'w-full justify-center',
      ) }>
        <div className={ cn(
          'relative',
          vertical
            ? 'h-full w-1'
            : 'w-full h-1',
        ) }>
          {/* 轨道背景 */ }
          <div
            className={ cn(
              'absolute w-full h-full',
              finalStyleConfig.track.background,
              finalStyleConfig.track.rounded,
            ) }
          />

          {/* 轨道填充 */ }
          <div
            className={ cn(
              'absolute',
              finalStyleConfig.fill.color,
              finalStyleConfig.fill.rounded,
              /** 只在非拖拽状态下启用过渡动画 */
              !isDragging && 'transition-all duration-150',
              disabled && 'bg-gray-300',
            ) }
            style={ getTrackFillStyle() }
          />

          {/* 刻度标记 */ }
          { renderMarks() }

          {/* 滑块手柄 */ }
          { Array.isArray(currentValue)
            ? (
                <>
                  { renderHandle(currentValue[0], 0) }
                  { renderHandle(currentValue[1], 1) }
                </>
              )
            : (
                renderHandle(currentValue)
              ) }
        </div>
      </div>
    </div>
  )
})

Slider.displayName = 'Slider'

/** 类型定义 */
export type TooltipConfig = {
  /**
   * 自定义格式化函数
   */
  formatter?: (value: number) => React.ReactNode
  /**
   * 提示框位置
   * @default 'auto' - 自动根据slider方向选择
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
}

export type MarkConfig = {
  /**
   * 标签内容
   */
  label: React.ReactNode
  /**
   * 自定义样式
   */
  style?: React.CSSProperties
}

export type SliderStyleConfig = {
  /**
   * 滑块手柄样式配置
   */
  handle?: {
    /**
     * 手柄大小
     * @default 'w-5 h-5'
     */
    size?: string
    /**
     * 手柄颜色
     * @default 'bg-white border-blue-500'
     */
    color?: string
    /**
     * 手柄边框
     * @default 'border-2'
     */
    border?: string
    /**
     * 手柄圆角
     * @default 'rounded-full'
     */
    rounded?: string
    /**
     * 悬停效果
     * @default 'hover:scale-110'
     */
    hover?: string
    /**
     * 焦点效果
     * @default 'focus:scale-110 focus:ring-2 focus:ring-blue-500'
     */
    focus?: string
  }
  /**
   * 轨道样式配置
   */
  track?: {
    /**
     * 轨道背景颜色
     * @default 'bg-gray-200'
     */
    background?: string
    /**
     * 轨道高度/宽度
     * @default 'h-1' (水平) 或 'w-1' (垂直)
     */
    size?: string
    /**
     * 轨道圆角
     * @default 'rounded-full'
     */
    rounded?: string
  }
  /**
   * 进度条样式配置
   */
  fill?: {
    /**
     * 进度条颜色
     * @default 'bg-blue-500'
     */
    color?: string
    /**
     * 进度条圆角
     * @default 'rounded-full'
     */
    rounded?: string
  }
  /**
   * 刻度标记样式配置
   */
  marks?: {
    /**
     * 刻度点颜色
     * @default 'bg-white border-gray-300'
     */
    dotColor?: string
    /**
     * 激活状态刻度点颜色
     * @default 'bg-blue-500 border-blue-500'
     */
    activeDotColor?: string
    /**
     * 标签文字颜色
     * @default 'text-gray-600'
     */
    labelColor?: string
  }
}

export type SliderProps = {
  /**
   * 值为 true 时，滑块为禁用状态
   * @default false
   */
  disabled?: boolean
  /**
   * 支持使用键盘操作 handler
   * @default true
   */
  keyboard?: boolean
  /**
   * 是否只能拖拽到刻度上
   * @default false
   */
  dots?: boolean
  /**
   * marks 不为空对象时有效，值为 true 时表示值为包含关系，false 表示并列
   * @default true
   */
  included?: boolean
  /**
   * 刻度标记，key 的类型必须为 number 且取值在闭区间 [min, max] 内，每个标签可以单独设置样式
   */
  marks?: Record<number, React.ReactNode | MarkConfig>
  /**
   * 最大值
   * @default 100
   */
  max?: number
  /**
   * 最小值
   * @default 0
   */
  min?: number
  /**
   * 双滑块模式
   * @default false
   */
  range?: boolean
  /**
   * 反向坐标轴
   * @default false
   */
  reverse?: boolean
  /**
   * 步长，取值必须大于 0，并且可被 (max - min) 整除。当 marks 不为空对象时，可以设置 step 为 null，此时 Slider 的可选值仅有 marks、min 和 max
   * @default 1
   */
  step?: number | null
  /**
   * 设置 Tooltip 相关属性
   */
  tooltip?: boolean | TooltipConfig
  /**
   * 设置当前取值。当 range 为 false 时，使用 number，否则用 [number, number]
   */
  value?: number | [number, number]
  /**
   * 值为 true 时，Slider 为垂直方向
   * @default false
   */
  vertical?: boolean
  /**
   * 与 mouseup 和 keyup 触发时机一致，把当前值作为参数传入
   */
  onChangeComplete?: (value: number | [number, number]) => void
  /**
   * 当 Slider 的值发生改变时，会触发 onChange 事件，并把改变后的值作为参数传入
   */
  onChange?: (value: number | [number, number]) => void
  /**
   * 样式配置
   */
  styleConfig?: SliderStyleConfig
} & React.HTMLAttributes<HTMLDivElement>
