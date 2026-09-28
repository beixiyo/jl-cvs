import type { RefObject } from 'react'
import { useEffect } from 'react'

/**
 * 在组件渲染完成后通知父窗口（iframe的parent）
 * 父窗口可以监听此消息以进行截图等操作
 * @see {@link getPageSnaps}
 *
 * @example
 * ```tsx
 * // 在你的测试组件中使用
 * import { useNotifyParentReady } from '@/hooks'
 * import { useRef } from 'react'
 *
 * const MyTestComponent = () => {
 *   const wrapperRef = useRef<HTMLDivElement>(null)
 *   useNotifyParentReady({ targetRef: wrapperRef, delay: 200 })
 *
 *   return <div ref={wrapperRef}> ... your component content ... </div>
 * }
 * ```
 */
export function useNotifyParentReady(options: NotifyReadyOptions = {}): void {
  const { delay = 100, targetRef, getComponentSize } = options

  useEffect(() => {
    const timerId = setTimeout(() => {
      /** 确保在 iframe 中并且父窗口不是自身 */
      if (window.parent && window.parent !== window) {
        let componentWidth = 0
        let componentHeight = 0

        if (typeof getComponentSize === 'function') {
          const customSize = getComponentSize()
          componentWidth = customSize.width
          componentHeight = customSize.height
        }
        else if (targetRef?.current) {
          /** 使用 getBoundingClientRect 获取更精确的渲染尺寸 */
          const rect = targetRef.current.getBoundingClientRect()
          componentWidth = rect.width
          componentHeight = rect.height
        }
        else if (document.body) {
          /**
           * 备选方案：获取 document.body 的 scroll 尺寸
           * 这可能不准确，如果 body 不是紧密包裹组件
           */
          componentWidth = document.body.scrollWidth
          componentHeight = document.body.scrollHeight
        }

        /** 确保尺寸是合理的正整数 */
        componentWidth = Math.max(0, Math.round(componentWidth))
        componentHeight = Math.max(0, Math.round(componentHeight))

        window.parent.postMessage(
          {
            type: NOTIFY_PARENT_MESSAGE_TYPE,
            path: window.location.pathname, // 当前 iframe 的路径
            componentWidth,
            componentHeight,
          },
          '*', // 在生产环境中，强烈建议将 '*' 替换为父窗口的实际 origin
        )
      }
    }, delay)

    return () => {
      clearTimeout(timerId)
    }
  }, [delay, targetRef, getComponentSize]) // 依赖项确保 effect 在这些值变化时重新运行
}

/**
 * 通知父窗口组件已准备好截图的消息类型
 */
export const NOTIFY_PARENT_MESSAGE_TYPE = 'COMPONENT_READY_FOR_SCREENSHOT'

export interface NotifyReadyOptions {
  /**
   * 延迟发送消息的时间 (ms)
   * 有时组件在 useEffect 后可能还有微小的异步更新或绘制
   * @default 100
   */
  delay?: number
  /**
   * 如果提供了 ref，则使用该元素的尺寸
   * 否则，尝试获取 document.body 的 scrollWidth/scrollHeight
   */
  targetRef?: RefObject<HTMLElement>
  /**
   * 自定义获取组件尺寸的函数
   * 如果提供，则优先使用此函数获取尺寸
   * @returns {{ width: number, height: number }} 组件的宽度和高度
   */
  getComponentSize?: () => { width: number; height: number }
}
