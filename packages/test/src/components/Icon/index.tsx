import type { BaseType } from '@jl-org/tool'
import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import { genIcon, handleCssUnit } from '@jl-org/tool'
import { cn } from '@/utils'
import { Slot } from '../Slot'

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
    if (size != undefined)
      return size
    return width
  }, [size, width])

  const _height = useMemo(() => {
    if (size != undefined)
      return size
    return height
  }, [height, size])

  const render = () => {
    if (icon) {
      const IconComp = icon
      return <IconComp
        className={ cn(
          'text-white',
          iconClass,
        ) }
        size={ size ?? 15 }
        strokeWidth={ 1.5 }
        { ...rest }
      />
    }

    if (src) {
      // @ts-ignore
      return <img
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
    }

    if (iconfont) {
      return <i
        className={ cn(
          genIcon(iconfont),
          iconClass,
        ) }
        style={ {
          fontSize: size,
          ...iconStyle,
        } }
        { ...rest }
      >
      </i>
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
    <div { ...finalProps }>
      { render() }
    </div>
  )
})
Icon.displayName = 'Icon'

export type IconProps = {
  iconClass?: string
  iconStyle?: React.CSSProperties

  /**
   * 是否需要包裹一个容器
   * @default true
   */
  needContainer?: boolean

  /**
   * 使用 lucide-react 的组件
   */
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

  src?: string
  width?: BaseType
  height?: BaseType
  /**
   * 同时指定 width 和 height
   * 或者是 icon-font 的 font-size
   */
  size?: BaseType

  iconfont?: string
  asChild?: boolean
}
& Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
