/**
 * i18n core 统一导出（barrel）
 * 汇总各核心模块的运行时符号与类型，供上层 src/index.ts 与外部复用
 */

/** 语言检测 */
export { cookieDetector, detectLanguage, getBrowserLanguage, htmlTagDetector, navigatorDetector, queryStringDetector, resolveDetection } from './detection'

/** 文字方向（LTR / RTL） */
export { getLanguageDirection } from './direction'

export type { TextDirection } from './direction'
/** 核心实例 */
export { createI18n, getI18n, I18n } from './instance'

export type { I18nOptions } from './instance'

/** 语言 fallback：语言码 → locale 映射、locale 链构建 */
export { buildLocaleChain, getFirstAvailableLocale, LANGUAGE_TO_LOCALE, resolveLocaleCandidates } from './languageFallback'

/** 语言持久化：内置适配器与配置解析 */
export {
  cookieAdapter,
  createPersistenceAdapter,
  localStorageAdapter,
  memoryAdapter,
  queryStringAdapter,
  resolvePersistence,
  sessionStorageAdapter,
} from './persistence'

/** 资源管理器 */
export { ResourceManager } from './resourceManager'

/** 翻译引擎 */
export { resolveKeyPath, TranslationEngine } from './translation'

/** 核心类型 */
export * from './types'
