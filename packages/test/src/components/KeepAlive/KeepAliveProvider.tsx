import type { KeepAliveProps } from './type'
import { KeepAliveContext, KeepAliveCtxVal } from './context'

export const KeepAliveProvider: React.FC<Omit<KeepAliveProps, 'active'>> = ({ children }) => {
  return (
    <KeepAliveContext.Provider
      value={ KeepAliveCtxVal }
    >
      {children}
    </KeepAliveContext.Provider>
  )
}
