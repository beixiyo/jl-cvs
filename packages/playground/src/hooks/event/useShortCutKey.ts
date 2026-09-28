import type { KeyCodeEnum, KeyEnum, ModifierExpectation } from '@/utils/keyboard'
import { isComposingEvent, isFocusInEditable, matchesKey, matchesModifiers } from '@/utils/keyboard'
import { useEffect } from 'react'
import { useLatestRef } from '../ref'

/**
 * 键盘快捷键钩子函数
 *
 * 传了 `onKeyDown` 才监听 `keydown`，传了 `onKeyUp` 才监听 `keyup`，两者可以同时传；
 * 两个回调共用同一份按键与修饰键匹配条件
 *
 * 监听修饰键本身时注意方向：`keydown` 时该修饰键处于按下状态，
 * 所以 `{ key: 'Alt', alt: true, onKeyDown }`；`keyup` 时它已经抬起，是 `alt: false`（默认值）
 * @param opts 快捷键配置选项
 * @example
 * ```tsx
 * // 全局保存，Mac 用 Cmd + S，其它平台用 Ctrl + S
 * useShortCutKey({ key: 's', mod: true, onKeyDown: onSave })
 *
 * // 元素内按 Enter 提交
 * useShortCutKey({ key: 'Enter', el: editorElement, onKeyDown: onSubmit })
 *
 * // 长按说话：修饰键自身要拆成两个 hook
 * // 同一个 hook 的修饰键期望对 keydown / keyup 是同一份，没法按事件类型分开写；
 * // Alt 抬起时 altKey 已经是 false，写在一起的 { alt: true, onKeyUp } 永远不触发
 * useShortCutKey({ key: 'Alt', alt: true, onKeyDown: startRecording })
 * useShortCutKey({ key: 'Alt', alt: false, onKeyUp: stopRecording })
 *
 * // 带 Alt / Option 的字母组合键用 code，避开 macOS 改写字符
 * useShortCutKey({ code: 'KeyK', alt: true, onKeyDown: onToggle })
 *
 * // 不阻止默认（例如保留浏览器保存对话框）
 * useShortCutKey({ key: 's', ctrl: true, onKeyDown: onSave, preventDefault: false })
 * ```
 */
export function useShortCutKey(opts: ShortCutKeyOpts) {
  const {
    key,
    code,
    el = typeof window !== 'undefined'
      ? window
      : undefined as unknown as ShortCutTarget,
    mod = false,
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    capture = false,
    enabled = true,
    allowRepeat = true,
    ignoreComposing = true,
    ignoreWhenEditable = false,
    preventDefault: shouldPreventDefault = true,
    onKeyDown,
    onKeyUp,
  } = opts

  const watchKeyDown = useLatestRef(onKeyDown)
  const watchKeyUp = useLatestRef(onKeyUp)

  /** 只有回调存在才注册对应监听，用布尔值入依赖避免回调换引用就重新订阅 */
  const listenKeyDown = !!onKeyDown
  const listenKeyUp = !!onKeyUp

  useEffect(
    () => {
      if (!enabled || !el) return
      if (!listenKeyDown && !listenKeyUp) return

      const handleEvent = (e: KeyboardEvent) => {
        const handler = e.type === 'keyup'
          ? watchKeyUp.current
          : watchKeyDown.current
        if (!handler) return

        if (ignoreComposing && isComposingEvent(e)) return
        if (!allowRepeat && e.repeat) return
        if (!matchesKey(e, { key, code })) return
        if (!matchesModifiers(e, { mod, ctrl, shift, alt, meta })) return
        if (ignoreWhenEditable && isFocusInEditable()) return

        if (shouldPreventDefault) e.preventDefault()
        handler(e)
      }

      if (listenKeyDown) el.addEventListener('keydown', handleEvent as EventListener, capture)
      if (listenKeyUp) el.addEventListener('keyup', handleEvent as EventListener, capture)

      return () => {
        if (listenKeyDown) el.removeEventListener('keydown', handleEvent as EventListener, capture)
        if (listenKeyUp) el.removeEventListener('keyup', handleEvent as EventListener, capture)
      }
    },
    [
      allowRepeat,
      alt,
      capture,
      code,
      ctrl,
      el,
      enabled,
      ignoreComposing,
      ignoreWhenEditable,
      key,
      listenKeyDown,
      listenKeyUp,
      meta,
      mod,
      shift,
      shouldPreventDefault,
      watchKeyDown,
      watchKeyUp,
    ],
  )
}

export type ShortCutTarget = HTMLElement | Window | Document

export type ShortCutKeyOpts =
  & ModifierExpectation
  & ShortCutKeyBaseOpts
  & ShortCutKeyTarget
  & ShortCutKeyHandlers

/** 至少要指定 `key` 或 `code` 之一，否则会命中所有按键 */
export type ShortCutKeyTarget =
  | {
    /** 逻辑键名（`KeyboardEvent.key`），大小写不敏感 */
    key: KeyEnum
    /**
     * 物理键位（`KeyboardEvent.code`），区分大小写
     *
     * 传入后 `key` 不参与匹配：macOS 上 Option 会改写 `key` 的字符，
     * 带 Alt 的字母组合键必须用 `code`
     */
    code?: KeyCodeEnum
  }
  | {
    key?: KeyEnum
    code: KeyCodeEnum
  }

/** 至少要提供一个回调，否则不会注册任何监听 */
export type ShortCutKeyHandlers =
  | {
    /** 命中组合键的 `keydown` 时执行；传入才监听 `keydown` */
    onKeyDown: ShortCutKeyHandler
    /** 命中组合键的 `keyup` 时执行；传入才监听 `keyup` */
    onKeyUp?: ShortCutKeyHandler
  }
  | {
    onKeyDown?: ShortCutKeyHandler
    onKeyUp: ShortCutKeyHandler
  }

export type ShortCutKeyHandler = (e: KeyboardEvent) => void

export type ShortCutKeyBaseOpts = {
  /**
   * 监听目标，默认 window（全局快捷键）
   */
  el?: ShortCutTarget | null
  /**
   * 是否在捕获阶段监听
   * @default false
   */
  capture?: boolean
  /**
   * 是否启用该快捷键
   * @default true
   */
  enabled?: boolean
  /**
   * 是否响应长按产生的重复事件
   * @default true
   */
  allowRepeat?: boolean
  /**
   * 是否忽略输入法组字期间的事件（组字中的 Enter / Escape 属于输入法自身的确认与取消）
   * @default true
   */
  ignoreComposing?: boolean
  /**
   * 焦点在输入框/可编辑区域时是否不触发（避免与输入冲突）
   * @default false
   */
  ignoreWhenEditable?: boolean
  /**
   * 匹配时是否阻止默认行为（如阻止 Ctrl+S 的浏览器保存）
   * @default true
   */
  preventDefault?: boolean
}

export type { KeyCodeEnum, KeyEnum, KeyEventType, ModifierExpectation } from '@/utils/keyboard'
