import type { ClassValue } from 'clsx'
import { deepClone, Reg } from '@jl-org/tool'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * tailwindCSS 类合并
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addTimestampParam(url: string) {
  if (!url.startsWith('http'))
    return url

  const newUrl = new URL(url)
  newUrl.searchParams.set('__timestamp__', String(Date.now()))
  return newUrl.toString()
}

/**
 * 模拟打字效果
 */
export function typeTxt(options: TypeTxtOptions) {
  const {
    content,
    callback,
    speed = 16,
    continueFromIndex = 0,
  } = options

  let startTime = Date.now() - continueFromIndex * speed
  let currentIndex = continueFromIndex
  const { resolve, promise } = Promise.withResolvers<void>()

  /** 处理页面可见性变化 */
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      /** 重新计算时间差 */
      startTime = Date.now() - currentIndex * speed
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  const update = () => {
    const elapsed = Date.now() - startTime
    const targetIndex = Math.floor(elapsed / speed)
    currentIndex = Math.min(targetIndex, content.length)

    callback?.(content.slice(0, currentIndex))

    /** 双重检测保证及时停止 */
    if (currentIndex >= content.length) {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      resolve()
    }
  }

  /** 初始立即执行一次 */
  update()

  const interval = setInterval(update, speed)
  const stop = () => {
    clearInterval(interval)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    resolve()
  }

  return { promise, stop }
}

/**
 * 提取文本中的所有链接
 * @param text 要提取链接的文本
 * @returns 提取到的链接数组
 */
export function extractLinks(text: string): string[] {
  const matches = text.match(Reg.url) || []
  return [...new Set(matches)].map((item) => {
    /** 排除 markdown */
    if (item.endsWith(')'))
      return item.slice(0, -1)
    return item
  })
}

/**
 * 将文本字符串转换为类型为 `T` 的 JSON 对象。如果文本是 Markdown 格式且包含 `json` 代码块，则会先去除代码块标记再解析。
 * 如果解析失败，则返回提供的 fallback 值。
 * 可选地，如果 fallback 是数组且 `enableExtractLinks` 为 true，则会从原始文本中提取链接并追加到结果数组中。
 *
 * @template T - 期望返回的类型。
 * @param txt - 要解析为 JSON 的输入文本。
 * @param fallback - 解析失败时返回的备用值。
 * @param enableExtractLinks - 如果 fallback 是数组，是否提取并追加链接到结果。默认为 true。
 * @returns 解析后的 JSON 对象（类型为 `T`），或解析失败时的 fallback 值。
 */
export function txtToJson<T>(txt: string, fallback: T, enableExtractLinks = true): T {
  /**
   * 如果是 md 格式的，则删除 ```json
   */
  const jsonStr = txt
    .trim()
    .replace(/```(json)?\s*|\s*```$/gm, '')
    .trim()

  let data = deepClone(fallback)

  try {
    data = JSON.parse(jsonStr)
  }
  catch (error) {
    if (Array.isArray(fallback) && enableExtractLinks) {
      const links = extractLinks(jsonStr)
      // @ts-ignore
      links && data.push(...links)
    }
    else {
      console.error(String(error))
    }
  }

  return data
}

type TypeTxtOptions = {
  /**
   * 打字速度，单位：ms
   * @default 16
   */
  speed?: number
  callback?: (txt: string) => void
  content: string
  /**
   * 从指定索引继续打字，用于内容变化时不重新开始
   * @default 0
   */
  continueFromIndex?: number
}
