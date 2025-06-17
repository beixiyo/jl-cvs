import type { RoutePath } from './routes'
import Index from '@/views'
import { genRoutes } from '@jl-org/vite-auto-route'
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

const views = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/views/**/index.tsx'),
  indexFileName: '/index.tsx',
  routerPathFolder: '/src/views',
  pathPrefix: /^\/src\/views/,
})

const components = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/components/**/Test.tsx'),
  indexFileName: '/Test.tsx',
  routerPathFolder: '/src/components',
  pathPrefix: /^\/src\/components/,
})

/** 生成所有路由 */
const allRoutes = views.concat(components)

/** 分离首页和其他路由 */
const otherRoutes = allRoutes.filter(item => item.path !== '/')

export const router = createBrowserRouter([
  /** 首页路由 - 独立路由 */
  {
    path: '/',
    Component: Index,
  },
  /** 其他路由 - 直接映射，全局 Suspense 会处理懒加载 */
  ...otherRoutes.map(item => ({
    path: item.path,
    Component: lazy(item.component),
  })),
])

/**
 * 带有类型推断的路由跳转
 * ### 注意会导致热重载失败
 */
export function routerTo(path: RoutePath, opts?: Parameters<typeof router['navigate']>[1]) {
  router.navigate(path, opts)
}
