import { AppShell } from '@/layout/AppShell'
import Index from '@/views'
import { genRoutes } from '@jl-org/vite-auto-route'
import { createBrowserRouter } from 'react-router-dom'
import { AnimateRoute } from './AnimateRoute'

const viewTree = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/views/**/index.tsx'),
  indexFileName: '/index.tsx',
  routerPathFolder: '/src/views',
  pathPrefix: /^\/src\/views/,
})

/**
 * genRoutes 返回树形结构：根节点挂全部页面，拍平成路由数组
 */
const views = viewTree.flatMap((node) =>
  node.children.length
    ? node.children
    : [node]
).filter((node) => node.path !== '/')

const routes = views.map((item) => ({
  path: item.path,
  Component: lazy(item.component),
}))

export const router = createBrowserRouter([
  /** 官网首页 —— 独立落地页，不套演示壳 */
  {
    path: '/',
    Component: Index,
  },

  /** 演示壳 —— 侧栏 + 内容区各自独立滚动；pathless 布局路由承载过渡与缓存 */
  {
    path: '/',
    Component: AppShell,
    children: [
      {
        element: <AnimateRoute />,
        children: [
          ...routes,
          { path: '*', element: <Navigate to="/waterRipple" replace /> },
        ],
      },
    ],
  },
])
