/**
 * Comps 组件库级 i18n 资源与专用 useT
 *
 * - 汇总已引入组件（common / uploader）的翻译资源，统一挂在 `comps` 命名空间下
 * - `useT` 自动注入 `comps.` 前缀，调用处写 `t('uploader.xxx')` 即可
 */

import { uploaderResources } from '../components/Uploader/locales'
import type { Translations } from './core/types'
import { LANGUAGES } from './core/types'
import { useLanguage, useT as useBaseT } from './react'
import { commonResources } from './resources/common'

/**
 * comps 命名空间内层资源类型
 */
export type CompsTranslations = NonNullable<typeof allResources['zh-CN']>['comps'] & Translations

/**
 * 合并所有组件的翻译资源
 */
export const allResources = {
  [LANGUAGES.ZH_CN]: {
    comps: {
      ...commonResources[LANGUAGES.ZH_CN],
      ...uploaderResources[LANGUAGES.ZH_CN],
    },
  },
  [LANGUAGES.ZH_TW]: {
    comps: {
      ...commonResources[LANGUAGES.ZH_TW],
      ...uploaderResources[LANGUAGES.ZH_TW],
    },
  },
  [LANGUAGES.EN_US]: {
    comps: {
      ...commonResources[LANGUAGES.EN_US],
      ...uploaderResources[LANGUAGES.EN_US],
    },
  },
  [LANGUAGES.JA_JP]: {
    comps: {
      ...commonResources[LANGUAGES.JA_JP],
      ...uploaderResources[LANGUAGES.JA_JP],
    },
  },
} as const

export { useLanguage }

/**
 * Comps 专用的类型安全 useT Hook
 *
 * 自动注入包级命名空间前缀 `comps`，使各组件无需手写前缀即可访问 comps 资源
 * - `useT()`            → 绑定到 `comps`，`t('uploader.placeholder')` 解析 `comps.uploader.placeholder`
 * - `useT('common')`    → 绑定到 `comps.common`
 */
export function useT(prefix: string): (key: string, options?: any) => string
export function useT(): any
export function useT(prefix?: string): any {
  return useBaseT(
    prefix
      ? `comps.${prefix}`
      : 'comps',
  )
}
