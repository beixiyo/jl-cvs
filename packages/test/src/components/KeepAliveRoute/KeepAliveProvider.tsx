import { memo } from 'react'
import { KeepAliveRouteCtx, KeepAliveRouteCtxVal } from './KeepAliveRouteCtx'

export const KeepAliveProvider = memo<KeepAliveProviderProps>((
  {
    children,
  },
) => {
  return <KeepAliveRouteCtx.Provider
    value={ KeepAliveRouteCtxVal }
  >
    { children }
  </KeepAliveRouteCtx.Provider>
})
KeepAliveProvider.displayName = 'KeepAliveProvider'

export interface KeepAliveProviderProps {
  children?: React.ReactNode
}
