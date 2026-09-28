/**
 * i18n/react 子路径统一导出
 * 封装 React Provider + hooks，与核心 i18n 同包，保证 React Context 单实例
 */

export * from './hooks'

export { I18nProvider } from './provider'

export type { I18nContextValue, I18nProviderProps } from './types'
