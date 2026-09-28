import { useMutationObserver, useResizeObserver } from '@/hooks'
import { cn } from '@/utils'
import { memo, useEffect, useMemo, useRef } from 'react'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { getRoundedStyles } from '../../../utils/roundedUtils'
import { ButtonGroupContext } from '../subcomponents/ButtonGroupContext'
import type { ButtonGroupProps } from '../types'

/**
 * 按钮组组件，用于在多个选项之间切换（类似 Segmented Control）
 *
 * 通过嵌套 Button 组件使用，Button 需要提供 name 属性
 *
 * @example
 * <ButtonGroup active="grid" onChange={setValue}>
 *   <Button name="grid" leftIcon={<GridViewSVG />} />
 *   <Button name="list" leftIcon={<ListViewSVG />} />
 * </ButtonGroup>
 */
export const ButtonGroup = memo<ButtonGroupProps>((props) => {
  const {
    active,
    onChange,
    children,
    className,
    style,
    thumbClassName,
    rounded = 'full',
    bordered = true,
    updateId,
  } = props

  const currentValue = active ?? ''

  const containerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  /** 存储注册的按钮元素，key 为 name */
  const buttonsRef = useRef<Map<string, HTMLElement | null>>(new Map())

  /** 计算并更新选中项位置（可被外部注册调用） */
  const computeAndApplyThumb = () => {
    const container = containerRef.current
    const thumb = thumbRef.current
    if (!container || !thumb) return

    const registeredEl = buttonsRef.current.get(currentValue)
    const activeButton = registeredEl ?? container.querySelector(
      `button[${DATA_ATTR.button.name}="${currentValue}"]`,
    ) as HTMLElement | null

    if (activeButton) {
      /**
       * 使用 offsetLeft/offsetWidth 代替 getBoundingClientRect
       * 1. 避免 motion 等外部 transform 动画导致坐标计算偏差
       * 2. offsetLeft 是相对于 offsetParent (这里即 container) 的准确坐标
       */
      const left = activeButton.offsetLeft
      const width = activeButton.offsetWidth

      thumb.style.transform = `translateX(${left}px)`
      thumb.style.width = `${width}px`
    }
    else {
      thumb.style.width = '0px'
    }
  }

  const mutiComputeAndApplyThumb = () => {
    computeAndApplyThumb()
    requestAnimationFrame(() => {
      requestAnimationFrame(computeAndApplyThumb)
    })
  }

  const contextValue = useMemo(() => ({
    active: currentValue,
    onChange: (val: string) => {
      if (val !== currentValue && onChange) {
        onChange(val)
      }
    },
    register: (name: string, el: HTMLElement | null) => {
      if (!name) return
      buttonsRef.current.set(name, el)
      if (name === currentValue) {
        requestAnimationFrame(() => {
          computeAndApplyThumb()
        })
      }
    },
    unregister: (name: string) => {
      if (!name) return
      buttonsRef.current.delete(name)
    },
  }), [currentValue, onChange])

  /** 计算并更新选中项的滑动指示器位置 */
  useEffect(() => {
    if (!containerRef.current || !thumbRef.current) return

    mutiComputeAndApplyThumb()
  }, [currentValue, updateId])

  useResizeObserver([containerRef], () => {
    mutiComputeAndApplyThumb()
  })

  useMutationObserver(containerRef, () => {
    mutiComputeAndApplyThumb()
  }, {
    subtree: true,
    childList: true,
    characterData: true,
  })

  const { className: roundedClass, style: roundedStyle } = getRoundedStyles(rounded)

  return (
    <ButtonGroupContext value={ contextValue }>
      <div
        ref={ containerRef }
        className={ cn(
          'relative flex items-center bg-button3 w-fit',
          bordered && 'border border-border',
          roundedClass,
          className,
        ) }
        style={ {
          ...style,
          ...roundedStyle,
        } }
      >
        { /* 滑动指示器（选中项背景） */ }
        <div
          ref={ thumbRef }
          className={ cn(
            'absolute top-0 left-0 h-full bg-button ease-out pointer-events-none',
            roundedClass,
            thumbClassName,
          ) }
          style={ {
            width: '0px',
            transition: '.2s',
            ...roundedStyle,
          } }
        />

        { children }
      </div>
    </ButtonGroupContext>
  )
})

ButtonGroup.displayName = 'ButtonGroup'
