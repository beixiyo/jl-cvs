import type { LanguageFallbackConfig, LanguageToLocaleMap } from './types'

/**
 * 语言码 → 地区 locale 的内置 fallback 映射（默认配置）
 *
 * - 语言码 → locale：浏览器常只返回语言码（如 `ja`、`en`），而资源按 locale（如 `ja-JP`、`en-US`）组织，
 *   此处配置「检测到 xx 且无 xx 资源时，尝试 xx-XX」
 * - locale → 语言码：在 {@link resolveLocaleCandidates} 中对 `ja-JP` 等自动加入 base `ja`，无 `ja-JP` 资源时尝试 `ja`
 * - `default`：最终兜底，无任何匹配时使用（如 `['en-US']`）
 */
export const LANGUAGE_TO_LOCALE: LanguageToLocaleMap = {
  ja: ['ja-JP'],
  en: ['en-US'],
  zh: ['zh-CN'],
  ko: ['ko-KR'],
  fr: ['fr-FR'],
  de: ['de-DE'],
  es: ['es-ES'],
  ru: ['ru-RU'],
  default: ['en-US'],
}

/**
 * 解析候选 locale 列表（按优先级排序、去重），用于「实例级语言选择」
 *
 * 顺序：
 * 1. `lang` 自身
 * 2. 地区码 → 语言码：如 `en-US` 追加 base `en`（`split('-')[0]`，仅当与 `lang` 不同）
 * 3. 语言码 → locale 扩展：若 base（或 `lang` 本身）在 `map` 中，追加 `map[base]` / `map[lang]` 的全部 locale
 * 4. 末尾追加 `fallbackLng`（若传入），再追加 `map.default` 的全部 locale
 *
 * 全程去重并保持上述顺序
 */
export function resolveLocaleCandidates(
  lang: string,
  map: LanguageToLocaleMap = LANGUAGE_TO_LOCALE,
  fallbackLng?: string,
): string[] {
  const candidates: string[] = []

  const push = (locale?: string) => {
    if (locale && !candidates.includes(locale)) candidates.push(locale)
  }

  const pushAll = (locales?: string[]) => {
    if (locales) {
      for (const locale of locales) push(locale)
    }
  }

  /** 1. lang 自身 */
  push(lang)

  /** 2. 地区码 → 语言码：en-US → en */
  const base = lang.split('-')[0]
  if (base !== lang) push(base)

  /** 3. 语言码 → locale：zh → zh-CN（base 优先，否则 lang 本身） */
  if (base !== lang && map[base]) pushAll(map[base])
  else if (map[lang]) pushAll(map[lang])

  /** 4. 末尾兜底：fallbackLng → map.default */
  push(fallbackLng)
  pushAll(map.default)

  return candidates
}

/**
 * 从候选列表中选出第一个 `hasResource` 命中的 locale；都不命中时返回 `candidates[0]` 兜底
 */
export function getFirstAvailableLocale(
  candidates: string[],
  hasResource: (locale: string) => boolean,
): string {
  for (const locale of candidates) {
    if (hasResource(locale)) return locale
  }
  return candidates[0]
}

/**
 * 构建「key 级 fallback」的 locale 链
 *
 * 先用 {@link resolveLocaleCandidates}（`fallbackLng` 默认 `'en-US'`）得到全部候选，
 * 再 filter 出 `hasResource` 命中者按序返回；若过滤后为空，则返回 `[candidates[0]]`
 *
 * 保证返回值非空，可逐级回退查找某个 key
 */
export function buildLocaleChain(
  lang: string,
  hasResource: (locale: string) => boolean,
  config?: LanguageFallbackConfig,
): string[] {
  const candidates = resolveLocaleCandidates(
    lang,
    config?.map,
    config?.fallbackLng ?? 'en-US',
  )

  const chain = candidates.filter(hasResource)

  return chain.length > 0
    ? chain
    : [candidates[0]]
}
