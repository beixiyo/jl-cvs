import type { Variants } from 'framer-motion'
import { onUnmounted, useClickOutside } from '@/hooks'
import { cn } from '@/utils'
import { X } from 'lucide-react'
import { AnimateShow } from '../Animate'

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
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [actualPosition, setActualPosition] = useState<PopoverPosition>(position)

  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

    // Check if there's enough space in the preferred position
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

    // Calculate coordinates based on the final position
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

    // Adjust if content goes outside viewport
    x = Math.max(8, Math.min(x, viewportWidth - contentRect.width - 8))
    y = Math.max(8, Math.min(y, viewportHeight - contentRect.height - 8))

    setActualPosition(newPosition)
    setCoords({ x, y })
  }

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

  const handleMouseLeave = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      removePopover()
    }
  }

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
  className?: string
  contentClassName?: string
  style?: React.CSSProperties
  children: React.ReactNode

  content: React.ReactNode
  position?: PopoverPosition
  trigger?: PopoverTrigger
  showCloseBtn?: boolean
  disabled?: boolean
  /**
   * Delay in ms before removing the popover
   * @default 200
   */
  removeDelay?: number

  clickOutsideToClose?: boolean
  onOpen?: () => void
  onClose?: () => void
}

export interface PopoverRef {
  open: () => void
  close: () => void
}
