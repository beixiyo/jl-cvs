import { useEffect, useState } from 'react'

/**
 * 记得设置 HTML 的 viewport-fit=cover
 * ```html
 * <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
 * ```
 *
 * - 设置 viewport-fit=cover 后，你必须使用 CSS env() 函数来读取安全区域的尺寸，避免重要内容被刘海或底部状态栏遮挡：
 * - 如果没有 viewport-fit=cover，env(safe-area-inset-*) 的值永远是 0px，因为系统认为你不需要处理安全区域
 * ```css
 * --safe-area-top: env(safe-area-inset-top);
 * --safe-area-bottom: env(safe-area-inset-bottom);
 * --safe-area-left: env(safe-area-inset-left);
 * --safe-area-right: env(safe-area-inset-right);
 * ```
 *
 * contain: 页面内容被限制在安全矩形内，不会延伸到刘海/圆角区域
 * ┌─────────────────┐
 * │     刘海区域     │  ← contain: 这里显示黑色/白色背景
 * ├─────────────────┤
 * │                 │
 * │   网页内容区域   │  ← 内容只在这个矩形内
 * │                 │
 * ├─────────────────┤
 * │   底部安全区域   │  ← contain: 这里显示背景色
 * └─────────────────┘
 *
 * vs
 *
 * cover: 页面内容可以延伸到刘海/圆角区域，直到底部安全区域
 * ┌─────────────────┐
 * │  网页内容延伸到  │  ← cover: 内容可以延伸到这里
 * │     刘海区域     │
 * ├─────────────────┤
 * │                 │
 * │   网页内容区域   │
 * │                 │
 * ├─────────────────┤
 * │  内容延伸到底部  │  ← cover: 内容可以延伸到这里
 * └─────────────────┘
 */

/**
 * 获取精确的视口高度
 * @description
 * 使用 visualViewport API + CSS env() 安全区域,完美适配所有设备
 * - 自动适配 iOS 底部状态栏
 * - 支持刘海屏/药丸屏安全区域
 * - 响应键盘弹出、浏览器地址栏隐藏等场景
 * - 自动更新 CSS 变量 --vh 供全局使用
 *
 * @example
 * ```tsx
 * const { height, vh, safeAreaBottom } = useViewportHeight()
 *
 * // 方式1: 使用返回的高度值
 * <div style={{ height: `${height}px` }}>
 *
 * // 方式2: 使用 CSS 变量
 * <div style={{ height: 'calc(var(--vh) * 100)' }}>
 *
 * // 方式3: 考虑安全区域
 * <div style={{
 *   height: `${height - safeAreaBottom}px`,
 *   paddingBottom: `${safeAreaBottom}px`
 * }}>
 * ```
 */
export function useViewportHeight(): ViewportHeightInfo {
  const [info, setInfo] = useState<ViewportHeightInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        height: 0,
        vh: '0px',
        safeAreaBottom: 0,
        safeAreaTop: 0,
      }
    }

    const height = window.visualViewport?.height || window.innerHeight
    return {
      height,
      vh: `${height * 0.01}px`,
      safeAreaBottom: getSafeAreaInset('safe-area-inset-bottom'),
      safeAreaTop: getSafeAreaInset('safe-area-inset-top'),
    }
  })

  useEffect(() => {
    const updateHeight = () => {
      const height = window.visualViewport?.height || window.innerHeight
      const vh = `${height * 0.01}px`
      const safeAreaBottom = getSafeAreaInset('safe-area-inset-bottom')
      const safeAreaTop = getSafeAreaInset('safe-area-inset-top')

      setInfo({
        height,
        vh,
        safeAreaBottom,
        safeAreaTop,
      })

      /** 更新全局 CSS 变量供其他地方使用 */
      document.documentElement.style.setProperty('--vh', vh)
      document.documentElement.style.setProperty('--safe-area-bottom', `${safeAreaBottom}px`)
      document.documentElement.style.setProperty('--safe-area-top', `${safeAreaTop}px`)
    }

    /** 初始化 */
    updateHeight()

    /** 监听视口变化(键盘弹出、地址栏隐藏等) */
    window.visualViewport?.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('scroll', updateHeight)
    /** 降级方案:普通 resize */
    window.addEventListener('resize', updateHeight)

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight)
      window.visualViewport?.removeEventListener('scroll', updateHeight)
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return info
}

/**
 * 获取 CSS env() 安全区域数值
 * @param property env() 属性名
 * @returns 数值(px)
 */
function getSafeAreaInset(property: string): number {
  if (typeof window === 'undefined') return 0

  /** 创建临时元素测量 env() 值 */
  const div = document.createElement('div')
  div.style.position = 'fixed'
  div.style.top = '0'
  div.style.left = '0'
  div.style.width = '0'
  div.style.height = '0'
  div.style.visibility = 'hidden'
  div.style.paddingBottom = `env(${property}, 0px)`
  document.body.appendChild(div)

  const value = window.getComputedStyle(div).paddingBottom
  document.body.removeChild(div)

  return Number.parseFloat(value) || 0
}

/**
 * 视口高度信息
 */
export type ViewportHeightInfo = {
  /** 当前实际可视区域高度(px) */
  height: number
  /** CSS 自定义属性值,可直接用于 calc() */
  vh: string
  /** 底部安全区域高度(px),主要用于 iOS 底部状态栏 */
  safeAreaBottom: number
  /** 顶部安全区域高度(px),主要用于刘海屏/药丸屏 */
  safeAreaTop: number
}
