/**
 * 语言持久化
 *
 * 提供多种内置持久化方案（localStorage / sessionStorage / cookie / queryString / memory），
 * 同时支持外部传入自定义函数（get/set）或自定义适配器，默认不持久化
 *
 * 所有内置适配器对 SSR / 不可用环境安全降级：
 * - 环境不可用时 get 返回 null，set/remove 静默忽略
 * - 读写均包 try/catch，异常时 warn 并降级
 */

import type { PersistenceAdapter, PersistenceConfig, PersistenceStrategy } from './types'

/* ============================================================
 * 内置适配器工厂
 * ============================================================ */

/**
 * Web Storage（localStorage / sessionStorage）公共适配器工厂
 *
 * 二者 API 完全一致、仅底层存储对象不同，故抽出公共实现，避免重复：
 * - SSR / 隐私模式 / 配额满等不可用场景安全降级
 * - get/set/remove 读写均包 try/catch，异常时 warn 并降级
 *
 * @param type 'localStorage' | 'sessionStorage'，决定底层存储对象与 warn 前缀
 */
function webStorageAdapter(type: 'localStorage' | 'sessionStorage'): PersistenceAdapter {
  /** 取底层存储对象；SSR 下为 undefined（访问本身可能抛错，故调用方均置于 try 内） */
  const getStore = (): Storage | undefined =>
    typeof window === 'undefined'
      ? undefined
      : window[type]

  const isAvailable = (): boolean => {
    try {
      const store = getStore()
      if (!store) {
        return false
      }
      const testKey = '__i18n_persistence_test__'
      store.setItem(testKey, '1')
      store.removeItem(testKey)
      return true
    }
    catch {
      return false
    }
  }

  return {
    get(key) {
      if (!isAvailable()) {
        return null
      }
      try {
        return getStore()!.getItem(key)
      }
      catch (error) {
        console.warn(`[i18n] ${type} get "${key}" failed:`, error)
        return null
      }
    },

    set(key, value) {
      if (!isAvailable()) {
        return
      }
      try {
        getStore()!.setItem(key, value)
      }
      catch (error) {
        console.warn(`[i18n] ${type} set "${key}" failed:`, error)
      }
    },

    remove(key) {
      if (!isAvailable()) {
        return
      }
      try {
        getStore()!.removeItem(key)
      }
      catch (error) {
        console.warn(`[i18n] ${type} remove "${key}" failed:`, error)
      }
    },
  }
}

/**
 * localStorage 持久化适配器
 * - SSR / 隐私模式 / 配额满等不可用场景安全降级
 */
export function localStorageAdapter(): PersistenceAdapter {
  return webStorageAdapter('localStorage')
}

/**
 * sessionStorage 持久化适配器
 * - 行为同 localStorage，但仅在当前会话有效
 */
export function sessionStorageAdapter(): PersistenceAdapter {
  return webStorageAdapter('sessionStorage')
}

/**
 * cookie 持久化适配器
 * - 传入的 key 直接作为 cookie 名
 * - SSR / document 不可用时安全降级
 */
export function cookieAdapter(): PersistenceAdapter {
  const isAvailable = (): boolean => typeof document !== 'undefined' && typeof document.cookie === 'string'

  return {
    get(key) {
      if (!isAvailable()) {
        return null
      }
      try {
        const name = `${encodeURIComponent(key)}=`
        const segments = document.cookie
          ? document.cookie.split('; ')
          : []

        for (const segment of segments) {
          if (segment.startsWith(name)) {
            return decodeURIComponent(segment.slice(name.length))
          }
        }
        return null
      }
      catch (error) {
        console.warn(`[i18n] cookie get "${key}" failed:`, error)
        return null
      }
    },

    set(key, value) {
      if (!isAvailable()) {
        return
      }
      try {
        const encodedKey = encodeURIComponent(key)
        const encodedValue = encodeURIComponent(value)
        /** 一年有效期，根路径，SameSite=Lax 兼顾安全与可用性 */
        const maxAge = 60 * 60 * 24 * 365
        document.cookie = `${encodedKey}=${encodedValue}; path=/; max-age=${maxAge}; SameSite=Lax`
      }
      catch (error) {
        console.warn(`[i18n] cookie set "${key}" failed:`, error)
      }
    },

    remove(key) {
      if (!isAvailable()) {
        return
      }
      try {
        const encodedKey = encodeURIComponent(key)
        /** 设置过期时间为 0 即删除 */
        document.cookie = `${encodedKey}=; path=/; max-age=0; SameSite=Lax`
      }
      catch (error) {
        console.warn(`[i18n] cookie remove "${key}" failed:`, error)
      }
    },
  }
}

/**
 * queryString 持久化适配器
 * - 传入的 key 作为 URL query 参数名
 * - set 使用 history.replaceState 更新 URL，不触发刷新
 * - SSR / location / history 不可用时安全降级
 */
export function queryStringAdapter(): PersistenceAdapter {
  const isAvailable = (): boolean => typeof window !== 'undefined' && typeof window.location !== 'undefined'

  const replaceUrl = (params: URLSearchParams): void => {
    const search = params.toString()
    const newUrl = `${window.location.pathname}${
      search
        ? `?${search}`
        : ''
    }${window.location.hash}`

    if (typeof window.history?.replaceState === 'function') {
      window.history.replaceState(window.history.state, '', newUrl)
    }
  }

  return {
    get(key) {
      if (!isAvailable()) {
        return null
      }
      try {
        const params = new URLSearchParams(window.location.search)
        return params.get(key)
      }
      catch (error) {
        console.warn(`[i18n] queryString get "${key}" failed:`, error)
        return null
      }
    },

    set(key, value) {
      if (!isAvailable()) {
        return
      }
      try {
        const params = new URLSearchParams(window.location.search)
        params.set(key, value)
        replaceUrl(params)
      }
      catch (error) {
        console.warn(`[i18n] queryString set "${key}" failed:`, error)
      }
    },

    remove(key) {
      if (!isAvailable()) {
        return
      }
      try {
        const params = new URLSearchParams(window.location.search)
        params.delete(key)
        replaceUrl(params)
      }
      catch (error) {
        console.warn(`[i18n] queryString remove "${key}" failed:`, error)
      }
    },
  }
}

/**
 * 内存持久化适配器
 * - 进程内 Map，刷新即丢失
 * - 适用于 SSR / 测试 / 不希望落地的场景
 */
export function memoryAdapter(): PersistenceAdapter {
  const store = new Map<string, string>()

  return {
    get(key) {
      return store.has(key)
        ? store.get(key)!
        : null
    },

    set(key, value) {
      store.set(key, value)
    },

    remove(key) {
      store.delete(key)
    },
  }
}

/* ============================================================
 * 策略 → 适配器
 * ============================================================ */

/**
 * 按内置方案返回对应适配器实例
 */
export function createPersistenceAdapter(strategy: PersistenceStrategy): PersistenceAdapter {
  switch (strategy) {
    case 'sessionStorage':
      return sessionStorageAdapter()
    case 'cookie':
      return cookieAdapter()
    case 'queryString':
      return queryStringAdapter()
    case 'memory':
      return memoryAdapter()
    case 'localStorage':
    default:
      return localStorageAdapter()
  }
}

/* ============================================================
 * 配置解析
 * ============================================================ */

/**
 * 解析持久化配置为最终可用的 { enabled, key, adapter }
 *
 * 适配器优先级：
 * 1. 自定义 `get`/`set` 函数 —— 组装为适配器（remove 为空实现）
 * 2. 自定义 `adapter`
 * 3. 内置 `strategy`（默认 'localStorage'）
 *
 * 当 `enabled` 为 false（默认）时，`adapter` 返回 null，表示不持久化
 */
export function resolvePersistence(config?: PersistenceConfig): ResolvedPersistence {
  const enabled = config?.enabled ?? false
  const strategy = config?.strategy ?? 'localStorage'

  /**
   * queryString 方案默认用干净的 'lang' 参数名（queryKey > 通用 key > 'lang'），
   * 避免通用默认 key 'i18n:lang' 的 ':' 被编码成 %3A；其余方案沿用通用 key
   */
  const key = strategy === 'queryString'
    ? (config?.queryKey ?? config?.key ?? 'lang')
    : (config?.key ?? 'i18n:lang')

  if (!enabled) {
    return { enabled, key, adapter: null }
  }

  return { enabled, key, adapter: resolveAdapter(config) }
}

/**
 * 根据配置优先级解析出实际适配器
 */
function resolveAdapter(config?: PersistenceConfig): PersistenceAdapter {
  if (config?.get && config?.set) {
    const { get, set } = config
    return {
      get,
      set,
      remove() {
        /** 自定义 get/set 模式下不提供删除语义，空实现 */
      },
    }
  }

  if (config?.adapter) {
    return config.adapter
  }

  return createPersistenceAdapter(config?.strategy ?? 'localStorage')
}

/* ============================================================
 * 类型
 * ============================================================ */

/**
 * resolvePersistence 的返回结构
 */
interface ResolvedPersistence {
  /** 是否启用持久化 */
  enabled: boolean

  /** 最终使用的存储键名 */
  key: string

  /** 解析出的适配器；未启用时为 null */
  adapter: PersistenceAdapter | null
}
