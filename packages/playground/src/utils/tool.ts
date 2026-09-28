import { Reg } from '@jl-org/tool'
import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * tailwindCSS 类合并
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addTimestampParam(url: string) {
  if (!url.startsWith('http')) return url

  const newUrl = new URL(url)
  newUrl.searchParams.set('__timestamp__', String(Date.now()))
  return newUrl.toString()
}

/**
 * 提取文本中的所有链接
 * @param text 要提取链接的文本
 * @returns 提取到的链接数组
 */
export function extractLinks(text: string): string[] {
  const matches = text.match(Reg.url) || []
  const normalized = matches.map((item) => {
    /** 排除 markdown */
    if (item.endsWith(')')) return item.slice(0, -1)
    return item
  })

  return [...new Set(normalized)]
}

/**
 * 规范化换行符
 * @param input 输入字符串
 * @returns 规范化后的字符串
 */
export function normalizeEOL(input: string) {
  /** 先将转义的换行字符（例如字符串形式的 "\r\n"、"\n"、"\r"）还原为真实换行 */
  const hasEscaped = input.includes('\\r\\n') || input.includes('\\n') || input.includes('\\r')
  const unescaped = hasEscaped
    ? input
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\n')
    : input
  /** 再将实际的 CRLF / CR 统一规范为 LF，避免无法识别为换行 */
  return unescaped.replace(/\r\n?/g, '\n')
}

/**
 * 检查文件是否匹配 accept 规则
 * @param file 文件对象
 * @param accept 规则字符串（如 ".pdf,image/*"）
 * @returns 是否合法
 */
export function isValidFileType(file: File, accept: string): boolean {
  if (!accept) return true // 无限制时直接通过

  const acceptedTypes = accept.split(',').map((type) => type.trim())
  const fileName = file.name.toLowerCase()
  const fileType = file.type

  return acceptedTypes.some((type) => {
    /** 检查文件扩展名（如 .pdf） */
    if (type.startsWith('.')) {
      return fileName.endsWith(type.toLowerCase())
    }

    /** 检查 MIME 类型（如 image/* 或 application/pdf） */
    if (type.includes('/')) {
      const [mainType, subType] = type.split('/')
      if (subType === '*') {
        return fileType.startsWith(`${mainType}/`)
      }
      return fileType === type
    }

    return false
  })
}

/**
 * 拼接成图片的 base64
 */
export function composeBase64(base64: string) {
  if (base64.startsWith('http') || base64.startsWith('data:image')) {
    return base64
  }
  return `data:image/png;base64,${base64}`
}
