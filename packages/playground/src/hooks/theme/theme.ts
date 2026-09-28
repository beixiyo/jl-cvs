import { THEME_KEY } from '@/config'
import type { Theme } from '@jl-org/tool'
import { getCurTheme } from '@jl-org/tool'

/**
 * =========================
 * * 主题模块
 * =========================
 *
 * ## 主题从哪来（读取优先级，高到低）
 *
 * 1. **localStorage** —— 用户显式选择，一经选择即为最终决定，系统变化不再覆盖
 * 2. **系统主题**（`prefers-color-scheme`）—— 无本地选择时的初始值，且持续跟随
 *
 * ## 主题落到哪（写入与分发）
 *
 * 所有写入（`toggleTheme` / `setHTMLTheme` / 系统跟随 / 外部脚本改 class）
 * 最终都体现为 **html class** —— 它是页面实际生效主题的唯一真相源；
 * Theme Store 订阅它，分发给所有 React 订阅者（`useTheme` / `useChangeTheme`）
 *
 * ```
 * localStorage ──┐ 有 → 优先，系统变化被忽略
 *                ├─→ getCurrentTheme() 读初始值
 * 系统主题 ──────┘ 无 → 持续跟随
 *      │
 *      ▼ 跟随与代码调用都汇聚到唯一写入口
 * setHTMLTheme() ─→ html class（唯一真相源）─→ Theme Store ─→ 所有订阅者
 *                        ▲
 *                        └── MutationObserver 兜底：外部脚本直接改 class
 * ```
 *
 * 阅读顺序：`getCurrentTheme`（读优先级）→ `toggleTheme` / `setHTMLTheme`（写路径）
 * → Theme Store（订阅分发）→ 文件底部「外部信号接入」
 */

/**
 * 读取主题，按优先级：localStorage（用户显式选择）→ 系统主题
 *
 * @returns theme 解析结果；fromLocal 是否来自用户显式选择
 */
export function getCurrentTheme() {
  if (typeof localStorage === 'undefined') {
    return {
      theme: 'light' as Theme,
      fromLocal: false,
    }
  }

  const userTheme = localStorage.getItem(THEME_KEY)
  if (userTheme) {
    return {
      theme: userTheme as Theme,
      fromLocal: true,
    }
  }

  return {
    theme: getCurTheme() as Theme,
    fromLocal: false,
  }
}

/**
 * 写入主题的完整入口：记偏好（localStorage）+ 生效（html class）
 *
 * @param theme 目标主题；不传则基于当前值切换到另一主题
 * @returns 实际生效的主题
 */
export function toggleTheme(theme?: Theme) {
  if (typeof localStorage === 'undefined' || typeof document === 'undefined') {
    return theme ?? 'light'
  }

  if (theme) {
    localStorage.setItem(THEME_KEY, theme)
    setHTMLTheme(theme)

    return theme
  }

  const nextTheme = getCurrentTheme().theme === 'dark'
    ? 'light'
    : 'dark'
  localStorage.setItem(THEME_KEY, nextTheme)
  setHTMLTheme(nextTheme)

  return nextTheme
}

/**
 * 只写「实际生效值」（html class），不写 localStorage
 *
 * 与 `toggleTheme` 的分工：本函数不改变用户偏好，
 * 适合「跟随系统」「代码强制当前帧」等不该记录选择的场景
 *
 * @param theme 目标主题
 */
export function setHTMLTheme(theme: Theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const isDark = theme === 'dark'

  root.classList.remove(
    isDark
      ? 'light'
      : 'dark',
  )

  root.classList.add(
    isDark
      ? 'dark'
      : 'light',
  )

  /** 写 DOM 的同时同步 store（见下方 Theme Store），订阅者立即收到通知 */
  updateThemeCache(theme)
}

/**
 * =========================
 * * Theme Store
 * =========================
 *
 * html class 的可订阅镜像：缓存当前生效主题，变化时通知所有订阅者
 * `useTheme` / `useChangeTheme` 经 `useSyncExternalStore` 消费，
 * 因此任何写入路径生效后，全部订阅组件同步更新
 */

/** 从 html class 读取实际生效的主题（唯一真相源的即时值） */
function readHTMLTheme(): Theme {
  return document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light'
}

/**
 * 初始缓存：html 已有主题类则信 DOM（页面此前已初始化过）；
 * 否则按读取优先级推断（`getCurrentTheme`），首帧更准且不写任何 DOM
 */
function initThemeCache(): Theme {
  if (typeof document === 'undefined') return 'light'

  const classList = document.documentElement.classList
  const hasThemeClass = classList.contains('light') || classList.contains('dark')
  return hasThemeClass
    ? readHTMLTheme()
    : getCurrentTheme().theme
}

let currentTheme = initThemeCache()
const themeListeners = new Set<VoidFunction>()

/** 更新缓存并通知订阅者；值未变化时不通知，避免无谓重渲染 */
function updateThemeCache(next: Theme) {
  if (currentTheme === next) return

  currentTheme = next
  for (const listener of themeListeners) listener()
}

/**
 * 订阅主题变化，返回取消订阅函数
 * 供 `useSyncExternalStore` 使用，也可用于非 React 场景
 */
export function subscribeTheme(listener: VoidFunction): () => void {
  themeListeners.add(listener)
  return () => {
    themeListeners.delete(listener)
  }
}

/** 当前主题快照（供 `useSyncExternalStore`） */
export function getThemeSnapshot(): Theme {
  return currentTheme
}

/** SSR 快照：无 DOM 环境按浅色处理 */
export function getServerThemeSnapshot(): Theme {
  return 'light'
}

/**
 * =========================
 * * 外部信号接入
 * =========================
 *
 * 模块外的两类变化源，模块加载即启动，全局仅一份
 */

/**
 * 系统主题跟随：无本地偏好时把系统主题写入 html class
 *
 * 只走 `setHTMLTheme`（不写 localStorage），保持「跟随」语义——
 * 用户此后一旦显式选择，localStorage 有值，本函数即不再动作，用户选择永远优先
 */
function followSystemTheme() {
  if (localStorage.getItem(THEME_KEY)) return

  setHTMLTheme(getCurTheme() as Theme)
}

/** 兜底：外部脚本绕过本模块直接改 html class 时，同步进 Theme Store */
function watchHTMLThemeClass() {
  new MutationObserver(() => updateThemeCache(readHTMLTheme()))
    .observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
}

/** 监听系统主题变化（浏览器支持 matchMedia 时） */
function watchSystemTheme() {
  if (typeof window.matchMedia !== 'function') return

  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', followSystemTheme)
}

if (typeof document !== 'undefined') {
  watchHTMLThemeClass()
  watchSystemTheme()
}
