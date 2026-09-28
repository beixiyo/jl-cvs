import type { TranslateOptions, Translations } from '../core/types'
import type { BuildInterpolationParams, ExtractInterpolationFromValue } from './interpolation'
import type { PluralKeyPath, TranslationPaths } from './pathExtractor'

/**
 * 从资源中获取指定路径的翻译值类型
 */
type GetTranslationValue<
  T extends Translations,
  Path extends string,
> = Path extends `${infer Key}.${infer Rest}` ? Key extends keyof T ? T[Key] extends Translations ? GetTranslationValue<T[Key], Rest>
    : never
  : never
  : Path extends keyof T ? T[Path]
  : never

/**
 * 构建翻译选项类型
 * 根据键路径和翻译值，推导出需要的插值参数
 */
export type BuildTranslateOptions<
  T extends Translations,
  Path extends string,
> =
  & TranslateOptions
  & BuildInterpolationParams<
    ExtractInterpolationFromValue<GetTranslationValue<T, Path>>
  >

/**
 * 类型安全的翻译函数
 * 根据资源类型自动推导键路径和插值参数
 *
 * @example
 * ```ts
 * const resources = {
 *   common: {
 *     loading: 'Loading...',
 *     greeting: 'Hello {{name}}'
 *   }
 * } as const
 *
 * type T = TFunction<typeof resources>
 *
 * // 类型安全
 * t('common.loading') // ✅
 * t('common.greeting', { name: 'John' }) // ✅
 * t('common.invalid') // ❌ 类型错误
 * t('common.greeting') // ⚠️ 缺少 name 参数（但不会报错，因为参数是可选的）
 * ```
 */
export type TFunction<T extends Translations> = <
  Path extends TranslationPaths<T>,
>(
  key: Path,
  options?: BuildTranslateOptions<T, Path>,
) => any

/**
 * 支持复数的翻译函数类型
 * 允许使用复数键路径（如 'items.one', 'items.other'）
 */
export type TFunctionWithPlural<T extends Translations> = <
  Path extends PluralKeyPath<T>,
>(
  key: Path,
  options?: BuildTranslateOptions<T, Path>,
) => any
