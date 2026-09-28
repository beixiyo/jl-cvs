/**
 * i18n 统一导出
 * 提供完整的国际化功能，支持全局调用
 */

/** 语言检测：内置检测源、归一化与探测 */
export { cookieDetector, detectLanguage, getBrowserLanguage, htmlTagDetector, navigatorDetector, queryStringDetector, resolveDetection } from './core/detection'

/** 文字方向（LTR / RTL） */
export { getLanguageDirection } from './core/direction'

export type { TextDirection } from './core/direction'

/** 核心实例 */
export { createI18n, getI18n, I18n } from './core/instance'
export type { I18nOptions } from './core/instance'

/** 语言 fallback：语言码 → locale 映射，用于无地区资源时回退 */
export { buildLocaleChain, getFirstAvailableLocale, LANGUAGE_TO_LOCALE, resolveLocaleCandidates } from './core/languageFallback'

/** 语言持久化：内置适配器与配置解析 */
export {
  cookieAdapter,
  createPersistenceAdapter,
  localStorageAdapter,
  memoryAdapter,
  queryStringAdapter,
  resolvePersistence,
  sessionStorageAdapter,
} from './core/persistence'

/** 资源管理器 */
export { ResourceManager } from './core/resourceManager'

/** 翻译引擎 */
export { resolveKeyPath, TranslationEngine } from './core/translation'

/** 核心类型（含 LANGUAGES / Language / 持久化 / fallback / 事件 等） */
export * from './core/types'

/** 高级类型支持 */
export type { BuildTranslateOptions, TFunction as TypedTFunction } from './types/builder'

export type { TranslationPaths } from './types/pathExtractor'

/** Comps 组件级资源与专用 useT（自动注入 `comps.` 前缀） */
export * from './comps'
