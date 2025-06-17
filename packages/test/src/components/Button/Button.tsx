import type { ButtonProps } from './types'
import { cn } from '@/utils'
import React, { Children, forwardRef, memo } from 'react'
import { LoadingIcon } from '../Loading/LoadingIcon'
import { Slot } from '../Slot'
import { getFlatStyles, getGhostStyles, getIconButtonStyles, getNeumorphicStyles, getOutlinedStyles } from './styles'

const InnerButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    children,
    leftIcon,
    rightIcon,
    iconOnly = false,
    loading = false,
    loadingText,
    disabled = false,
    designStyle = 'flat',
    variant = 'default',
    size = 'md',
    rounded = 'md',
    block = false,
    className,
    iconClassName,
    hoverClassName,
    activeClassName,
    disabledClassName,
    loadingClassName,
    asChild,
    onClick,
    ...rest
  } = props

  const [isActive, setIsActive] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const noChild = Children.toArray(children).length <= 0 || iconOnly

  /** 获取设计风格对应的样式 */
  const getStylesByDesign = () => {
    switch (designStyle) {
      case 'neumorphic':
        return getNeumorphicStyles(props)
      case 'outlined':
        return getOutlinedStyles(props)
      case 'ghost':
        return getGhostStyles(props)
      case 'flat':
      default:
        return getFlatStyles(props)
    }
  }

  /** 图标按钮的尺寸样式 */
  const iconButtonSize = noChild
    ? getIconButtonStyles(size!)
    : ''

  /** 最终的按钮样式 */
  const buttonStyles = cn(
    getStylesByDesign(),
    block && 'w-full',
    noChild && [iconButtonSize, 'p-0'],
    disabled && disabledClassName,
    loading && loadingClassName,
    isActive && activeClassName,
    isHover && hoverClassName,
    className,
  )

  /** 处理点击事件 */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      e.preventDefault()
      return
    }

    onClick?.(e)
  }

  /** 处理鼠标按下事件 */
  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsActive(true)
    }
  }

  /** 处理鼠标抬起事件 */
  const handleMouseUp = () => {
    setIsActive(false)
  }

  /** 处理鼠标进入事件 */
  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      setIsHover(true)
    }
  }

  /** 处理鼠标离开事件 */
  const handleMouseLeave = () => {
    setIsHover(false)
    setIsActive(false)
  }

  /** 获取按钮内容 */
  const getButtonContent = () => {
    const color = variant === 'primary'
      ? '#fff'
      : undefined

    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2">
          <LoadingIcon
            size={ size === 'lg'
              ? 'md'
              : 'sm' }
            color={ color }
          />
          { !iconOnly && loadingText
            ? loadingText
            : children }
        </div>
      )
    }

    if (noChild && (leftIcon || rightIcon)) {
      return leftIcon || rightIcon
    }

    return (
      <>
        { leftIcon && (
          <span className={ cn('mr-2', (noChild) && 'mr-0', iconClassName) }>
            { leftIcon }
          </span>
        ) }
        { children }
        { rightIcon && (
          <span className={ cn('ml-2', (noChild) && 'ml-0', iconClassName) }>
            { rightIcon }
          </span>
        ) }
      </>
    )
  }

  const finalProps = {
    ref,
    className: buttonStyles,
    disabled: disabled || loading,
    onClick: handleClick,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...rest,
  }

  /** 如果使用 asChild，直接使用 Slot 组件 */
  if (asChild) {
    return (
      <Slot
        { ...finalProps }
      >
        { children }
      </Slot>
    )
  }

  /** 否则使用普通按钮 */
  return (
    <button
      { ...finalProps }
    >
      { getButtonContent() }
    </button>
  )
})

InnerButton.displayName = 'Button'

/**
 * ## 新拟态风格按钮建议
 * - 浅色模式背景色建议：#e8e8e8
 * - 深色模式背景色建议：#262626 neutral-800
 */
export const Button = memo(InnerButton)
