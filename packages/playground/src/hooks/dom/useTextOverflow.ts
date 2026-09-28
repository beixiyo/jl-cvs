import { useEffect, useMemo, useRef, useState } from 'react'

export interface UseTextOverflowOptions {
  /**
   * 内容元素的 ref（如果不提供，hook 会内部创建）
   */
  contentRef?: React.RefObject<HTMLElement | null>
  /**
   * 是否检测垂直溢出（多行文本）
   * @default false
   */
  checkVertical?: boolean
  /**
   * 是否显示全部文本（如果为 true，则不检测溢出）
   * @default false
   */
  showAllText?: boolean
  /**
   * children 内容（用于作为 tooltip 的 fallback）
   */
  children?: React.ReactNode
  /**
   * 依赖项数组，当依赖变化时重新检测
   */
  deps?: React.DependencyList
}

/**
 * 检测文本是否溢出并提取文本内容
 *
 * @param options - 配置选项
 * @returns 返回是否溢出、文本内容和 ref
 */
export function useTextOverflow(options: UseTextOverflowOptions = {}) {
  const {
    contentRef: externalRef,
    checkVertical = false,
    showAllText = false,
    children,
    deps = [],
  } = options

  /**
   * 测量元素可能被条件渲染卸载后重新挂载（如编辑态把标题行换成输入框，取消后换回）
   * 普通 ref 对象重新赋值 `.current` 不会触发渲染，下方 effect 的依赖也不含元素本身，
   * 重挂后既不会对新元素重新测量，观察器也还挂在已卸载的旧元素上，
   * 溢出状态会永远停留在卸载前的旧值。这里拦截内部 ref 的 `.current` 赋值，
   * 元素身份变化时写入 state 触发重渲染，让 effect 以新元素为依赖重新测量；
   * 外部传入的 ref 无法拦截，维持原行为
   */
  const elementRef = useRef<HTMLElement | null>(null)
  const [element, setElement] = useState<HTMLElement | null>(null)

  const internalRef = useMemo(() => ({
    get current() {
      return elementRef.current
    },
    set current(node: HTMLElement | null) {
      if (elementRef.current === node) return
      elementRef.current = node
      setElement(node)
    },
  }), [])

  const returnRef = externalRef || internalRef

  const [isOverflowing, setIsOverflowing] = useState(false)
  const [textContent, setTextContent] = useState<string>('')
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>(null)

  const prevRef = useRef({ isOverflowing: false, textContent: '', tooltipContent: null as React.ReactNode })
  const childrenRef = useRef(children)
  childrenRef.current = children

  useEffect(() => {
    /** 外部 ref 感知不到重挂，只能在 effect 执行时读取一次 */
    const target = externalRef
      ? externalRef.current
      : element

    if (!target || showAllText) {
      const prev = prevRef.current
      if (prev.isOverflowing || prev.textContent !== '' || prev.tooltipContent !== null) {
        prevRef.current = { isOverflowing: false, textContent: '', tooltipContent: null }
        setIsOverflowing(false)
        setTextContent('')
        setTooltipContent(null)
      }
      return
    }

    const checkOverflow = () => {
      if (!target) return

      const { scrollWidth, clientWidth, scrollHeight, clientHeight } = target

      const newIsOverflow = checkVertical
        ? scrollHeight > clientHeight || scrollWidth > clientWidth
        : scrollWidth > clientWidth

      let newTextContent = ''
      let newTooltipContent: React.ReactNode = null

      if (newIsOverflow) {
        newTextContent = (target.textContent || '').trim()

        if (newTextContent) {
          newTooltipContent = newTextContent
        }
        else {
          const c = childrenRef.current
          newTooltipContent = typeof c === 'string' || typeof c === 'number'
            ? String(c)
            : null
        }
      }

      const prev = prevRef.current
      if (
        prev.isOverflowing === newIsOverflow
        && prev.textContent === newTextContent
        && prev.tooltipContent === newTooltipContent
      ) {
        return
      }

      prevRef.current = { isOverflowing: newIsOverflow, textContent: newTextContent, tooltipContent: newTooltipContent }

      if (prev.isOverflowing !== newIsOverflow) setIsOverflowing(newIsOverflow)
      if (prev.textContent !== newTextContent) setTextContent(newTextContent)
      if (prev.tooltipContent !== newTooltipContent) setTooltipContent(newTooltipContent)
    }

    checkOverflow()

    const observer = new ResizeObserver(checkOverflow)
    observer.observe(target)

    const mutationObserver = new MutationObserver(checkOverflow)
    mutationObserver.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [externalRef, element, checkVertical, showAllText, ...deps])

  return {
    contentRef: returnRef as React.RefObject<HTMLElement | null>,
    isOverflowing,
    textContent,
    tooltipContent: tooltipContent || textContent || null,
  }
}
