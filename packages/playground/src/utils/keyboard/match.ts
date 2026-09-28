/**
 * 键盘事件匹配：按键、修饰键、IME 组字状态的统一判定
 *
 * 所有键盘 hook 共用这里的判定，避免各写一份组合键逻辑导致语义漂移
 */

import { getPlatformModifier } from './platform'

/**
 * 判断事件的按键是否命中期望
 *
 * - 只传 `key` 时按逻辑键名匹配（`KeyboardEvent.key`），大小写不敏感
 * - 传了 `code` 时只按物理键位匹配（`KeyboardEvent.code`），`key` 不参与判定：
 *   macOS 上 Option 会改写 `key` 的字符（Option + A 得到 `å`），带 Alt 的字母组合必须用 `code`
 * - 传入数组表示命中其一；传入空数组表示不匹配任何按键
 * - 两者都不传表示匹配所有按键
 */
export function matchesKey(event: KeyEventLike, expected: KeyExpectation): boolean {
  const { key, code } = expected

  if (code !== undefined) return includesValue(code, event.code)

  if (key !== undefined) return includesValue(key, event.key, true)

  return true
}

/**
 * 判断事件的修饰键是否满足期望
 *
 * 字段省略（`undefined`）表示不限制该修饰键，显式 `false` 表示要求未按下
 */
export function matchesModifiers(event: ModifierEventLike, expected: ModifierExpectation): boolean {
  const { ctrl, shift, alt, meta } = resolveModifiers(expected)

  return isSatisfied(event.ctrlKey, ctrl)
    && isSatisfied(event.shiftKey, shift)
    && isSatisfied(event.altKey, alt)
    && isSatisfied(event.metaKey, meta)
}

/**
 * 把 `mod` 展开成当前平台真实的 `ctrl` / `meta` 期望
 *
 * `mod` 为真时以平台主修饰键为准，覆盖同时传入的 `ctrl` / `meta`
 */
export function resolveModifiers(expected: ModifierExpectation): ResolvedModifiers {
  const { mod, ctrl, shift, alt, meta } = expected

  if (!mod) return { ctrl, shift, alt, meta }

  const platform = getPlatformModifier()
  return { ctrl: platform.ctrl, shift, alt, meta: platform.meta }
}

/**
 * 事件是否处于 IME 组字过程中
 *
 * 组字期间的 Enter / Escape 属于输入法的确认与取消，不应触发业务快捷键；
 * `keyCode === 229` 是部分浏览器在组字时的兜底标记
 */
export function isComposingEvent(event: ComposingEventLike): boolean {
  return !!event.isComposing || event.keyCode === IME_KEY_CODE
}

function includesValue(
  expected: string | readonly string[],
  actual: string | undefined,
  ignoreCase = false,
): boolean {
  if (actual === undefined) return false

  const normalize = (value: string) =>
    ignoreCase
      ? value.toLowerCase()
      : value
  const target = normalize(actual)
  const list = typeof expected === 'string'
    ? [expected]
    : expected

  return list.some((item) => normalize(item) === target)
}

function isSatisfied(actual: boolean, expected: boolean | undefined): boolean {
  return expected === undefined || actual === expected
}

const IME_KEY_CODE = 229

/** 参与按键匹配的最小事件形状 */
export type KeyEventLike = {
  key?: string
  code?: string
}

/** 参与修饰键匹配的最小事件形状 */
export type ModifierEventLike = {
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
}

/** 参与 IME 判定的最小事件形状 */
export type ComposingEventLike = {
  isComposing?: boolean
  keyCode?: number
}

/** 按键期望；`key` 与 `code` 同时传入时以 `code` 为准 */
export type KeyExpectation = {
  /** 逻辑键名（`KeyboardEvent.key`），大小写不敏感 */
  key?: string | readonly string[]
  /** 物理键位（`KeyboardEvent.code`），区分大小写 */
  code?: string | readonly string[]
}

/** 修饰键期望；省略的字段不参与匹配 */
export type ModifierExpectation = {
  /**
   * 是否要求按下当前平台的主修饰键（Apple 为 Command，其它平台为 Ctrl）
   *
   * 与 `ctrl` / `meta` 同时传入时以 `mod` 为准
   */
  mod?: boolean
  /** 是否要求按下 Ctrl */
  ctrl?: boolean
  /** 是否要求按下 Shift */
  shift?: boolean
  /** 是否要求按下 Alt（macOS 的 Option 就是 Alt，无需按平台区分） */
  alt?: boolean
  /** 是否要求按下 Meta（macOS 的 Command、Windows 键；Web API 中没有 Super 这个名字） */
  meta?: boolean
}

/** `mod` 展开后的修饰键期望 */
export type ResolvedModifiers = Omit<ModifierExpectation, 'mod'>
