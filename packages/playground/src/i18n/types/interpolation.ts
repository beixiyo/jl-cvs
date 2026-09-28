/**
 * 从字符串中提取插值变量名
 * 支持 {{variable}} 格式的插值语法
 *
 * @example
 * ```ts
 * type Vars = ExtractInterpolationVars<'Hello {{name}}, you have {{count}} messages'>
 * // 结果: 'name' | 'count'
 * ```
 */
export type ExtractInterpolationVars<
  T extends string,
  Acc extends string[] = [],
> = T extends `${string}{{${infer Var}}}${infer Rest}` ? Var extends '' ? ExtractInterpolationVars<Rest, Acc>
  : ExtractInterpolationVars<Rest, [...Acc, Var]>
  : T extends `${string}{{${infer Var}}` ? Var extends '' ? Acc[number]
    : [...Acc, Var][number]
  : Acc[number]

/**
 * 从翻译值中提取插值变量
 * 如果值是字符串，提取其中的插值变量；如果是对象（复数形式），提取所有值的插值变量
 */
export type ExtractInterpolationFromValue<T> = T extends string ? ExtractInterpolationVars<T>
  : T extends Record<string, string> ? ExtractInterpolationVars<T[keyof T]>
  : never

/**
 * 构建插值参数类型
 * 将插值变量名转换为对象类型，所有属性都是可选的
 *
 * @example
 * ```ts
 * type Params = BuildInterpolationParams<'name' | 'count'>
 * // 结果: { name?: any; count?: any }
 * ```
 */
export type BuildInterpolationParams<Vars extends string> = {
  [K in Vars]?: any
}
