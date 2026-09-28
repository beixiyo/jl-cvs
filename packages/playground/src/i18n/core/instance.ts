import { EventBus } from '@jl-org/tool'
import type { BuildTranslateOptions, TranslationPaths } from '../types'
import { detectLanguage, resolveDetection } from './detection'
import type { TextDirection } from './direction'
import { getLanguageDirection } from './direction'
import { buildLocaleChain } from './languageFallback'
import { resolvePersistence } from './persistence'
import { ResourceManager } from './resourceManager'
import { resolveKeyPath, TranslationEngine } from './translation'
import type {
  DetectionConfig,
  I18nEventMap,
  I18nOptions,
  Language,
  LanguageFallbackConfig,
  LanguageToLocaleMap,
  PersistenceAdapter,
  Resources,
  Translations,
} from './types'
import { LANGUAGES } from './types'

/**
 * 全局单例挂载 key
 * 用 Symbol.for 保证跨模块/跨打包实例共享同一注册表
 */
const GLOBAL_I18N_INSTANCE_KEY = Symbol.for('@@i18n_global_instance')

/**
 * i18n 实例类
 *
 * 继承 EventBus 以对外广播语言切换、资源增删改等事件
 * 内部把职责拆分到各专职模块：
 * - resourceManager 管资源树
 * - translationEngine 管 key 级 fallback / 复数 / 插值
 * - languageFallback 管 locale 链构建
 * - persistence 管语言持久化
 * - detection 管初始语言探测
 */
export class I18n extends EventBus<I18nEventMap> {
  private resourceManager = new ResourceManager()
  private translationEngine = new TranslationEngine()

  /** 当前生效语言（locale 链首项，缓存避免每次 t 重算） */
  private currentLanguage: Language

  /** 当前 locale fallback 链（缓存，t 时直接复用） */
  private localeChain: string[] = []

  /** 持久化解析结果：{ enabled, key, adapter } */
  private persistence: { enabled: boolean; key: string; adapter: PersistenceAdapter | null }

  /** 语言 fallback 配置：locale 映射 + 最终兜底语言 */
  private fallback: { map?: LanguageToLocaleMap; fallbackLng: string }

  /** 归一化后的语言检测配置 */
  private detection: DetectionConfig

  constructor(options: I18nOptions = {}) {
    super()

    /** 持久化配置解析（默认不持久化） */
    this.persistence = resolvePersistence(options.persistence)

    /** 语言 fallback 配置 */
    const fallbackConfig: LanguageFallbackConfig = options.fallback ?? {}
    this.fallback = {
      map: fallbackConfig.map,
      fallbackLng: fallbackConfig.fallbackLng ?? LANGUAGES.EN_US,
    }

    /** 语言检测配置归一化 */
    this.detection = resolveDetection(options.detection)

    /** 先加初始资源，再解析语言，保证 fallback 命中已有 locale */
    if (options.resources) {
      this.resourceManager.addResources(options.resources)
    }

    /**
     * 初始语言优先级：
     * 显式 language > 持久化值 > defaultLanguage > 检测 > fallbackLng > 内置 en-US
     */
    const rawLanguage = options.language
      || this.loadLanguageFromStorage()
      || options.defaultLanguage
      || detectLanguage(this.detection)
      || this.fallback.fallbackLng
      || LANGUAGES.EN_US

    /** 占位，随后由 recomputeChain 计算真实值 */
    this.currentLanguage = rawLanguage as Language
    this.recomputeChain(rawLanguage)
  }

  /**
   * 获取/创建全局单例实例
   */
  static getInstance(options?: I18nOptions): I18n {
    const g = globalThis as Record<symbol, unknown>

    if (!g[GLOBAL_I18N_INSTANCE_KEY]) {
      g[GLOBAL_I18N_INSTANCE_KEY] = new I18n(options)
    }

    return g[GLOBAL_I18N_INSTANCE_KEY] as I18n
  }

  /**
   * 重新计算 locale fallback 链
   *
   * 以 `rawLang` 为输入，结合资源存在性与 fallback 配置构建链，
   * 链首即为当前生效语言。资源变更或语言切换后均应调用以刷新缓存
   *
   * @param rawLang 原始语言码（可为语言码或 locale，如 'ja' / 'ja-JP'）
   */
  private recomputeChain(rawLang: string): void {
    this.localeChain = buildLocaleChain(
      rawLang,
      (locale) => this.resourceManager.has(locale),
      this.fallback,
    )
    this.currentLanguage = this.localeChain[0] as Language
  }

  /**
   * 翻译函数
   *
   * 支持通过泛型传入资源类型，实现类型安全的键路径与插值参数推导
   * 运行时使用缓存的 localeChain 做 key 级 fallback，无需每次重算
   *
   * @param key 键路径
   * @param options 翻译选项（含 keyPrefix / count / 插值变量等）
   */
  t<
    TSchema extends Translations = Translations,
    TKey extends TranslationPaths<TSchema> = TranslationPaths<TSchema>,
  >(key: TKey, options?: BuildTranslateOptions<TSchema, TKey>): string {
    const fullKey = resolveKeyPath(key, options?.keyPrefix)

    return this.translationEngine.translate({
      localeChain: this.localeChain,
      getResource: (locale) => this.resourceManager.get(locale),
      language: this.currentLanguage,
      key: fullKey,
      options,
    })
  }

  /**
   * 切换语言
   *
   * 解析为实际生效 locale 后比较，无变化则跳过；
   * 变化则刷新缓存、持久化并广播事件
   *
   * @param language 新语言/语言码
   */
  changeLanguage(language: Language): void {
    const previous = this.currentLanguage
    this.recomputeChain(language)

    if (this.currentLanguage === previous) {
      return
    }

    /** 持久化解析后的 locale，便于下次直接命中 */
    this.saveLanguageToStorage(this.currentLanguage)

    this.emit('language:change', this.currentLanguage)
  }

  /**
   * 获取当前生效语言
   */
  getLanguage(): Language {
    return this.currentLanguage
  }

  /**
   * 获取语言的文字方向（LTR / RTL）
   *
   * 不传 language 时返回当前生效语言的方向
   * 仅依据语言码判断、不操作 DOM，可用于设置 `<html dir>` 等
   *
   * @param language 语言/locale 码（可选，默认当前语言）
   * @returns 'rtl' 从右向左，否则 'ltr'
   */
  dir(language?: string): TextDirection {
    return getLanguageDirection(language ?? this.currentLanguage)
  }

  /**
   * 添加资源
   * @param resources 资源包
   */
  addResources(resources: Resources): void {
    this.resourceManager.addResources(resources)
    this.recomputeChain(this.currentLanguage)

    Object.entries(resources).forEach(([language, translations]) => {
      if (translations) {
        this.emit('resource:add', { language, resources: translations })
      }
    })
  }

  /**
   * 合并资源
   * @param resources 资源包
   * @param deep 是否深度合并
   */
  mergeResources(resources: Resources, deep: boolean = false): void {
    this.resourceManager.mergeResources(resources, deep)
    this.recomputeChain(this.currentLanguage)

    Object.entries(resources).forEach(([language, translations]) => {
      if (translations) {
        this.emit('resource:merge', { language, resources: translations })
      }
    })
  }

  /**
   * 更新指定键的翻译值
   * @param language 语言
   * @param key 键路径
   * @param value 新值
   */
  updateResource(language: Language, key: string, value: any): void {
    this.resourceManager.update(language, key, value)
    this.recomputeChain(this.currentLanguage)

    this.emit('resource:update', { language, key, value })
  }

  /**
   * 删除指定键的翻译
   * @param language 语言
   * @param key 键路径
   */
  removeResource(language: Language, key: string): void {
    this.resourceManager.remove(language, key)
    this.recomputeChain(this.currentLanguage)

    this.emit('resource:remove', { language, key })
  }

  /**
   * 获取资源
   *
   * 不传 language 时返回当前生效语言（locale 链首项）的资源；
   * 传 language 时直接取该语言资源
   *
   * @param language 语言（可选）
   */
  getResources(language?: Language): Translations | undefined {
    const locale = language ?? this.localeChain[0] ?? this.currentLanguage
    return this.resourceManager.get(locale)
  }

  /**
   * 获取所有已注册语言
   */
  getLanguages(): string[] {
    return this.resourceManager.getLanguages()
  }

  /**
   * 获取持久化存储键
   */
  getStorageKey(): string {
    return this.persistence.key
  }

  /**
   * 设置语言→locale fallback 映射（创建实例后仍可自定义）
   *
   * 更新映射后会重算 locale 链以即时生效
   * 复用全局单例、又想在 Provider 侧补设 fallback.map 时即走此方法
   *
   * @param map 语言码 → 地区 locale 列表
   */
  setLanguageToLocale(map: LanguageToLocaleMap): void {
    this.fallback = { ...this.fallback, map }
    this.recomputeChain(this.currentLanguage)
  }

  /**
   * 设置持久化适配器
   * @param adapter 持久化适配器
   */
  setStorageAdapter(adapter: PersistenceAdapter): void {
    this.persistence = { ...this.persistence, adapter }
  }

  /**
   * 启用持久化
   *
   * 若当前无适配器，回退到默认 localStorage 方案；启用后立即保存当前语言
   */
  enableStorage(): void {
    if (!this.persistence.adapter) {
      this.persistence = resolvePersistence({
        enabled: true,
        key: this.persistence.key,
      })
    }
    else {
      this.persistence = { ...this.persistence, enabled: true }
    }

    this.saveLanguageToStorage(this.currentLanguage)
  }

  /**
   * 禁用持久化
   *
   * 关闭开关并清除已存储的语言
   */
  disableStorage(): void {
    if (this.persistence.adapter) {
      try {
        this.persistence.adapter.remove(this.persistence.key)
      }
      catch (error) {
        console.warn('Failed to clear language from storage:', error)
      }
    }

    this.persistence = { ...this.persistence, enabled: false }
  }

  /**
   * 从持久化存储读取语言
   *
   * enabled 为 false 或 adapter 为 null 时为 no-op，异常安全降级
   */
  private loadLanguageFromStorage(): Language | null {
    if (!this.persistence.enabled || !this.persistence.adapter) {
      return null
    }

    try {
      const stored = this.persistence.adapter.get(this.persistence.key)
      if (typeof stored === 'string' && stored.length > 0) {
        return stored as Language
      }
    }
    catch (error) {
      console.warn('Failed to load language from storage:', error)
    }

    return null
  }

  /**
   * 写入语言到持久化存储
   *
   * enabled 为 false 或 adapter 为 null 时为 no-op，异常安全降级
   */
  private saveLanguageToStorage(language: Language): void {
    if (!this.persistence.enabled || !this.persistence.adapter) {
      return
    }

    try {
      this.persistence.adapter.set(this.persistence.key, language)
    }
    catch (error) {
      console.warn('Failed to save language to storage:', error)
    }
  }
}

/**
 * 创建 i18n 实例
 * @param options 配置
 */
export function createI18n(options?: I18nOptions): I18n {
  return new I18n(options)
}

/**
 * 获取全局 i18n 单例
 */
export function getI18n(): I18n {
  return I18n.getInstance()
}

export type { I18nOptions }
