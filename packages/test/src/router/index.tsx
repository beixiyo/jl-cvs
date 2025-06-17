import { genRoutes } from '@jl-org/vite-auto-route'
import { createBrowserRouter } from 'react-router-dom'
import Index from '@/views'
import { AnimateRoute } from './AnimateRoute'

const views = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/views/**/index.tsx'),
  indexFileName: '/index.tsx',
  routerPathFolder: '/src/views',
  pathPrefix: /^\/src\/views/,
})

const routes = views
  .map((item) => {
    const routes = item.path === '/'
      ? {
          path: item.path,
          element: <Navigate to="/waterRipple" replace />,
        }
      : {
          path: item.path,
          Component: lazy(item.component),
        }

    return routes
  })

export const router = createBrowserRouter([
  /** 首页布局路由 - 独立路由 */
  {
    path: '/',
    Component: Index,
    children: [
      {
        path: '/',
        element: <AnimateRoute />,
        children: routes,
      },
    ],
  },
])
