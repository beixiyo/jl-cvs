import { nanoid } from 'nanoid'

/**
 * 生成跨运行环境可用的随机 ID
 *
 * 安全上下文优先使用浏览器原生 UUID，HTTP 等不支持 `randomUUID` 的环境
 * 回退到 nanoid，避免页面因 API 不可用而中断
 */
export function generateRandomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()

  return nanoid()
}
