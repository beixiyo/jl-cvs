import type { Theme } from '@jl-org/tool'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useLatestRef } from '../ref'
import { getCurrentTheme, getServerThemeSnapshot, getThemeSnapshot, subscribeTheme, toggleTheme } from './theme'

/**
 * 监听主题变化，触发对应回调，并返回当前主题的响应式快照
 *
 * - 首次挂载会立即触发一次当前主题对应的回调
 * - `sync` 为 `true` 时，初始化把偏好主题（localStorage → 系统主题）写入 html class 与 localStorage
 * - html class 被任何路径修改（含外部脚本）都会同步到返回值
 * - 用户无本地偏好时，系统主题变化自动跟随；有偏好则用户选择优先
 * - 回调只在主题真正变化时触发（页面没切，回调不响）
 *
 * @returns 当前主题 `'light' | 'dark'`
 *
 * @example
 * useChangeTheme({
 *   onDark: () => console.log('切换到深色'),
 *   onLight: () => console.log('切换到浅色'),
 * })
 */
export function useChangeTheme(options?: UseChangeThemeOptions): Theme {
  const { onLight, onDark, sync = true } = options || {}
  const handleLight = useLatestRef(onLight)
  const handleDark = useLatestRef(onDark)

  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  )

  /** 同步模式：初始化时把偏好主题写入 html class 与 localStorage（幂等） */
  useEffect(() => {
    if (!sync) return

    toggleTheme(getCurrentTheme().theme)
  }, [sync])

  /** 主题变化（含首次挂载）触发对应回调 */
  useEffect(
    () => {
      theme === 'dark'
        ? handleDark.current?.()
        : handleLight.current?.()
    },
    [theme],
  )

  return theme
}

/**
 * 获取和设置当前主题
 *
 * `useChangeTheme` 的订阅能力 + 设置函数；所有调用方共享同一份 store 快照，
 * 任何一处 setTheme 后全部订阅者同步更新
 *
 * @param options 配置选项
 * @returns [theme, setTheme] - 主题值和设置函数
 *
 * @example
 * // 同步模式：初始化时自动设置主题，适合主题切换按钮
 * const [theme, setTheme] = useTheme({ sync: true })
 *
 * @example
 * // 非同步模式：初始化时不自动设置主题，但 setTheme 仍然可以调用
 * const [theme, setTheme] = useTheme({ sync: false })
 * // 适合需要获取设置主题函数，但不希望初始化时自动改变主题的场景
 */
export function useTheme(options?: UseThemeOptions) {
  const { sync = false } = options || {}

  /** 复用 useChangeTheme 的订阅与 sync 初始化，不传回调 */
  const theme = useChangeTheme({ sync })

  /**
   * 设置主题：写入 html class 与 localStorage 并返回生效值
   * 不传参数则切换到另一主题
   */
  const setTheme = useCallback(
    (newTheme?: Theme) => toggleTheme(newTheme),
    [],
  )

  return [theme, setTheme] as const
}

/**
 * 丝滑地动画切换主题
 * @example
 * const [theme, setTheme] = useTheme()
 * useInsertStyle({
 *   lightStyleStrOrUrl: new URL('styles/transition/theme.css', import.meta.url).href,
 *   darkStyleStrOrUrl: new URL('styles/transition/theme.css', import.meta.url).href,
 * })
 * const handleToggle = useToggleThemeWithTransition(theme, setTheme)
 *
 * <Button onClick={ handleToggle }>Toggle</Button>
 */
export function useToggleThemeWithTransition(
  theme: Theme,
  setTheme: VoidFunction,
) {
  return useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const x = event.clientX
      const y = event.clientY
      const isDark = theme === 'dark'
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      )

      /** 兼容性处理 */
      if (!document.startViewTransition) {
        setTheme()
        return
      }
      const transition = document.startViewTransition(() => {
        setTheme()
      })

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]

        document.documentElement.animate(
          {
            clipPath: isDark
              ? clipPath
              : [...clipPath].reverse(),
          },
          {
            duration: 400,
            easing: 'ease-in',
            pseudoElement: isDark
              ? '::view-transition-new(root)'
              : '::view-transition-old(root)',
          },
        )
      })
    },
    [setTheme, theme],
  )
}

interface UseChangeThemeOptions {
  /**
   * 主题切换到浅色时触发（含首次挂载）
   */
  onLight?: VoidFunction
  /**
   * 主题切换到深色时触发（含首次挂载）
   */
  onDark?: VoidFunction
  /**
   * 是否同步主题到 HTML class 和 localStorage
   * - `true`（默认）：初始化时自动同步偏好主题
   * - `false`：只监听主题变化，不修改任何东西
   * @default true
   */
  sync?: boolean
}

interface UseThemeOptions {
  /**
   * 是否在初始化时自动同步主题到 HTML class 和 localStorage
   * - `true`：初始化时自动设置主题（适合主题切换按钮）
   * - `false`（默认）：初始化时不自动设置主题，但返回的 setTheme 函数仍然可以调用并设置主题
   * @default false
   */
  sync?: boolean
}
