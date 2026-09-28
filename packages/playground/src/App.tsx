import { useTheme } from '@/hooks'
import { allResources } from '@/i18n'
import { I18nProvider } from '@/i18n/react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
  /** 初始化主题：localStorage → 系统偏好，写入 html class */
  useTheme({ sync: true })

  return (
    <I18nProvider
      resources={ allResources }
      defaultLanguage="zh-CN"
    >
      <RouterProvider router={ router } />
    </I18nProvider>
  )
}

export default App
