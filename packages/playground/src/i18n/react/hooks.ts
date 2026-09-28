/**
 * React Hooks for i18n
 *
 * 重渲染优化要点：
 * - 翻译相关 hook（useI18n / useT / useLanguage）订阅 State Context，语言/资源变化时重渲染
 * - 纯方法 hook（useResources / useStorage）只订阅 API Context，语言切换时【不】重渲染
 */

import { use } from 'react'
import type { TFunction as RuntimeTFunction, TranslateOptions, Translations, TypedTFunction } from '../index'
import { getLanguageDirection } from '../index'
import { I18nApiContext, I18nStateContext } from './provider'
import type { I18nApiContextValue, I18nContextValue, I18nStateContextValue } from './types'

/**
 * 读取 API Context（内部使用）
 */
function useApiContext(): I18nApiContextValue {
  const ctx = use(I18nApiContext)
  if (ctx === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

/**
 * 读取 State Context（内部使用）
 */
function useStateContext(): I18nStateContextValue {
  const ctx = use(I18nStateContext)
  if (ctx === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

/**
 * useI18n Hook
 *
 * 返回合并后的完整上下文：实例 + 当前语言 + t + 全部方法
 * 同时消费 api + state，故语言/资源变化时会重渲染
 * 只需翻译/语言/方法时，优先用更细粒度的 useT / useLanguage / useResources / useStorage
 */
export function useI18n(): I18nContextValue {
  const api = useApiContext()
  const state = useStateContext()

  return {
    ...api,
    language: state.language,
    t: state.t,
  }
}

/**
 * useT Hook
 * 返回翻译函数，支持类型安全和运行时前缀注入
 *
 * @example
 * ```tsx
 * // 基础用法
 * const t = useT()
 * t('common.loading')
 *
 * // 类型安全
 * const t = useT<typeof zhCN>()
 * t('common.loading')
 *
 * // 运行时前缀（自动注入 keyPrefix）
 * const t = useT('common')
 * t('loading')                       // 实际解析 common.loading
 * t('greeting', { name: 'John' })    // 实际解析 common.greeting
 * t('title', { keyPrefix: '' })      // 显式清空前缀，访问外层 key
 * ```
 */
export function useT(prefix: string): (key: string, options?: TranslateOptions) => string
export function useT<TSchema extends Translations>(): TypedTFunction<TSchema>
export function useT(): RuntimeTFunction
export function useT(prefix?: string): any {
  /** 从 State Context 取 t：保证语言/资源变化时重渲染 */
  const { t } = useStateContext()

  /** 无前缀直接返回 t，类型安全由重载签名保证 */
  if (!prefix) {
    return t
  }

  /**
   * 有前缀：返回包装函数，运行时注入 keyPrefix
   * 显式传入的 options.keyPrefix 优先（支持传 '' 清空前缀以访问外层 key）
   */
  return (key: string, options?: TranslateOptions) => t(key, { ...options, keyPrefix: options?.keyPrefix ?? prefix })
}

/**
 * useLanguage Hook
 * 返回当前语言、切换方法与文字方向
 *
 * language / direction 取自 State Context（随切换重渲染），
 * changeLanguage 取自 API Context（引用稳定）
 * direction 为当前语言的文字方向，可直接用于 `<html dir={direction}>`；
 * 需要查任意语言的方向时用 `useI18n().i18n.dir(lng)`
 *
 * @example
 * ```tsx
 * const { language, changeLanguage, direction } = useLanguage()
 * ```
 */
export function useLanguage() {
  const { language } = useStateContext()
  const { changeLanguage } = useApiContext()

  return {
    language,
    changeLanguage,
    direction: getLanguageDirection(language),
  }
}

/**
 * useResources Hook
 * 只取 API Context 的资源方法
 *
 * 优化点：消费它的组件在语言切换时【不】重渲染
 *
 * @example
 * ```tsx
 * const { addResources, mergeResources, updateResource, removeResource } = useResources()
 * ```
 */
export function useResources() {
  const {
    addResources,
    mergeResources,
    updateResource,
    removeResource,
    getResources,
    getLanguages,
  } = useApiContext()

  return {
    addResources,
    mergeResources,
    updateResource,
    removeResource,
    getResources,
    getLanguages,
  }
}

/**
 * useStorage Hook
 * 只取 API Context 的存储方法
 *
 * 优化点：消费它的组件在语言切换时【不】重渲染
 *
 * @example
 * ```tsx
 * const { enableStorage, disableStorage, setStorageAdapter } = useStorage()
 * ```
 */
export function useStorage() {
  const { enableStorage, disableStorage, setStorageAdapter } = useApiContext()

  return {
    enableStorage,
    disableStorage,
    setStorageAdapter,
  }
}
