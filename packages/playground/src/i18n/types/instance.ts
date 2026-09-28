import type { I18n } from '../core/instance'
import type { Translations } from '../core/types'
import type { TFunction } from './builder'

/**
 * 类型增强的 i18n 实例
 * 通过泛型传入资源类型，提供类型安全的翻译函数
 *
 * @example
 * ```ts
 * const resources = {
 *   'zh-CN': {
 *     common: {
 *       loading: '加载中...',
 *       greeting: '你好 {{name}}'
 *     }
 *   }
 * } as const
 *
 * const i18n = getI18n()
 * i18n.addResources(resources)
 *
 * // 使用类型增强的 t 函数
 * const t = createTypedTFunction<typeof resources['zh-CN']>(i18n)
 *
 * // 类型安全
 * t('common.loading') // ✅
 * t('common.greeting', { name: 'John' }) // ✅
 * t('common.invalid') // ❌ 类型错误
 * ```
 */
export function createTypedTFunction<T extends Translations>(
  instance: I18n,
): TFunction<T> {
  return ((key, options) => {
    return instance.t<T>(key, options)
  }) as TFunction<T>
}
