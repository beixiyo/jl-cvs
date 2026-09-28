/**
 * 语言检测（detection）
 *
 * 职责：探测用户/环境的目标语言。内置 navigator、queryString、cookie、htmlTag
 * 四种检测源，并允许外部传入任意自定义函数完全接管。所有源对 SSR
 * （无 window / navigator / document）做防御，缺失环境时安全返回 null
 */

import type { DetectionConfig, DetectionOption, DetectionSource } from './types'

/**
 * navigator 语言检测源
 * 读取 `navigator.language`，回退到 `navigator.languages[0]`
 * - SSR 或 navigator 不可用时返回 null
 * - 返回值通常为 BCP 47（如 'zh-CN'、'en-US'、'ja'）
 */
export function navigatorDetector(): DetectionSource {
  return () => {
    if (typeof navigator === 'undefined') {
      return null
    }

    if (typeof navigator.language === 'string' && navigator.language) {
      return navigator.language
    }

    if (navigator.languages?.length) {
      const first = navigator.languages[0]
      return typeof first === 'string' && first
        ? first
        : null
    }

    return null
  }
}

/**
 * URL 查询参数检测源
 * 从 `location.search` 读取 `?<key>=xx`
 * @param key 查询参数名，默认 'lng'
 */
export function queryStringDetector(key = 'lng'): DetectionSource {
  return () => {
    if (typeof window === 'undefined' || typeof window.location === 'undefined') {
      return null
    }

    const search = window.location.search
    if (!search) {
      return null
    }

    const value = new URLSearchParams(search).get(key)
    return value || null
  }
}

/**
 * Cookie 检测源
 * 从 `document.cookie` 读取指定键
 * @param key cookie 键名，默认 'i18n_lang'
 */
export function cookieDetector(key = 'i18n_lang'): DetectionSource {
  return () => {
    if (typeof document === 'undefined') {
      return null
    }

    const cookie = document.cookie
    if (!cookie) {
      return null
    }

    const pairs = cookie.split(';')
    for (const pair of pairs) {
      const index = pair.indexOf('=')
      if (index === -1) {
        continue
      }

      const name = pair.slice(0, index).trim()
      if (name === key) {
        const raw = pair.slice(index + 1).trim()
        return raw
          ? decodeURIComponent(raw)
          : null
      }
    }

    return null
  }
}

/**
 * HTML 标签检测源
 * 读取 `<html lang="xx">` 的 `document.documentElement.lang`
 * - 无 document 或未设置 lang 时返回 null
 */
export function htmlTagDetector(): DetectionSource {
  return () => {
    if (typeof document === 'undefined' || !document.documentElement) {
      return null
    }

    return document.documentElement.lang || null
  }
}

/**
 * 归一化 detection 选项为统一的 {@link DetectionConfig}
 * - 传函数：包裹为 `{ order: [fn] }`
 * - 传函数数组：包裹为 `{ order: arr }`
 * - 传配置对象：原样返回
 * - 不传：默认 `{ order: [navigatorDetector()] }`
 */
export function resolveDetection(option?: DetectionOption): DetectionConfig {
  if (!option) {
    return { order: [navigatorDetector()] }
  }

  if (typeof option === 'function') {
    return { order: [option] }
  }

  if (Array.isArray(option)) {
    return { order: option }
  }

  return option
}

/**
 * 依序执行检测源，返回第一个非空结果
 * - 源返回数组时取其首个非空元素
 * - 单源抛错时捕获并跳过，继续下一个
 * - 所有源都无结果时返回 null
 */
export function detectLanguage(config: DetectionConfig): string | null {
  const order = config.order
  if (!order?.length) {
    return null
  }

  for (const source of order) {
    if (typeof source !== 'function') {
      continue
    }

    try {
      const result = source()
      const language = pickFirst(result)
      if (language) {
        return language
      }
    }
    catch {
      continue
    }
  }

  return null
}

/**
 * 读取浏览器当前语言（向后兼容封装）
 * 等价于 `navigatorDetector()()`，但始终返回单个字符串或 null
 */
export function getBrowserLanguage(): string | null {
  const result = navigatorDetector()()
  return pickFirst(result)
}

/**
 * 从检测源结果中取首个非空字符串
 */
function pickFirst(value: string | string[] | null | undefined): string | null {
  if (!value) {
    return null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && item) {
        return item
      }
    }
    return null
  }

  return typeof value === 'string' && value
    ? value
    : null
}
