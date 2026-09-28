import { useRef } from 'react'
import { createKeepAliveRegistry, KeepAliveContext } from '../hooks/context'
import type { KeepAliveContextType, KeepAliveProps } from '../types'

/**
 * 为子树提供一个相互隔离的 keep-alive 回调注册表
 * 每个 Provider 实例持有自己的 registry → 不同 Provider 之间不会串扰
 */
export const KeepAliveProvider: React.FC<Omit<KeepAliveProps, 'active'>> = ({ children }) => {
  const registryRef = useRef<KeepAliveContextType | null>(null)
  if (!registryRef.current) registryRef.current = createKeepAliveRegistry()

  return (
    <KeepAliveContext.Provider
      value={ registryRef.current }
    >
      { children }
    </KeepAliveContext.Provider>
  )
}
