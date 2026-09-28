/**
 * i18n 核心类型 —— 本文件是「契约层」
 * 各核心模块（detection / persistence / languageFallback / translation / instance）
 * 都从这里导入公共类型并实现，确保接口稳定、互不冲突
 */

/**
 * 内置支持的语言（locale）常量
 */
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  ZH_TW: 'zh-TW',
  EN_US: 'en-US',
  JA_JP: 'ja-JP',
  FR_FR: 'fr-FR',
  DE_DE: 'de-DE',
  KO_KR: 'ko-KR',
  ES_ES: 'es-ES',
  RU_RU: 'ru-RU',
} as const

/**
 * 语言 locale 字面量联合（如 'zh-CN' | 'en-US' ...）
 * 运行时实际可接受任意 BCP-47 字符串，类型上以内置常量为主
 */
export type Language = typeof LANGUAGES[keyof typeof LANGUAGES]

/**
 * 翻译资源（单语言），支持任意嵌套
 */
export type Translations = {
  [key: string]: any
}

/**
 * 多语言资源包，每个语言对应一棵 Translations 树
 */
export type Resources = {
  [Lang in Language]?: Translations
}

/**
 * 翻译选项
 */
export interface TranslateOptions {
  /**
   * 找不到 key 时的兜底文本
   */
  defaultValue?: string

  /**
   * 复数数量；传入后按 Intl.PluralRules 选择复数形态，并注入 {{count}} 插值
   */
  count?: number

  /**
   * 直接返回原始对象/数组而非字符串
   * @default false
   */
  returnObjects?: boolean

  /**
   * 本次调用覆盖已绑定的 keyPrefix
   * - 传 `''` 表示「清空前缀」，从根解析（用于在 scoped t 上访问外层 key）
   * - 传 `'other.prefix'` 表示临时切换前缀
   * - 不传则沿用 scoped t 绑定的前缀
   */
  keyPrefix?: string

  /**
   * 其余字段作为插值变量（如 { name: 'John' } 对应 {{name}}）
   */
  [key: string]: any
}

/**
 * 运行期翻译函数签名（非类型安全版本）
 */
export type TFunction = (key: string, options?: TranslateOptions) => string

/* ============================================================
 * 语言检测（detection）
 * ============================================================ */

/**
 * 单个语言检测源
 * @returns 检测到的语言码；可返回多个候选（按优先级）；无结果返回 null/undefined
 */
export type DetectionSource = () => string | string[] | null | undefined

/**
 * 语言检测配置
 */
export interface DetectionConfig {
  /**
   * 按序尝试的检测源，第一个返回非空者命中
   * @default [navigatorDetector()]
   */
  order?: DetectionSource[]
}

/**
 * detection 选项：可传
 * - 单个自定义函数：`() => 'zh-CN'`
 * - 函数数组（按序）：`[queryStringDetector(), navigatorDetector()]`
 * - 配置对象：`{ order: [...] }`
 */
export type DetectionOption = DetectionSource | DetectionSource[] | DetectionConfig

/* ============================================================
 * 持久化（persistence）
 * ============================================================ */

/**
 * 持久化适配器：外部可实现以接入任意存储（IndexedDB、内存、远端等）
 */
export interface PersistenceAdapter {
  /** 读取，无值返回 null */
  get: (key: string) => string | null
  /** 写入 */
  set: (key: string, value: string) => void
  /** 删除 */
  remove: (key: string) => void
}

/**
 * 内置持久化方案
 * @default 'localStorage'
 */
export type PersistenceStrategy =
  | 'localStorage'
  | 'sessionStorage'
  | 'cookie'
  | 'queryString'
  | 'memory'

/**
 * 持久化配置
 *
 * 优先级：`get`/`set` 函数 > `adapter` > `strategy` 内置方案
 */
export interface PersistenceConfig {
  /**
   * 是否启用持久化
   * @default false  默认不持久化
   */
  enabled?: boolean

  /**
   * 存储键名（localStorage / sessionStorage / cookie 的键名）
   * @default 'i18n:lang'
   */
  key?: string

  /**
   * queryString 方案下的 URL 参数名
   * 单列此项是因为通用 `key`（默认 'i18n:lang'）含 `:`，作为 query 参数会被编码成 `%3A`，URL 难看；
   * 故 queryString 默认改用干净的 'lang'
   * @default 'lang'
   */
  queryKey?: string

  /**
   * 使用的内置方案（enabled 为 true 时生效）
   * @default 'localStorage'
   */
  strategy?: PersistenceStrategy

  /**
   * 自定义适配器（优先于 strategy）
   */
  adapter?: PersistenceAdapter

  /**
   * 自定义读函数（最高优先级，便于外部完全自定义）
   */
  get?: (key: string) => string | null

  /**
   * 自定义写函数（最高优先级，便于外部完全自定义）
   */
  set?: (key: string, value: string) => void
}

/* ============================================================
 * 语言 fallback
 * ============================================================ */

/**
 * 语言码 → 地区 locale 映射（如 `{ zh: ['zh-CN'] }`）
 */
export type LanguageToLocaleMap = Record<string, string[]>

/**
 * 语言 fallback 配置
 */
export interface LanguageFallbackConfig {
  /**
   * 语言码 → locale 映射（检测到 `zh` 但资源是 `zh-CN` 时回退）
   * 不传使用内置 LANGUAGE_TO_LOCALE
   */
  map?: LanguageToLocaleMap

  /**
   * 最终兜底语言：候选全不命中时使用
   * @default 'en-US'
   */
  fallbackLng?: string
}

/* ============================================================
 * 复数
 * ============================================================ */

/**
 * 复数规则：根据数量返回 CLDR 复数类别（one/other/...）
 */
export type PluralRule = (count: number) => Intl.LDMLPluralRule | string

/* ============================================================
 * 事件
 * ============================================================ */

/**
 * i18n 事件映射
 */
export interface I18nEventMap {
  /** 语言切换 */
  'language:change': Language

  /** 资源添加 */
  'resource:add': { language: string; resources: Translations }

  /** 资源更新 */
  'resource:update': { language: string; key: string; value: any }

  /** 资源删除 */
  'resource:remove': { language: string; key: string }

  /** 资源合并 */
  'resource:merge': { language: string; resources: Translations }
}

/* ============================================================
 * 实例配置
 * ============================================================ */

/**
 * createI18n / new I18n 的配置
 */
export interface I18nOptions {
  /**
   * 初始语言（优先级最高，常用于受控模式）
   */
  language?: string

  /**
   * 默认语言（持久化与检测均无结果时使用）
   */
  defaultLanguage?: string

  /**
   * 初始资源
   */
  resources?: Resources

  /**
   * 持久化配置；默认不持久化
   */
  persistence?: PersistenceConfig

  /**
   * 语言检测：函数 / 函数数组 / 配置对象；不传默认使用 navigator 检测
   */
  detection?: DetectionOption

  /**
   * 语言 fallback 配置
   */
  fallback?: LanguageFallbackConfig
}
