import type { Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { onUnmounted, useClickOutside } from '@/hooks'
import { cn } from '@/utils'
import { AnimateShow } from '../Animate'

/**
 * Popover 组件，用于在触发器元素旁边显示浮动内容
 */
export const Popover = memo(forwardRef<PopoverRef, PopoverProps>((
  {
    style,
    className,
    contentClassName,

    children,
    content,
    position = 'top',
    trigger = 'hover',
    disabled,
    removeDelay = 200,

    clickOutsideToClose = true,
    showCloseBtn = false,
    onOpen,
    onClose,
  },
  ref,
) => {
  /** Popover 是否打开 */
  const [isOpen, setIsOpen] = useState(false)
  /** Popover 内容的坐标 (初始值设为屏幕外，防止闪烁) */
  const [coords, setCoords] = useState({ x: -9999, y: -9999 })
  /** Popover 的实际位置，可能会根据视口空间动态调整 */
  const [actualPosition, setActualPosition] = useState<PopoverPosition>(position)

  /** 触发器元素的引用 */
  const triggerRef = useRef<HTMLDivElement>(null)
  /** 内容元素的引用 */
  const contentRef = useRef<HTMLDivElement>(null)
  /** 延迟关闭的计时器引用 */
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 计算 Popover 的位置
   * 会根据视口边界自动调整位置，防止内容溢出
   */
  const calculatePosition = () => {
    if (!triggerRef.current || !contentRef.current)
      return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const contentRect = contentRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let newPosition = position
    let x = 0
    let y = 0

    /** 检查首选位置是否有足够空间，否则自动调整 */
    const spaceTop = triggerRect.top
    const spaceBottom = viewportHeight - triggerRect.bottom
    const spaceLeft = triggerRect.left
    const spaceRight = viewportWidth - triggerRect.right

    switch (position) {
      case 'top':
        if (spaceTop < contentRect.height) {
          newPosition = 'bottom'
        }
        break
      case 'bottom':
        if (spaceBottom < contentRect.height) {
          newPosition = 'top'
        }
        break
      case 'left':
        if (spaceLeft < contentRect.width) {
          newPosition = 'right'
        }
        break
      case 'right':
        if (spaceRight < contentRect.width) {
          newPosition = 'left'
        }
        break
    }

    /** 根据最终确定的位置计算坐标 */
    switch (newPosition) {
      case 'top':
        x = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        y = triggerRect.top - contentRect.height - 8
        break
      case 'bottom':
        x = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        y = triggerRect.bottom + 8
        break
      case 'left':
        x = triggerRect.left - contentRect.width - 8
        y = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        break
      case 'right':
        x = triggerRect.right + 8
        y = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        break
    }

    /** 再次微调，确保内容不会超出视口 */
    x = Math.max(8, Math.min(x, viewportWidth - contentRect.width - 8))
    y = Math.max(8, Math.min(y, viewportHeight - contentRect.height - 8))

    setActualPosition(newPosition)
    setCoords({ x, y })
  }

  /**
   * 关闭 Popover 的处理函数
   */
  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  /**
   * Effects
   */
  useClickOutside(
    [triggerRef, contentRef],
    handleClose,
    {
      enabled: isOpen && trigger === 'click' && clickOutsideToClose,
    },
  )

  useEffect(() => {
    if (isOpen) {
      calculatePosition()
      onOpen?.()
      window.addEventListener('scroll', calculatePosition)
      window.addEventListener('resize', calculatePosition)
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition)
      window.removeEventListener('resize', calculatePosition)
    }
  }, [isOpen])

  onUnmounted(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
  })

  /**
   * Events
   */

  /** 点击触发器时的处理函数 */
  const handleClick = () => {
    if (disabled)
      return
    if (trigger === 'click') {
      setIsOpen(!isOpen)
      if (!isOpen) {
        onOpen?.()
      }
      else {
        onClose?.()
      }
    }
  }

  /** 鼠标移入触发器时的处理函数 */
  const handleMouseEnter = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsOpen(true)
      onOpen?.()
    }
  }

  /** 延迟移除 Popover 的处理函数 */
  const removePopover = () => {
    if (removeDelay <= 0) {
      setIsOpen(false)
      onClose?.()
      return
    }

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      onClose?.()
    }, removeDelay)
  }

  /** 鼠标移出触发器时的处理函数 */
  const handleMouseLeave = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      removePopover()
    }
  }

  /** 鼠标移入内容区域时的处理函数 */
  const handleContentMouseEnter = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }

  /** 鼠标移出内容区域时的处理函数 */
  const handleContentMouseLeave = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      removePopover()
    }
  }

  /***************************************************
   *                    Refs
   ***************************************************/
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true)
    },
    close: () => {
      setIsOpen(false)
    },
  }))

  /** 不同位置的动画变体 */
  const variants: VariantObj = {
    top: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 10 },
    },
    bottom: {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    left: {
      initial: { opacity: 0, x: 10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 10 },
    },
    right: {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -10 },
    },
  }

  return (
    <>
      <div
        style={ style }
        ref={ triggerRef }
        onClick={ handleClick }
        onMouseEnter={ handleMouseEnter }
        onMouseLeave={ handleMouseLeave }
        className={ className }
      >
        { children }
      </div>

      <AnimateShow
        show={ isOpen }
        ref={ contentRef }
        className={ cn('fixed z-50 rounded-lg bg-black/70 py-2 px-4 shadow-lg', contentClassName) }
        style={ {
          left: coords.x,
          top: coords.y,
        } }
        variants={ variants[actualPosition] }
        onMouseEnter={ handleContentMouseEnter }
        onMouseLeave={ handleContentMouseLeave }
      >
        { showCloseBtn && <X
          className={ `absolute top-1 right-2 cursor-pointer text-red-400 font-bold z-50
        hover:text-red-600 duration-300 hover:text-lg` }
          onClick={ () => {
            setIsOpen(false)
            onClose?.()
          } }
        /> }

        { content }
      </AnimateShow>
    </>
  )
}))

Popover.displayName = 'Popover'

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'
export type PopoverTrigger = 'hover' | 'click'

type VariantObj = {
  [key in PopoverPosition]: Variants
}

export interface PopoverProps {
  /**
   * 触发器元素的类名
   */
  className?: string
  /**
   * 内容元素的类名
   */
  contentClassName?: string
  /**
   * 触发器元素的样式
   */
  style?: React.CSSProperties
  /**
   * 触发 Popover 的子元素
   */
  children: React.ReactNode
  /**
   * Popover 中显示的内容
   */
  content: React.ReactNode
  /**
   * Popover 的位置
   * @default 'top'
   */
  position?: PopoverPosition
  /**
   * 触发 Popover 的方式
   * @default 'hover'
   */
  trigger?: PopoverTrigger
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showCloseBtn?: boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 移除 Popover 之前的延迟（毫秒）
   * @default 200
   */
  removeDelay?: number
  /**
   * 点击外部区域是否关闭 Popover
   * @default true
   */
  clickOutsideToClose?: boolean
  /**
   * Popover 打开时的回调
   */
  onOpen?: () => void
  /**
   * Popover 关闭时的回调
   */
  onClose?: () => void
}

/**
 * Popover 组件的 Ref
 */
export interface PopoverRef {
  /**
   * 手动打开 Popover
   */
  open: () => void
  /**
   * 手动关闭 Popover
   */
  close: () => void
}
