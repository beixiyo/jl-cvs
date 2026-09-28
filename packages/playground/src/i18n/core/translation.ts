/**
 * 翻译引擎
 *
 * 职责：在多 locale 资源链上完成 key 级 fallback 查找、CLDR 复数选择、
 * 命名空间/前缀解析与变量插值。本文件是「翻译契约」的实现层，
 * 公共类型一律从 ./types 导入，不在此处定义业务契约类型
 */

import type { PluralRule, TranslateOptions, Translations } from './types'

/**
 * 插值占位符匹配（{{var}}）
 * 提取为模块级常量，避免每次翻译都 new RegExp
 */
const INTERPOLATION_REGEX = /\{\{(\w+)\}\}/g

/**
 * 嵌套引用匹配（$t(key) 或 $t(key, {options})）
 * 非贪婪匹配到第一个 `)`；提取为模块级常量避免每次翻译都 new RegExp
 */
const NESTING_REGEX = /\$t\((.+?)\)/g

/**
 * 嵌套解析最大深度，超过即停止递归，防止 key 互相引用导致死循环
 */
const MAX_NESTING_DEPTH = 10

/**
 * 解析 key 的完整点路径
 *
 * 规则（优先级从高到低）：
 * 1. key 含命名空间分隔符 `:` → 取第一个 `:` 切分为 `ns` 与 `rest`，
 *    返回 `rest ? ns.rest : ns`（绝对路径，忽略 keyPrefix）
 * 2. keyPrefix 为非空字符串 → 返回 `keyPrefix.key`
 * 3. 其余情况 → 返回 key 原样
 *
 * 注意：keyPrefix 传 `''` 表示「清空前缀」，从根解析
 *
 * @param key 原始 key（可能带命名空间或需要拼前缀）
 * @param keyPrefix 绑定的前缀；`''` 表示从根解析
 * @returns 用于在资源树中逐层查找的完整点路径
 */
export function resolveKeyPath(key: string, keyPrefix?: string): string {
  const nsIndex = key.indexOf(':')

  if (nsIndex !== -1) {
    const ns = key.slice(0, nsIndex)
    const rest = key.slice(nsIndex + 1)

    return rest
      ? `${ns}.${rest}`
      : ns
  }

  if (typeof keyPrefix === 'string' && keyPrefix !== '') {
    return `${keyPrefix}.${key}`
  }

  return key
}

/**
 * 翻译引擎
 *
 * 无状态执行翻译，仅持有「自定义复数规则」注册表
 * 资源的获取由调用方通过 `getResource` 注入，引擎本身不耦合资源管理
 */
export class TranslationEngine {
  /**
   * 自定义复数规则注册表（language → rule）
   * 命中时优先于 Intl.PluralRules
   */
  private pluralRules = new Map<string, PluralRule>()

  /**
   * Intl.PluralRules 实例缓存（locale → 实例）
   * Intl 构造开销较大，按 locale 复用，避免每次复数选择都重新构造
   */
  private intlPluralRules = new Map<string, Intl.PluralRules>()

  /**
   * 注册自定义复数规则
   *
   * 翻译做复数选择时优先使用此处注册的规则，否则回退到 Intl.PluralRules
   *
   * @param language 语言/locale 码
   * @param rule 复数规则函数，返回 CLDR 复数类别（zero/one/two/few/many/other）
   */
  registerPluralRule(language: string, rule: PluralRule): void {
    this.pluralRules.set(language, rule)
  }

  /**
   * 翻译
   *
   * key 已是 {@link resolveKeyPath} 处理后的完整点路径
   * 入口方法，从嵌套深度 0 开始；完整流程见 {@link translateKey}
   *
   * @returns 翻译结果字符串；returnObjects 为真时返回原始对象（类型需调用方断言）
   */
  translate(params: TranslateParams): string {
    return this.translateKey(params, 0)
  }

  /**
   * 实际翻译逻辑（带嵌套深度）
   *
   * 流程：key 级 fallback 查找 → returnObjects 直出 → 复数选择 →
   * 字符串校验 → 嵌套 $t 解析 → 变量插值
   *
   * @param depth 当前嵌套深度，达到 MAX_NESTING_DEPTH 即停止递归
   */
  private translateKey(params: TranslateParams, depth: number): string {
    const { localeChain, getResource, language, key, options } = params

    const {
      defaultValue,
      count,
      returnObjects,
      // keyPrefix 已在 resolveKeyPath 阶段消化，不参与插值
      keyPrefix: _keyPrefix,
      ...interpolation
    } = options || {}

    /** key 级 fallback：第一个命中的 locale 即用其值 */
    const hit = this.lookup(localeChain, getResource, key)

    if (!hit) {
      return defaultValue ?? key
    }

    let value = hit.value
    const hitLocale = hit.locale

    /** 明确要求返回对象：直出原始值（类型不保证 string，由调用方断言） */
    if (returnObjects) {
      return value as string
    }

    /** 复数：命中值为对象且传入了 count 时，按复数形态键取字符串 */
    if (typeof count === 'number' && value && typeof value === 'object') {
      const form = this.selectPluralForm(language, hitLocale, count)

      value = value[form]
        ?? value.other
        ?? hit.value
    }

    /** 最终值非字符串 → 兜底 */
    if (typeof value !== 'string') {
      return defaultValue ?? key
    }

    /** 插值变量：其余字段 + count（若为数字） */
    const variables: Record<string, any> = { ...interpolation }
    if (typeof count === 'number') {
      variables.count = count
    }

    /** 先解析嵌套 $t(...)，再做本级 {{var}} 插值 */
    const nested = this.resolveNesting(
      value,
      { localeChain, getResource, language },
      variables,
      depth,
    )

    return this.interpolate(nested, variables)
  }

  /**
   * key 级 fallback 查找
   *
   * 按 localeChain 顺序，对每个 locale 取资源并逐层查找 key，
   * 第一个找到的命中即返回（携带命中 locale）
   *
   * @returns 命中信息或 undefined（全链未命中）
   */
  private lookup(
    localeChain: string[],
    getResource: (locale: string) => Translations | undefined,
    key: string,
  ): { value: any; locale: string } | undefined {
    const path = key.split('.')

    for (const locale of localeChain) {
      const resource = getResource(locale)
      if (!resource) {
        continue
      }

      const found = this.resolvePath(resource, path)
      if (found.found) {
        return { value: found.value, locale }
      }
    }

    return undefined
  }

  /**
   * 在单个资源树上按点路径逐层查找
   */
  private resolvePath(
    resource: Translations,
    path: string[],
  ): { value: any; found: boolean } {
    let current: any = resource

    for (const segment of path) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment]
      }
      else {
        return { value: undefined, found: false }
      }
    }

    return { value: current, found: true }
  }

  /**
   * 选择复数形态键
   *
   * 优先使用已注册的自定义规则（按 language 查找），
   * 否则用命中 locale 构造 Intl.PluralRules；任一步骤抛错均回退 'other'
   *
   * @param language 当前语言（用于自定义规则查找）
   * @param locale 命中 locale（用于 Intl.PluralRules）
   * @param count 数量
   */
  private selectPluralForm(
    language: string,
    locale: string,
    count: number,
  ): string {
    const custom = this.pluralRules.get(language)
    if (custom) {
      try {
        return custom(count)
      }
      catch {
        return 'other'
      }
    }

    try {
      let rules = this.intlPluralRules.get(locale)
      if (!rules) {
        rules = new Intl.PluralRules(locale)
        this.intlPluralRules.set(locale, rules)
      }

      return rules.select(count)
    }
    catch {
      return 'other'
    }
  }

  /**
   * 变量插值
   *
   * 用预编译的模块级正则替换 {{var}}；未提供的变量保留原样
   */
  private interpolate(template: string, variables: Record<string, any>): string {
    return template.replace(INTERPOLATION_REGEX, (match, name) => {
      const value = variables[name]

      return typeof value !== 'undefined'
        ? String(value)
        : match
    })
  }

  /**
   * 解析嵌套引用 $t(key) / $t(key, {options})
   *
   * 把值中的 $t(...) 替换为被引用 key 的翻译结果，支持递归（被引用值可再含 $t）
   * - 父级插值变量自动透传给子级，故 `$t(child)` 能用到父级的 {{var}}
   * - `$t(key, {"count": 2})` 可为子级单独指定选项（如不同 count），子级选项优先
   * - 被引用 key 从根解析（绝对路径，支持 `ns:key`）
   * - 深度达到 MAX_NESTING_DEPTH 即停止递归，避免 key 互相引用造成死循环
   */
  private resolveNesting(
    text: string,
    ctx: {
      localeChain: string[]
      getResource: (locale: string) => Translations | undefined
      language: string
    },
    parentVars: Record<string, any>,
    depth: number,
  ): string {
    /** 无嵌套或过深时直接返回，省去正则开销 */
    if (depth >= MAX_NESTING_DEPTH || !text.includes('$t(')) {
      return text
    }

    return text.replace(NESTING_REGEX, (_match, inner: string) => {
      const { key, options } = this.parseNestingArg(inner, parentVars)

      /** 子级继承父级变量，子级自身选项优先 */
      const childOptions = { ...parentVars, ...options }

      return this.translateKey(
        {
          ...ctx,
          key: resolveKeyPath(key),
          options: childOptions,
        },
        depth + 1,
      )
    })
  }

  /**
   * 解析 $t(...) 括号内参数为 { key, options }
   *
   * 形如 `key` 或 `key, {"count": 2}`；选项串先用父级变量插值再 JSON 解析，
   * 以支持 `$t(key, {"count": {{n}} })` 这种把父级变量透传给子级的写法
   */
  private parseNestingArg(
    inner: string,
    parentVars: Record<string, any>,
  ): { key: string; options: Record<string, any> } {
    const commaIndex = inner.indexOf(',')

    if (commaIndex === -1) {
      return { key: inner.trim(), options: {} }
    }

    const key = inner.slice(0, commaIndex).trim()
    const rawOptions = inner.slice(commaIndex + 1).trim()

    try {
      const interpolated = this.interpolate(rawOptions, parentVars)
      return { key, options: JSON.parse(interpolated) }
    }
    catch {
      /** 选项解析失败则忽略选项，仅按 key 解析 */
      return { key, options: {} }
    }
  }
}

/* ============================================================
 * 类型
 * ============================================================ */

/**
 * translate / translateKey 的入参
 */
interface TranslateParams {
  /** locale fallback 链，按序查找 */
  localeChain: string[]

  /** 按 locale 取该语言资源树 */
  getResource: (locale: string) => Translations | undefined

  /** 当前语言（用于自定义复数规则查找） */
  language: string

  /** 完整点路径 key */
  key: string

  /** 翻译选项 */
  options?: TranslateOptions
}
