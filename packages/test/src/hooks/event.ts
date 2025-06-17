import type { WinListenerParams } from '@jl-org/tool'
import type { RefObject } from 'react'
import { bindWinEvent } from '@jl-org/tool'
import { useEffect } from 'react'
import { useAsyncEffect } from './lifecycle'

/**
 * 监听窗口隐藏
 * @param hiddenFn 窗口隐藏时执行的函数
 * @param showFn 窗口显示时执行的函数
 */
export function useOnWinHidden(
  hiddenFn: VoidFunction,
  showFn?: VoidFunction,
) {
  useEffect(() => {
    const fn = () => {
      const isHidden = document.visibilityState === 'hidden'
      if (isHidden) {
        hiddenFn()
        return
      }

      const isVisible = document.visibilityState === 'visible'
      if (isVisible && showFn) {
        showFn()
      }
    }

    document.addEventListener('visibilitychange', fn)

    return () => {
      document.removeEventListener('visibilitychange', fn)
    }
  }, [hiddenFn, showFn])
}

/**
 * 绑定 window 事件，并自动解绑事件
 * @param eventName 事件名称
 * @param listener 事件回调
 * @returns 解绑事件函数
 */
export function useBindWinEvent<K extends keyof WindowEventMap>(
  eventName: K,
  listener: WinListenerParams<K>[1],
  options?: WinListenerParams<K>[2],
) {
  useEffect(() => {
    const unBind = bindWinEvent(eventName, listener, options)
    return unBind
  }, [eventName, listener, options])

  return () => {
    window.removeEventListener(eventName, listener, options)
  }
}

/**
 * 插入样式，并自动移除样式
 * @param styleStrOrUrl 样式字符串
 */
export function useInsertStyle(styleStrOrUrl: string) {
  useAsyncEffect(
    async () => {
      /** 尝试解析为 URL */
      try {
        new URL(styleStrOrUrl)
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = styleStrOrUrl
        document.head.appendChild(link)
        return () => {
          document.head.removeChild(link)
        }
      }
      catch (error) {
        /** 是字符串 */
      }

      const styleEl = document.createElement('style')
      styleEl.setAttribute('type', 'text/css')
      styleEl.innerHTML = styleStrOrUrl

      document.head.appendChild(styleEl)
      return () => {
        document.head.removeChild(styleEl)
      }
    },
    [styleStrOrUrl],
    {
      effectFn: useInsertionEffect,
    },
  )
}

/**
 * 检测当前点击区域，是否在元素外部
 * @param refs 需要监听点击的元素
 * @param handler 事件处理函数
 */
export function useClickOutside(
  refs: RefObject<HTMLElement>[],
  handler: () => void,
  options: ClickOutsideOpts = {},
) {
  const {
    enabled = true,
    trigger = 'click',
    includeChildren = false,
  } = options

  useEffect(() => {
    if (!enabled)
      return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!refs.some(ref => ref.current?.contains(target))) {
        handler()
      }
    }

    window.addEventListener(trigger, handleClickOutside)
    return () => {
      window.removeEventListener(trigger, handleClickOutside)
    }
  }, [refs, handler, enabled, trigger])
}

export function useScrollBottom(
  elRef: RefObject<HTMLElement>,
  deps: any[] = [],
  options: ScrollBottomOpts = {},
) {
  const {
    enabled = true,
    smooth = false,
    delay = 0,
  } = options

  const scrollToBottom = useCallback(() => {
    const el = elRef.current
    if (!el)
      return

    const { scrollHeight, clientHeight } = el
    /** 仅当内容溢出时才执行 */
    if (scrollHeight > clientHeight) {
      const target = scrollHeight - clientHeight
      el.scrollTo({
        top: target,
        behavior: smooth
          ? 'smooth'
          : 'instant',
      })
    }
  }, [elRef, smooth])

  useLayoutEffect(() => {
    if (!enabled)
      return

    if (delay > 0) {
      const timer = window.setTimeout(scrollToBottom, delay)
      return () => window.clearTimeout(timer)
    }
    else {
      scrollToBottom()
    }
  }, [enabled, smooth, delay, scrollToBottom, ...deps])

  return {
    /**
     * 计算并滚动到正确的底部位置
     */
    scrollToBottom,
  }
}

export function useMouse() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  })

  return mouse
}

interface ClickOutsideOpts {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean

  /**
   * 事件类型
   * @default click
   */
  trigger?: 'click' | 'contextmenu'

  /**
   * 是否包含子元素
   * @default false
   */
  includeChildren?: boolean
}

interface ScrollBottomOpts {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
  /**
   * 启动平滑滚动，可能造成无法滚动到底
   * @default false
   */
  smooth?: boolean
  /**
   * 延迟时间
   * @default 0
   */
  delay?: number
}
