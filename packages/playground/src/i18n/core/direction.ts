/**
 * 文字方向（LTR / RTL）
 *
 * 根据语言码判断书写方向，用于设置 `<html dir>`、CSS 逻辑属性等
 * 仅依据语言码判断，不涉及任何 DOM 操作
 */

/**
 * 从右向左（RTL）书写的语言基码集合
 * 以 BCP-47 主语言子标签（ISO 639）匹配，忽略地区后缀
 */
const RTL_LANGUAGES = new Set([
  'ar', // 阿拉伯语
  'arc', // 阿拉米语
  'ckb', // 中库尔德语（索拉尼）
  'dv', // 迪维希语（马尔代夫）
  'fa', // 波斯语
  'he', // 希伯来语
  'iw', // 希伯来语（旧码）
  'ks', // 克什米尔语
  'nqo', // 西非 N'Ko 文
  'prs', // 达里语（阿富汗波斯语）
  'ps', // 普什图语
  'sd', // 信德语
  'syr', // 叙利亚语
  'ug', // 维吾尔语
  'ur', // 乌尔都语
  'yi', // 意第绪语
])

/**
 * 取语言的文字方向
 *
 * @param language 语言/locale 码（如 'ar' / 'ar-EG' / 'en-US'）
 * @returns 'rtl' 表示从右向左书写，否则 'ltr'
 */
export function getLanguageDirection(language?: string): TextDirection {
  if (!language) {
    return 'ltr'
  }

  const base = language.toLowerCase().split('-')[0]

  return RTL_LANGUAGES.has(base)
    ? 'rtl'
    : 'ltr'
}

/**
 * 文字方向
 */
export type TextDirection = 'ltr' | 'rtl'
