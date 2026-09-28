/**
 * React 封装层类型定义
 * 公共类型一律从核心包 'i18n' 导入，禁止重复定义
 */

import type { ReactNode } from 'react'
import type {
  DetectionOption,
  I18n,
  Language,
  LanguageFallbackConfig,
  PersistenceAdapter,
  PersistenceConfig,
  Resources,
  TranslationPaths,
  Translations,
} from '../index'

/**
 * I18nProvider 组件属性
 */
export interface I18nProviderProps {
  /**
   * 子组件
   */
  children: ReactNode

  /**
   * i18n 实例（可选，不传则使用全局单例；首个挂载的 Provider 以其配置初始化单例）
   */
  instance?: I18n

  /**
   * 初始资源（可选，会合并进全局单例；后续 Provider 也会在挂载时补充注册）
   */
  resources?: Resources

  /**
   * 默认语言（可选，仅在首个 Provider 初始化全局单例时生效）
   */
  defaultLanguage?: Language

  /**
   * 持久化配置（可选，含 key，仅在首个 Provider 初始化全局单例时生效）
   */
  persistence?: PersistenceConfig

  /**
   * 语言检测配置（可选，仅在首个 Provider 初始化全局单例时生效）
   */
  detection?: DetectionOption

  /**
   * 语言 fallback 配置（可选，仅在首个 Provider 初始化全局单例时生效；其中 fallback.map 后续 Provider 也会补设）
   */
  fallback?: LanguageFallbackConfig

  /**
   * 受控语言（可选）
   * 传入时以 app 侧语言为准，会同步到 i18n 实例，用于与 i18next 等外部 i18n 联动
   */
  language?: Language

  /**
   * 语言切换回调
   */
  onLanguageChange?: (language: Language) => void

  /**
   * 资源更新回调
   */
  onResourceUpdate?: (language: Language, resources: Translations) => void
}

/**
 * API Context 值类型
 * 稳定不变的方法集合 + i18n 实例，引用在 Provider 生命周期内恒定
 * 消费它的组件不会因语言/资源变化而重渲染
 */
export interface I18nApiContextValue {
  /**
   * i18n 实例
   */
  i18n: I18n

  /**
   * 切换语言
   */
  changeLanguage: (language: Language) => void

  /**
   * 添加资源
   */
  addResources: (resources: Resources) => void

  /**
   * 合并资源
   */
  mergeResources: (resources: Resources, deep?: boolean) => void

  /**
   * 更新资源
   */
  updateResource: (language: Language, key: string, value: any) => void

  /**
   * 删除资源
   */
  removeResource: (language: Language, key: string) => void

  /**
   * 获取资源
   */
  getResources: (language?: Language) => Translations | undefined

  /**
   * 获取所有支持的语言
   */
  getLanguages: () => string[]

  /**
   * 启用存储
   */
  enableStorage: () => void

  /**
   * 禁用存储
   */
  disableStorage: () => void

  /**
   * 设置存储适配器
   */
  setStorageAdapter: (adapter: PersistenceAdapter) => void
}

/**
 * State Context 值类型
 * 随语言/资源变化的状态，仅消费它的组件会在变更时重渲染
 */
export interface I18nStateContextValue {
  /**
   * 当前语言
   */
  language: Language

  /**
   * 翻译函数（引用随语言/资源变化而变，消费者可重新翻译）
   */
  t: I18n['t']
}

/**
 * I18nContext 值类型
 * 合并 api（稳定方法集合）与 state（随语言/资源变化的字段）后的对外形态
 */
export interface I18nContextValue {
  /**
   * i18n 实例
   */
  i18n: I18n

  /**
   * 当前语言
   */
  language: Language

  /**
   * 翻译函数（引用随语言/资源变化而变，消费者可重新翻译）
   */
  t: I18n['t']

  /**
   * 切换语言
   */
  changeLanguage: (language: Language) => void

  /**
   * 添加资源
   */
  addResources: (resources: Resources) => void

  /**
   * 合并资源
   */
  mergeResources: (resources: Resources, deep?: boolean) => void

  /**
   * 更新资源
   */
  updateResource: (language: Language, key: string, value: any) => void

  /**
   * 删除资源
   */
  removeResource: (language: Language, key: string) => void

  /**
   * 获取资源
   */
  getResources: (language?: Language) => Translations | undefined

  /**
   * 获取所有支持的语言
   */
  getLanguages: () => string[]

  /**
   * 启用存储
   */
  enableStorage: () => void

  /**
   * 禁用存储
   */
  disableStorage: () => void

  /**
   * 设置存储适配器
   */
  setStorageAdapter: (adapter: PersistenceAdapter) => void
}

/**
 * 从 Translations 类型中提取指定前缀下的子类型
 * 支持 readonly 类型
 */
export type GetSubTranslations<
  T extends Translations,
  Prefix extends string,
> = Prefix extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T ? T[Key] extends Translations | Readonly<Translations> ? GetSubTranslations<T[Key] & Translations, Rest>
    : never
  : never
  : Prefix extends keyof T ? T[Prefix] extends Translations | Readonly<Translations> ? T[Prefix] & Translations
    : never
  : never

/**
 * 提取带前缀的路径类型
 */
export type PrefixedPaths<
  T extends Translations,
  Prefix extends string,
> = GetSubTranslations<T, Prefix> extends infer SubT ? SubT extends Translations ? TranslationPaths<SubT>
  : never
  : never
