import { genRoutes } from '@jl-org/vite-auto-route'
import { createBrowserRouter } from 'react-router-dom'
import Index from '@/views'
import { AnimateRoute } from './AnimateRoute'

const views = genRoutes({
  globComponentsImport: () => import.meta.glob('./src/views/**/index.tsx'),
  indexFileName: '/index.tsx',
  routerPathFolder: '/src/views',
  pathPrefix: /^\/src\/views/,
})

export const router = createBrowserRouter([
  /** 首页路由 - 独立路由 */
  {
    path: '/',
    Component: Index,
    children: [
      {
        Component: AnimateRoute,
        children: views,
      },
    ],
  },
])
