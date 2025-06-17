import type { router } from '@/router'
import type { RoutePath } from '@/router/routes'

/**
 * 带有类型推断的路由跳转
 */
export function useNavi() {
  return useNavigate() as (
    path: RoutePath,
    opts?: Parameters<typeof router['navigate']>[1]
  ) => void
}
