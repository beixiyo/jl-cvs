import type { Resources, Translations } from './types'

/**
 * 资源管理器类
 * 负责管理多语言的翻译资源，支持增删改查和合并操作
 */
export class ResourceManager {
  private resources: Map<string, Translations> = new Map()

  /**
   * 添加或更新语言资源
   * @param language 语言代码
   * @param translations 翻译资源
   */
  add(language: string, translations: Translations): void {
    const existing = this.resources.get(language)
    if (existing) {
      /** 如果已存在，进行浅合并 */
      this.resources.set(language, { ...existing, ...translations })
    }
    else {
      this.resources.set(language, { ...translations })
    }
  }

  /**
   * 更新指定键的翻译值
   * @param language 语言代码
   * @param key 键路径（支持点分隔的嵌套路径，如 'common.loading'）
   * @param value 新值
   */
  update(language: string, key: string, value: any): void {
    const translations = this.resources.get(language)
    if (!translations) {
      throw new Error(`Language "${language}" not found`)
    }

    const keys = key.split('.')
    const lastKey = keys.pop()!

    let current: any = translations
    for (const k of keys) {
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }

    current[lastKey] = value
  }

  /**
   * 删除指定键的翻译
   * @param language 语言代码
   * @param key 键路径
   */
  remove(language: string, key: string): void {
    const translations = this.resources.get(language)
    if (!translations) {
      return
    }

    const keys = key.split('.')
    const lastKey = keys.pop()!

    let current: any = translations
    for (const k of keys) {
      if (!current[k] || typeof current[k] !== 'object') {
        return // 路径不存在
      }
      current = current[k]
    }

    delete current[lastKey]
  }

  /**
   * 获取指定语言的翻译资源
   * @param language 语言代码
   * @returns 翻译资源，不存在返回 undefined
   */
  get(language: string): Translations | undefined {
    return this.resources.get(language)
  }

  /**
   * 检查语言是否存在
   * @param language 语言代码
   */
  has(language: string): boolean {
    return this.resources.has(language)
  }

  /**
   * 合并资源（支持深度合并）
   * @param language 语言代码
   * @param translations 要合并的翻译资源
   * @param deep 是否深度合并（默认 false）
   */
  merge(language: string, translations: Translations, deep: boolean = false): void {
    const existing = this.resources.get(language)

    if (!existing) {
      this.resources.set(
        language,
        deep
          ? this.deepMerge({}, translations)
          : { ...translations },
      )
      return
    }

    this.resources.set(
      language,
      deep
        ? this.deepMerge(existing, translations)
        : { ...existing, ...translations },
    )
  }

  /**
   * 深度合并对象
   * @param target 目标对象
   * @param source 源对象
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key]
        const targetValue = result[key]

        if (
          typeof sourceValue === 'object'
          && sourceValue !== null
          && !Array.isArray(sourceValue)
          && typeof targetValue === 'object'
          && targetValue !== null
          && !Array.isArray(targetValue)
        ) {
          /** 递归合并嵌套对象 */
          result[key] = this.deepMerge(targetValue, sourceValue)
        }
        else {
          /** 直接覆盖 */
          result[key] = sourceValue
        }
      }
    }

    return result
  }

  /**
   * 批量添加资源
   * @param resources 资源包（多语言）
   */
  addResources(resources: Resources): void {
    Object.entries(resources).forEach(([language, translations]) => {
      if (translations) {
        this.add(language, translations)
      }
    })
  }

  /**
   * 批量合并资源
   * @param resources 资源包
   * @param deep 是否深度合并
   */
  mergeResources(resources: Resources, deep: boolean = false): void {
    Object.entries(resources).forEach(([language, translations]) => {
      if (translations) {
        this.merge(language, translations, deep)
      }
    })
  }

  /**
   * 获取所有支持的语言列表
   */
  getLanguages(): string[] {
    return Array.from(this.resources.keys())
  }

  /**
   * 清空所有资源
   */
  clear(): void {
    this.resources.clear()
  }

  /**
   * 删除指定语言的资源
   * @param language 语言代码
   */
  removeLanguage(language: string): boolean {
    return this.resources.delete(language)
  }

  /**
   * 获取资源数量
   */
  size(): number {
    return this.resources.size
  }
}
