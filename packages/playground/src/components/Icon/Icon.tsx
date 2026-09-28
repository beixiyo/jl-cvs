'use client'

import { cn } from '@/utils'
import { handleCssUnit } from '@jl-org/tool'
import { memo, useMemo } from 'react'
import { Slot } from '../Slot'
import type { IconProps } from './types'

/**
 * @deprecated 不要用它，直接用 lucide 的 SVG 组件即可，除非使用 icon-font 才用
 */
export const Icon = memo<IconProps>((
  {
    style,
    iconStyle,
    className,
    iconClass,
    children,
    needContainer = true,

    src,
    iconfont,
    icon,

    width,
    height,
    size,
    asChild = false,

    ...rest
  },
) => {
  const _width = useMemo(() => {
    if (size != undefined) return size
    return width
  }, [size, width])

  const _height = useMemo(() => {
    if (size != undefined) return size
    return height
  }, [height, size])

  const render = () => {
    if (icon) {
      const IconComp = icon
      return (
        <IconComp
          className={ cn(
            'text-white',
            iconClass,
          ) }
          size={ size ?? 15 }
          strokeWidth={ 1.5 }
          { ...rest }
        />
      )
    }

    if (src) {
      return (
        // @ts-ignore
        <img
          src={ src }
          alt=""
          className={ cn(iconClass) }
          style={ {
            width: _width != undefined
              ? handleCssUnit(_width)
              : _width,
            height: _height != undefined
              ? handleCssUnit(_height)
              : _height,
            ...iconStyle,
          } }
          { ...rest }
        />
      )
    }

    if (iconfont) {
      return (
        // @ts-ignore
        <i
          className={ cn(
            `iconfont ${iconfont}`,
            iconClass,
          ) }
          style={ {
            fontSize: size,
            ...iconStyle,
          } }
          { ...rest }
        >
        </i>
      )
    }
  }

  const finalProps = {
    className: cn(
      'bg-black/55 flex justify-center items-center size-7 rounded-full',
      'cursor-pointer hover:bg-black/30 transition-all duration-300 text-white',
      className,
    ),
    style,
    ...rest,
  }

  if (!needContainer) {
    return render()
  }

  if (asChild) {
    return (
      // @ts-ignore
      <Slot { ...finalProps }>
        { children }
      </Slot>
    )
  }

  return (
    // @ts-ignore
    <div { ...finalProps }>
      { render() }
    </div>
  )
})
Icon.displayName = 'Icon'
