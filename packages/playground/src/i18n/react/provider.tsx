/**
 * I18nProvider 组件
 *
 * 重渲染优化为核心目标：
 * 1. 实例只创建一次（useConst），不因 resources/storage 等对象 identity 反复 new
 * 2. 拆分两个 Context 隔离重渲染：
 *    - I18nApiContext：稳定不变的方法集合 + 实例，引用恒稳定（消费方法的组件不会因语言切换重渲染）
 *    - I18nStateContext：随语言/资源变化的 { language, t }（仅消费翻译的组件才重渲染）
 */

import { useConst, useLatestCallback, useStable } from '@/hooks'
import { createContext, useEffect, useMemo, useState } from 'react'
import type { I18nOptions, Language, PersistenceAdapter, Resources } from '../index'
import { I18n } from '../index'
import type { I18nApiContextValue, I18nProviderProps, I18nStateContextValue } from './types'

/**
 * API Context：稳定的方法集合 + 实例
 * 引用在 Provider 生命周期内恒定，消费它的组件不会因语言/资源变化而重渲染
 */
export const I18nApiContext = createContext<I18nApiContextValue | undefined>(undefined)

/**
 * State Context：随语言/资源变化的状态
 * 仅消费它的组件（如 useT）会在语言切换或资源变更时重渲染
 */
export const I18nStateContext = createContext<I18nStateContextValue | undefined>(undefined)

/**
 * I18nProvider 组件
 *
 * @example
 * ```tsx
 * <I18nProvider resources={ resources } defaultLanguage="zh-CN">
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider(props: I18nProviderProps) {
  const {
    children,
    instance,
    resources: initialResources,
    defaultLanguage,
    persistence,
    detection,
    fallback,
    language: controlledLanguage,
  } = props

  /**
   * 稳定外部传入的复杂对象 props 引用
   * 避免父组件每次渲染传入新对象字面量导致下游 effect/计算反复触发
   */
  const stableResources = useStable(initialResources)
  const stablePersistence = useStable(persistence)
  const stableDetection = useStable(detection)
  const stableFallback = useStable(fallback)

  /**
   * 实例只读取一次
   *
   * 用 useConst 固化：仅在首次挂载时读取一次 props 构建 options，
   * 后续 props 对象 identity 变化【不会】触发重新读取（修复旧 thrash bug）
   * 受控语言、运行时改资源等场景由后续 effect / 方法处理，无需重建实例
   */
  const { i18n } = useConst<{ i18n: I18n }>(() => {
    /** 传入外部实例：直接使用，由调用方自行管理 */
    if (instance) {
      return { i18n: instance }
    }

    const options: I18nOptions = {}

    if (controlledLanguage) {
      options.language = controlledLanguage
    }
    if (defaultLanguage) {
      options.defaultLanguage = defaultLanguage
    }
    if (stablePersistence) {
      options.persistence = stablePersistence
    }
    if (stableDetection) {
      options.detection = stableDetection
    }
    if (stableFallback) {
      options.fallback = stableFallback
    }
    if (stableResources) {
      options.resources = stableResources
    }

    /**
     * 始终复用全局单例（不再因传了 props 就 createI18n 另起炉灶，避免 comps / tiptap
     * 等多消费方各持独立实例、语言切换不互通的问题）
     *
     * getInstance 仅在单例【尚未创建】时吃 options——所以「首个挂载的 Provider」
     * 会用自己的完整配置（resources / persistence / defaultLanguage / detection /
     * fallback）同步初始化单例：无首屏闪 key、persistence key 得以保留
     * 后续 Provider 拿到同一单例，options 被忽略，其资源 / fallback 改由下方挂载
     * 副作用补偿注入（见 applyInitialResources / applyLanguageToLocale）
     */
    return { i18n: I18n.getInstance(options) }
  })

  /**
   * 是否使用了全局单例（未传外部 instance 即为是）
   * 这是「挂载后是否需要补偿」的判据：外部 instance 由其自身管理，无需补偿；
   * 使用全局单例时则始终补设资源 / fallback 映射——因本 Provider 未必是首个挂载者
   * （只有首个才吃 options），补偿可保证挂载顺序无关、配置不丢
   */
  const usedGlobalSingleton = !instance

  /** 当前语言：随 'language:change' 事件更新，触发消费 state 的组件重渲染 */
  const [language, setLanguage] = useState<Language>(() => i18n.getLanguage())

  /**
   * 资源版本计数
   * 旧实现资源变更不重渲染——这里订阅 resource:add/merge/update/remove，
   * 自增 version 触发 t 引用刷新，使已渲染文案能跟随资源变更更新
   */
  const [version, setVersion] = useState(0)

  /** 使用全局单例且传了 fallback.map 时，挂载后补设映射（首个 Provider 已在 options 内处理，此处兜底后续 Provider） */
  const applyLanguageToLocale = useLatestCallback(() => {
    const map = stableFallback?.map

    if (usedGlobalSingleton && map) {
      i18n.setLanguageToLocale(map)
    }
  })

  /** 使用全局单例时，通过 props 传入的 resources 在挂载后补充注册（首个 Provider 已在创建时注入，此处兜底后续 Provider；重复 merge 同内容安全幂等） */
  const applyInitialResources = useLatestCallback(() => {
    if (usedGlobalSingleton && stableResources) {
      i18n.addResources(stableResources)
    }
  })

  /**
   * 仅挂载时执行一次的初始化补偿逻辑
   *
   * 注意时序：本 effect 在「事件订阅 effect」之前执行，applyInitialResources
   * 内部 addResources 会同步 emit 'resource:add'，此时订阅尚未建立，事件无人接收
   * 因此补偿后必须【显式】同步本地状态（version + language），保证依赖单例补偿
   * 资源的 Provider（非首个挂载者，options 被忽略）也能立即重渲染出译文，
   * 而不依赖事件订阅时序。重复同步幂等安全
   */
  useEffect(() => {
    applyLanguageToLocale()
    applyInitialResources()
    setVersion((v) => v + 1)
    setLanguage(i18n.getLanguage())
  }, [i18n])

  /** 语言切换事件处理：用 useLatestCallback 规避闭包陈旧（始终调最新 onLanguageChange） */
  const handleLanguageChange = useLatestCallback((next: Language) => {
    setLanguage(next)
    props.onLanguageChange?.(next)
  })

  /** 资源变更事件处理：自增 version 刷新 t 引用，并回调 onResourceUpdate */
  const handleResourceUpdate = useLatestCallback((lang: string) => {
    setVersion((v) => v + 1)
    props.onResourceUpdate?.(lang as Language, i18n.getResources(lang as Language)!)
  })

  /** 订阅实例事件：语言切换 + 资源增删改合 */
  useEffect(() => {
    const onLang = (next: Language) => handleLanguageChange(next)
    /** 资源类事件（增删改合）一律刷新 t，只需读取 language 字段 */
    const onResource = ({ language: lang }: { language: string }) => handleResourceUpdate(lang)
    const resourceEvents = ['resource:add', 'resource:merge', 'resource:update', 'resource:remove'] as const

    i18n.on('language:change', onLang)
    resourceEvents.forEach((event) => i18n.on(event, onResource))

    return () => {
      i18n.off('language:change', onLang)
      resourceEvents.forEach((event) => i18n.off(event, onResource))
    }
  }, [i18n])

  /** 受控语言：外部 language 变化时同步到实例（保留旧逻辑） */
  const syncControlledLanguage = useLatestCallback(() => {
    if (controlledLanguage != null && controlledLanguage !== i18n.getLanguage()) {
      i18n.changeLanguage(controlledLanguage)
    }
  })

  useEffect(() => {
    syncControlledLanguage()
  }, [controlledLanguage])

  /**
   * 稳定方法集合（全部用 useLatestCallback 包裹，引用恒稳定）
   * 这些包装函数始终调用最新逻辑，可安全放入只创建一次的 api 对象
   */
  const changeLanguage = useLatestCallback((next: Language) => i18n.changeLanguage(next))
  const addResources = useLatestCallback((resources: Resources) => i18n.addResources(resources))
  const mergeResources = useLatestCallback((resources: Resources, deep?: boolean) => i18n.mergeResources(resources, deep))
  const updateResource = useLatestCallback((lang: Language, key: string, value: any) => i18n.updateResource(lang, key, value))
  const removeResource = useLatestCallback((lang: Language, key: string) => i18n.removeResource(lang, key))
  const getResources = useLatestCallback((lang?: Language) => i18n.getResources(lang))
  const getLanguages = useLatestCallback(() => i18n.getLanguages())
  const enableStorage = useLatestCallback(() => i18n.enableStorage())
  const disableStorage = useLatestCallback(() => i18n.disableStorage())
  const setStorageAdapter = useLatestCallback((adapter: PersistenceAdapter) => i18n.setStorageAdapter(adapter))

  /**
   * API Context 值：用 useMemo([]) 固化为单一引用，永不变化
   * 依赖空数组——内部方法均为 useLatestCallback 稳定引用，i18n 为 useConst 稳定实例
   */
  const apiValue = useMemo<I18nApiContextValue>(
    () => ({
      i18n,
      changeLanguage,
      addResources,
      mergeResources,
      updateResource,
      removeResource,
      getResources,
      getLanguages,
      enableStorage,
      disableStorage,
      setStorageAdapter,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /**
   * State Context 值：language / version 变化时刷新
   * t 引用随 language、version 变化而变，从而消费 useT 的组件能重新翻译
   */
  const stateValue = useMemo<I18nStateContextValue>(
    () => ({
      language,
      t: i18n.t.bind(i18n),
    }),
    // version 用于在资源变更时刷新 t 引用
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n, language, version],
  )

  return (
    <I18nApiContext value={ apiValue }>
      <I18nStateContext value={ stateValue }>
        { children }
      </I18nStateContext>
    </I18nApiContext>
  )
}
