import { useInsertionEffect } from 'react'
import { useCustomEffect } from '../lifecycle'
import { useTheme } from '../theme'
import type { InsertStyleOpts } from './types'

function parseAndInsertStyle(styleStrOrUrl: string) {
  let clean: VoidFunction | undefined

  return () => {
    /** 尝试解析为 URL */
    try {
      new URL(styleStrOrUrl)
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = styleStrOrUrl
      document.head.appendChild(link)

      clean = () => {
        document.head.removeChild(link)
      }
      return clean
    }
    catch (_error) { /** 是字符串 */ }

    const styleEl = document.createElement('style')
    styleEl.setAttribute('type', 'text/css')
    styleEl.innerHTML = styleStrOrUrl

    document.head.appendChild(styleEl)
    clean = () => {
      document.head.removeChild(styleEl)
    }

    return clean
  }
}

/**
 * 根据主题插入样式，并自动移除样式
 * @param styleStrOrUrl 样式字符串或 URL，同时用于浅色和深色主题
 * @returns 卸载函数
 */
export function useInsertStyle(styleStrOrUrl: string): VoidFunction | undefined

/**
 * 根据主题插入样式，并自动移除样式
 * @param opts 插入样式选项
 * @returns 卸载函数
 */
export function useInsertStyle(opts: InsertStyleOpts): VoidFunction | undefined

export function useInsertStyle(
  styleStrOrUrlOrOpts: string | InsertStyleOpts,
): VoidFunction | undefined {
  const [theme] = useTheme()
  const isString = typeof styleStrOrUrlOrOpts === 'string'

  const opts = isString
    ? undefined
    : styleStrOrUrlOrOpts
  const enable = opts?.enable ?? true
  const darkStyleStrOrUrl = opts?.darkStyleStrOrUrl
  const lightStyleStrOrUrl = opts?.lightStyleStrOrUrl

  // Handle string case
  useCustomEffect(
    async () => {
      if (!isString) return

      const fn = parseAndInsertStyle(styleStrOrUrlOrOpts)
      return fn()
    },
    [isString, styleStrOrUrlOrOpts],
    {
      effect: useInsertionEffect,
    },
  )

  // Handle object case
  useCustomEffect(
    async () => {
      if (isString) return

      if (!enable || !(darkStyleStrOrUrl && lightStyleStrOrUrl)) return

      const lightFn = lightStyleStrOrUrl
        ? parseAndInsertStyle(lightStyleStrOrUrl)
        : () => () => {}
      const darkFn = darkStyleStrOrUrl
        ? parseAndInsertStyle(darkStyleStrOrUrl)
        : () => () => {}

      if (theme === 'light') {
        return lightFn()
      }
      else {
        return darkFn()
      }
    },
    [isString, enable, darkStyleStrOrUrl, lightStyleStrOrUrl, theme],
    {
      effect: useInsertionEffect,
    },
  )

  return undefined
}
