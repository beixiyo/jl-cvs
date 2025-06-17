import type { Theme } from '@jl-org/tool'
import { THEME_KEY } from '@/config'
import { useInsertStyle } from '@/hooks'
import { getCurTheme } from '@jl-org/tool'

/**
 * 获取当前主题
 * - 先取本地主题
 * - 没有则取系统主题
 */
export function getCurrentTheme() {
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
 * 设置主题色
 * @param theme 主题色，不传则为切换主题色
 */
export function toggleTheme(theme?: Theme) {
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

export function setHTMLTheme(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark'

  root.classList.remove(isDark
    ? 'light'
    : 'dark',
  )

  root.classList.add(isDark
    ? 'dark'
    : 'light',
  )
}

/**
 * 丝滑地动画切换主题
 * @example
 * const [theme, setTheme] = useTheme()
 * const toggleTheme = toggleThemeWithTransition(theme, setTheme)
 * <Button onClick={ toggleTheme }>Toggle</Button>
 */
export function toggleThemeWithTransition(
  theme: Theme,
  setTheme: VoidFunction,
  useStartTransition = true,
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useInsertStyle(new URL('@/styles/transition/theme.css', import.meta.url).href)

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
      const transition = document.startViewTransition(async () => {
        useStartTransition
          ? startTransition(() => setTheme())
          : setTheme()
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
    [setTheme, theme, useStartTransition],
  )
}
