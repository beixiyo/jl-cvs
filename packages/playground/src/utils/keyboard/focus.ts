/**
 * DOM 焦点基础能力：统一可编辑目标判断、Tab 顺序元素收集和安全聚焦
 */

/** 匹配显式开启的 contenteditable 容器；配合 closest 可识别继承编辑能力的后代 */
export const CONTENTEDITABLE_SELECTOR = '[contenteditable]:not([contenteditable="false"])'

/** 默认视为可编辑区域的选择器 */
export const EDITABLE_SELECTOR = [
  'input',
  'textarea',
  'select',
  CONTENTEDITABLE_SELECTOR,
].join(',')

/** 内部控件拥有自身键盘语义时，父级 Enter 处理器应忽略的元素 */
export const PARENT_ENTER_IGNORE_SELECTOR = [
  'textarea',
  'select',
  'button',
  'a[href]',
  'summary',
  CONTENTEDITABLE_SELECTOR,
  '[role="button"]',
  '[role="combobox"]',
  '[role="link"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="treeitem"]',
].join(',')

/** 父级 Enter 处理器应忽略的 input 类型 */
export const PARENT_ENTER_IGNORE_INPUT_TYPES = [
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
] as const

const PARENT_ENTER_IGNORE_INPUT_TYPE_SET = new Set<string>(PARENT_ENTER_IGNORE_INPUT_TYPES)

const TABBABLE_CANDIDATE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'audio[controls]',
  'video[controls]',
  CONTENTEDITABLE_SELECTOR,
  '[tabindex]',
].join(',')

const HIDDEN_FROM_FOCUS_SELECTOR = '[hidden], [aria-hidden="true"], [inert]'

/**
 * 判断事件目标是否位于输入框、文本域、选择器或 contenteditable 区域内
 *
 * @param target 事件目标或当前焦点元素
 * @param selector 自定义可编辑区域选择器
 * @default EDITABLE_SELECTOR
 */
export function isEditableTarget(
  target: EventTarget | null,
  selector: string = EDITABLE_SELECTOR,
): boolean {
  return typeof Element !== 'undefined'
    && target instanceof Element
    && !!target.closest(selector)
}

/**
 * 判断事件目标是否应保留自身 Enter 语义，避免父级容器重复执行确认或激活
 *
 * 单行文本 input 默认允许父级处理 Enter；子控件仍可通过 preventDefault 显式接管
 */
export function shouldIgnoreParentEnter(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false
  if (target.closest(PARENT_ENTER_IGNORE_SELECTOR)) return true

  const input = target.closest('input')
  return typeof HTMLInputElement !== 'undefined'
    && input instanceof HTMLInputElement
    && PARENT_ENTER_IGNORE_INPUT_TYPE_SET.has(input.type)
}

/**
 * 焦点是否位于输入框、文本域或 contenteditable 区域内
 *
 * 全局快捷键用它避开与文字输入冲突；键盘层可在 `when` 里复用同一份判定
 * @param selector 自定义可编辑区域选择器
 * @default EDITABLE_SELECTOR
 */
export function isFocusInEditable(selector: string = EDITABLE_SELECTOR): boolean {
  if (typeof document === 'undefined') return false

  return isEditableTarget(document.activeElement, selector)
}

/**
 * 返回容器内按 DOM 顺序排列、可进入 Tab 顺序的元素
 *
 * 过滤 disabled、负 tabIndex、hidden、aria-hidden 和 inert 区域；组件仍负责
 * 决定循环范围、初始焦点和焦点恢复策略
 */
export function getTabbableElements(container: ParentNode): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_CANDIDATE_SELECTOR))
    .filter((element) =>
      isInTabOrder(element)
      && !element.matches(':disabled')
      && !element.closest(HIDDEN_FROM_FOCUS_SELECTOR)
    )
}

function isInTabOrder(element: HTMLElement): boolean {
  if (element.tabIndex >= 0) return true
  if (element.hasAttribute('tabindex') || !element.matches(CONTENTEDITABLE_SELECTOR)) return false

  return !element.parentElement?.closest(CONTENTEDITABLE_SELECTOR)
}

/** 使用 preventScroll 聚焦元素，并兼容不支持 FocusOptions 的环境 */
export function focusElement(element: HTMLElement | null | undefined): void {
  if (!element) return

  try {
    element.focus({ preventScroll: true })
  }
  catch {
    element.focus()
  }
}
