import type { Theme } from '@jl-org/tool'
import { onChangeTheme } from '@jl-org/tool'
import { useEffect } from 'react'
import { getCurrentTheme, setHTMLTheme, toggleTheme } from '@/utils'
import { useMutationObserver } from './ob'

/**
 * 监听用户主题变化，自动设置主题色，触发对应回调
 * ### 首次执行会优先设置用户主题，没有则为系统主题
 * @param onLight 用户切换到浅色模式时触发
 * @param onDark 用户切换到深色模式时触发
 */
export function useChangeTheme(
  onLight?: VoidFunction,
  onDark?: VoidFunction,
) {
  useEffect(
    () => {
      toggleTheme(getCurrentTheme().theme)
      const unbind = onChangeTheme(
        () => {
          setHTMLTheme('light')
          onLight?.()
        },
        () => {
          setHTMLTheme('dark')
          onDark?.()
        },
      )
      return unbind
    },
    [onDark, onLight],
  )
}

/**
 * 获取和设置当前主题
 */
export function useTheme(defaultTheme: Theme = 'light') {
  const [theme, setTheme] = useState(defaultTheme)
  const htmlRef = useRef<HTMLElement>(document.documentElement)

  const _setTheme = useCallback(
    (theme?: Theme) => {
      const nextTheme = toggleTheme(theme)
      setTheme(nextTheme)
    },
    [setTheme],
  )

  useEffect(
    () => {
      const themeInfo = getCurrentTheme()
      setTheme(themeInfo.theme)
      setHTMLTheme(themeInfo.theme)

      const unbindSystemTheme = onChangeTheme(
        () => setTheme('light'),
        () => setTheme('dark'),
      )

      return unbindSystemTheme
    },
    [],
  )

  useMutationObserver(
    htmlRef,
    () => {
      const theme = getCurrentTheme().theme
      setTheme(theme)
    },
    {
      attributes: true,
      attributeFilter: ['class'],
    },
  )

  return [theme, _setTheme] as const
}
