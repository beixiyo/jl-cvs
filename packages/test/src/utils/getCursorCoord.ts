/**
 * 获取输入元素(Input或Textarea)中光标位置的屏幕坐标
 *
 * @param {HTMLInputElement | HTMLTextAreaElement} element - 输入元素
 * @returns {CursorPosition} - 光标的屏幕坐标和高度，如果无法获取则返回 0
 */
export function getCursorCoord(element: HTMLInputElement | HTMLTextAreaElement): CursorPosition {
  const defaultResult = {
    x: 0,
    y: 0,
    height: 0,
  }

  if (!element || !document.contains(element)) {
    return defaultResult
  }

  /** 获取选区位置 */
  const selectionStart = element.selectionStart
  if (selectionStart === null) {
    return defaultResult
  }

  /** 元素的尺寸和位置 */
  const elementRect = element.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(element)
  const lineHeight = Number.parseInt(computedStyle.lineHeight) || Number.parseInt(computedStyle.fontSize) * 1.2
  const paddingLeft = Number.parseInt(computedStyle.paddingLeft) || 0
  const paddingTop = Number.parseInt(computedStyle.paddingTop) || 0
  const borderLeft = Number.parseInt(computedStyle.borderLeftWidth) || 0
  const borderTop = Number.parseInt(computedStyle.borderTopWidth) || 0

  /** 不同元素类型的处理方式 */
  if (element.tagName.toLowerCase() === 'textarea') {
    /** 对于textarea，创建一个临时副本来计算位置 */
    const textBeforeCursor = element.value.slice(0, selectionStart)

    /** 创建一个隐藏的div来模拟textarea */
    const mirror = document.createElement('div')

    /** 复制textarea的关键样式 */
    const stylesToCopy = [
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'letter-spacing',
      'line-height',
      'text-transform',
      'word-spacing',
      'text-indent',
      'white-space',
      'word-wrap',
      'box-sizing',
      'width',
    ]

    stylesToCopy.forEach((style) => {
      mirror.style.setProperty(style, computedStyle.getPropertyValue(style))
    })

    /** 设置基本样式 */
    mirror.style.position = 'absolute'
    mirror.style.visibility = 'hidden'
    mirror.style.whiteSpace = 'pre-wrap'
    mirror.style.wordBreak = 'break-word'
    mirror.style.height = 'auto'
    mirror.style.width = `${element.clientWidth}px`

    /** 文本内容 */
    const spanToEnd = document.createElement('span')
    spanToEnd.textContent = '|' // 光标标记

    /** 添加文本内容到光标位置 */
    mirror.textContent = textBeforeCursor
    mirror.appendChild(spanToEnd)

    /** 添加到DOM用于测量 */
    document.body.appendChild(mirror)

    /** 获取光标位置 */
    const caretPos = spanToEnd.getBoundingClientRect()

    /** 计算最终坐标 - 相对于屏幕 */
    const x = elementRect.left + paddingLeft + borderLeft + caretPos.left - mirror.getBoundingClientRect().left - element.scrollLeft
    const y = elementRect.top + paddingTop + borderTop + caretPos.top - mirror.getBoundingClientRect().top - element.scrollTop

    /** 清理 */
    document.body.removeChild(mirror)

    return {
      x,
      y,
      height: lineHeight,
    }
  }
  else {
    /**
     * 对于input元素，使用一个更简单的方法
     * 创建一个临时canvas来测量文本
     */
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) {
      return defaultResult
    }

    /** 应用元素的字体样式到canvas */
    context.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`

    /** 获取光标前文本的宽度 */
    const textBeforeCursor = element.value.slice(0, selectionStart)
    const textWidth = context.measureText(textBeforeCursor).width

    /** 计算坐标 */
    const x = elementRect.left + paddingLeft + borderLeft + textWidth - element.scrollLeft
    const y = elementRect.top + (elementRect.height - lineHeight) / 2

    return {
      x,
      y,
      height: lineHeight,
    }
  }
}

/**
 * 对于需要跟踪实时光标位置的情况，使用此函数创建MutationObserver
 *
 * @param {HTMLInputElement | HTMLTextAreaElement} element - 输入元素
 * @returns {() => void} - 清理函数，调用它来停止观察
 */
export function trackCursorCoord(
  element: HTMLInputElement | HTMLTextAreaElement | null | undefined,
  callback: (coords: CursorPosition) => void,
): () => void {
  if (!element) {
    return () => { }
  }

  /** 获取并发送初始位置 */
  const updatePosition = () => {
    const coords = getCursorCoord(element)
    callback(coords)
  }

  /** 初始更新 */
  updatePosition()

  /** 监听各种可能导致光标位置变化的事件 */
  const events = ['input', 'keyup', 'click', 'mouseup', 'touchend', 'focus', 'blur', 'select', 'change']
  events.forEach((event) => {
    element.addEventListener(event, updatePosition)
  })

  /** 监听元素和窗口的滚动事件 */
  element.addEventListener('scroll', updatePosition, { passive: true })
  window.addEventListener('scroll', updatePosition, { passive: true })
  window.addEventListener('resize', updatePosition)

  /** 使用MutationObserver监视DOM变化 */
  const observer = new MutationObserver(updatePosition)
  observer.observe(element, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  })

  /** 返回清理函数 */
  return () => {
    events.forEach((event) => {
      element.removeEventListener(event, updatePosition)
    })
    element.removeEventListener('scroll', updatePosition)
    window.removeEventListener('scroll', updatePosition)
    window.removeEventListener('resize', updatePosition)
    observer.disconnect()
  }
}

export type CursorPosition = {
  x: number
  y: number
  height: number
}
