import type { HtmlHTMLAttributes, PropsWithChildren, ReactElement } from 'react'
import { cloneElement, forwardRef } from 'react'
import { cn, filterValidComps } from '@/utils'

/**
 * Slot 组件用于将父组件的属性和样式传递给子组件
 * 它会合并父组件和子组件的 className 和 style
 */
export const Slot = forwardRef<HTMLElement, PropsWithChildren<HtmlHTMLAttributes<HTMLElement>>>((props, ref) => {
  const { children, ...slotProps } = props
  const validChildren = filterValidComps(children)

  if (validChildren.length !== 1) {
    throw new Error('Slot 组件必须且只能有一个子元素')
  }

  const child = validChildren[0] as ReactElement<HtmlHTMLAttributes<HTMLElement>>
  const { className: childClassName, style: childStyle, ...childProps } = child.props

  return cloneElement(child, {
    ...childProps,
    ...slotProps,
    // @ts-ignore
    ref,
    className: cn(slotProps.className, childClassName),
    style: {
      ...slotProps.style,
      ...childStyle,
    },
  })
})

Slot.displayName = 'Slot'
