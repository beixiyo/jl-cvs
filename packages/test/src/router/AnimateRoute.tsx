import type { CSSProperties } from 'react'
import { CusotmSuspense } from '@/components/CusotmSuspense'
import { KeepAliveRoute } from '@/components/KeepAliveRoute'
import { memo } from 'react'

/**
 * 提供
 * - 动画过渡
 * - 路由缓存
 */
export const AnimateRoute = memo((
  {
    style,
    className,
    children,
  }: AnimateRouteProps,
) => {
  const hasOutlet = useOutlet()

  return <>
    {
      hasOutlet && <CusotmSuspense>
        <KeepAliveRoute
          style={ style }
          className={ className }
          include={ ['/zoomCvs', '/aurora', '/moveable'] }
        />
      </CusotmSuspense>
    }

    { children }
  </>
})
AnimateRoute.displayName = 'AnimateRoute'

export interface AnimateRouteProps {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}
