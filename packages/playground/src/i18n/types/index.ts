/**
 * TypeScript 类型推导系统
 * 提供完整的类型安全支持，包括键路径推导、插值参数推导等
 */

export type { BuildTranslateOptions, TFunction, TFunctionWithPlural } from './builder'

export { createTypedTFunction } from './instance'

export type { BuildInterpolationParams, ExtractInterpolationFromValue, ExtractInterpolationVars } from './interpolation'

export type { PathExtractor, PluralKeyPath, TranslationPaths } from './pathExtractor'
