'use client'

import { useComposedRef } from '@/hooks'
import { cn } from '@/utils'
import { Children, forwardRef, isValidElement, memo } from 'react'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { getRoundedRadius } from '../../utils/roundedUtils'
import { AuroraGlow } from '../AuroraGlow'
import { LoadingIcon } from '../Loading'
import { Slot } from '../Slot'
import type { TooltipProps } from '../Tooltip'
import { Tooltip } from '../Tooltip'
import { getDefaultStyles, getIconButtonStyles, getNeumorphicStyles } from './styles'
import { useButtonGroup } from './subcomponents/ButtonGroupContext'
import type { ButtonProps } from './types'

/** 判断 tooltip 是否为 TooltipProps 对象（而非 ReactNode） */
function isTooltipProps(
  tooltip: NonNullable<ButtonProps['tooltip']>,
): tooltip is Omit<TooltipProps, 'children'> {
  return typeof tooltip === 'object' && tooltip !== null && !isValidElement(tooltip)
}

const defaultProps: ButtonProps = {
  iconOnly: false,
  loading: false,
  disabled: false,
  designStyle: 'default',
  variant: 'default',
  size: 'md',
  rounded: 'xl',
  block: false,
}

const InnerButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const newProps = {
    ...defaultProps,
    ...props,
  } as ButtonProps

  const {
    children,
    variant,
    size,
    rounded,
    block,
    leftIcon,
    loadingText,
    rightIcon,
    className,
    iconClassName,
    disabled,
    loading,
    asChild,
    onClick,
    iconOnly,
    designStyle,
    bordered: _bordered,
    as: Component = 'button',
    tooltip,
    name,
    glow,
    glowProps,
    ...rest
  } = newProps

  /** 从 ButtonGroup Context 获取状态 */
  const buttonGroupContext = useButtonGroup()
  const isInButtonGroup = !!buttonGroupContext
  const isGroupActive = isInButtonGroup && name && buttonGroupContext.active === name
  const noChild = Children.toArray(children).length <= 0 || iconOnly

  /** 获取设计风格对应的样式 */
  const getStylesByDesign = () => {
    switch (designStyle) {
      case 'neumorphic':
        return getNeumorphicStyles(newProps)
      case 'default':
      default:
        return getDefaultStyles(newProps)
    }
  }

  /** 获取尺寸相关的样式 */
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      return {
        className: undefined,
        style: {
          height: `${size}px`,
          minHeight: `${size}px`,
          paddingLeft: `${size * 0.4}px`,
          paddingRight: `${size * 0.4}px`,
          fontSize: `${size * 0.4}px`,
        },
      }
    }
    return {
      className: undefined,
      style: undefined,
    }
  }

  const sizeStyles = getSizeStyles()

  /** 图标按钮的尺寸样式 */
  const iconButtonSize = noChild
    ? (typeof size === 'number'
      ? undefined
      : getIconButtonStyles(size!))
    : ''

  /** 在 ButtonGroup 中的样式 */
  const groupStyles = isInButtonGroup
    ? cn(
      'relative z-10 flex items-center justify-center px-3 py-1.5',
      isGroupActive
        ? 'text-button3'
        : 'text-text',
    )
    : ''

  /** 最终的按钮样式 */
  const buttonStyles = cn(
    /** 如果在 ButtonGroup 中，使用组样式，否则使用默认样式 */
    isInButtonGroup
      ? groupStyles
      : getStylesByDesign(),
    /** 使用 w-full 保持宽度充满，但不覆盖默认的 inline-flex，从而保持垂直居中 */
    !isInButtonGroup && block && 'w-full',
    !isInButtonGroup && noChild && [iconButtonSize, 'p-0'],
    sizeStyles.className,
    disabled || loading
      ? 'cursor-not-allowed'
      : 'cursor-pointer',
    className,
  )

  /** 处理点击事件 */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      e.preventDefault()
      return
    }

    /** 如果在 ButtonGroup 中且有 name，调用 Context 的 onChange */
    if (isInButtonGroup && name && buttonGroupContext.onChange) {
      buttonGroupContext.onChange(name)
    }

    onClick?.(e)
  }

  /** 获取按钮内容 */
  const getButtonContent = () => {
    /** 基础颜色判断：primary 以外的语义色通常文字是白色的 */
    const isSemanticVariant = ['success', 'warning', 'danger', 'info'].includes(variant!)
    const color = (variant === 'primary' || isSemanticVariant)
      ? 'white'
      : undefined

    if (loading) {
      /** 计算 LoadingIcon 的 size */
      const loadingIconSize = typeof size === 'number'
        ? size * 0.6 // 图标大小约为按钮高度的 60%
        : size === 'lg'
        ? 'md'
        : 'sm'

      return (
        <div className="flex items-center justify-center gap-2">
          <LoadingIcon
            size={ loadingIconSize }
            gradient={ {
              to: variant === 'primary'
                ? 'currentColor'
                : color,
            } }
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
          <span className={ cn('mr-2', noChild && 'mr-0', iconClassName) }>
            { leftIcon }
          </span>
        ) }
        { children }
        { rightIcon && (
          <span className={ cn('ml-2', noChild && 'ml-0', iconClassName) }>
            { rightIcon }
          </span>
        ) }
      </>
    )
  }

  const finalProps = {
    ref: undefined as any,
    className: buttonStyles,
    style: {
      ...sizeStyles.style,
      transition: isInButtonGroup
        ? 'none'
        : 'all 0.3s',
      ...rest.style,
    },
    disabled: disabled || loading,
    onClick: handleClick,
    /** 在 ButtonGroup 中添加 data 属性以便定位 */
    ...(isInButtonGroup && name
      ? { [DATA_ATTR.button.name]: name }
      : {}),
    ...rest,
    ...(isInButtonGroup && name
      ? {
        'aria-pressed': Boolean(isGroupActive),
        [DATA_ATTR.selected]: Boolean(isGroupActive),
      }
      : {}),
  }

  const { setRef } = useComposedRef({
    ref,
    onMounted: (node: HTMLButtonElement | null) => {
      if (isInButtonGroup && name) {
        buttonGroupContext.register?.(name, node)
      }
    },
    onUnmounted: () => {
      if (isInButtonGroup && name) {
        buttonGroupContext.unregister?.(name)
      }
    },
  })
  finalProps.ref = setRef

  /** 触发元素，根据 asChild 决定是 Slot 还是普通按钮 */
  const triggerElement = asChild
    ? (
      <Slot
        { ...finalProps }
      >
        { children }
      </Slot>
    )
    : (
      <Component
        { ...finalProps }
      >
        { getButtonContent() }
      </Component>
    )

  /** 如果传入 tooltip，则使用 Tooltip 包裹触发元素（Tooltip 直接挂在按钮上，避免 ref 问题） */
  let result = triggerElement
  if (tooltip) {
    const tooltipProps: Omit<TooltipProps, 'children'> = isTooltipProps(tooltip)
      ? tooltip
      : { content: tooltip }

    result = (
      <Tooltip { ...tooltipProps }>
        { triggerElement }
      </Tooltip>
    )
  }

  /** 开启辉光时，用 AuroraGlow 作为最外层包裹（ButtonGroup 内不启用，避免干扰组内布局） */
  if (glow && !isInButtonGroup) {
    return (
      <AuroraGlow radius={ getRoundedRadius(rounded) } { ...glowProps }>
        { result }
      </AuroraGlow>
    )
  }

  return result
})

InnerButton.displayName = 'Button'

/**
 * ## 新拟态风格按钮建议
 * - 浅色模式背景色建议：#e8e8e8
 * - 深色模式背景色建议：#262626 neutral-800
 */
export const Button = memo(InnerButton)
