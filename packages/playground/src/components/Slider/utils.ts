/**
 * 确保值在有效范围内
 */
export function clampValue(val: number, min: number, max: number, step: number | null = null, dots: boolean = false, marks?: Record<number, any>): number {
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
        : prev
    )
  }

  return clampedVal
}

/**
 * 将像素位置转换为值
 */
export function pixelToValue(
  pixel: number,
  sliderRect: DOMRect,
  min: number,
  max: number,
  vertical: boolean,
  reverse: boolean,
  clampFn: (val: number) => number,
): number {
  const size = vertical
    ? sliderRect.height
    : sliderRect.width
  const offset = vertical
    ? sliderRect.bottom - pixel
    : pixel - sliderRect.left

  let ratio = offset / size
  if (reverse) ratio = 1 - ratio
  if (vertical && !reverse) ratio = 1 - ratio

  const rawValue = min + ratio * (max - min)
  return clampFn(rawValue)
}

/**
 * 将值转换为像素位置（百分比）
 */
export function valueToPixel(val: number, min: number, max: number, vertical: boolean, reverse: boolean): number {
  let ratio = (val - min) / (max - min)
  if (reverse) ratio = 1 - ratio
  if (vertical && !reverse) ratio = 1 - ratio

  return ratio * 100 // 返回百分比
}

/**
 * 计算轨道填充样式
 */
export function getTrackFillStyle(currentValue: number | [number, number], valueToPixelFn: (val: number) => number, vertical: boolean, reverse: boolean) {
  if (Array.isArray(currentValue)) {
    const [start, end] = currentValue
    const startPos = valueToPixelFn(start)
    const endPos = valueToPixelFn(end)

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
    const pos = valueToPixelFn(currentValue)

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

/**
 * 获取键盘事件的步进值
 */
export function getKeyboardDelta(key: string, step: number, min: number, max: number, currentValue: number | [number, number], index: number = 0): number {
  const stepValue = step || 1
  let delta = 0

  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      delta = -stepValue
      break
    case 'ArrowRight':
    case 'ArrowUp':
      delta = stepValue
      break

    case 'Home': {
      const val = Array.isArray(currentValue)
        ? currentValue[index]
        : currentValue
      delta = min - val
      break
    }

    case 'End': {
      const val = Array.isArray(currentValue)
        ? currentValue[index]
        : currentValue
      delta = max - val
      break
    }

    case 'PageDown':
      delta = -stepValue * 10
      break
    case 'PageUp':
      delta = stepValue * 10
      break

    default:
      return 0
  }

  return delta
}

/**
 * 合并样式配置
 */
export function mergeStyleConfig(defaultConfig: any, userConfig?: any) {
  return {
    handle: { ...defaultConfig.handle, ...userConfig?.handle },
    track: { ...defaultConfig.track, ...userConfig?.track },
    fill: { ...defaultConfig.fill, ...userConfig?.fill },
    marks: { ...defaultConfig.marks, ...userConfig?.marks },
  }
}
