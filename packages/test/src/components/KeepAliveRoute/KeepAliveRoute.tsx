import type { CSSProperties } from 'react'
import type { KeepAliveOpts } from './useKeepAlive'
import { Animate, AnimateShow } from '@/components/Animate'
import { vShow } from '@/hooks'
import { cn } from '@/utils'
import { Fragment, memo } from 'react'
import { KeepAliveProvider } from './KeepAliveProvider'
import { useKeepAlive } from './useKeepAlive'

export const KeepAliveRoute = memo<KeepAliveRouteProps>((
  {
    style,
    className,
    ...rest
  },
) => {
  const {
    pathname,
    componentMap,
  } = useKeepAlive(rest)

  return (
    <KeepAliveProvider>
      {
        Array.from(componentMap).map(([
          key,
          { Outlet, needCache },
        ]) =>
          needCache
            ? <div
                key={ key }
                className={ cn(
                  'size-full relative',
                  className,
                ) }
                style={ {
                  ...vShow(pathname === key),
                  ...style,
                } }
              >
                { Outlet }
              </div>

            : pathname === key && <Fragment key={ key }>
              { Outlet }
            </Fragment>,
        )
      }
    </KeepAliveProvider>
  )
})
KeepAliveRoute.displayName = 'KeepAliveRoute'

export type KeepAliveRouteProps = {
  className?: string
  style?: CSSProperties
}
& KeepAliveOpts
