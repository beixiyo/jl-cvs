import type { KeepAliveProps } from './type'
import { Suspense } from 'react'
import { KeepAliveContext } from './context'

function Wrapper({ children, active }: KeepAliveProps) {
  const resolveRef = useRef<Function>()

  if (active) {
    resolveRef.current?.()
    resolveRef.current = undefined
  }
  else {
    throw new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }

  return children
}

/**
 * 利用 Suspense 实现的 KeepAlive 组件
 * 当 active 为 false 时，抛异常，触发 Suspense 的 fallback
 * 当 active 为 true 时，resolve 异常，触发 Suspense 的正常渲染
 */
export function KeepAlive({
  uniqueKey: key,
  active,
  children,
}: KeepAliveProps & { uniqueKey?: keyof any }) {
  const { findEffect } = useContext(KeepAliveContext)
  /**
   * 触发钩子
   */
  useEffect(() => {
    const { activeEffect, deactiveEffect } = findEffect(key)

    if (active) {
      activeEffect.forEach(fn => fn())
    }
    else {
      deactiveEffect.forEach(fn => fn())
    }
  }, [active])

  return (
    <Suspense fallback={ null }>
      <Wrapper active={ active }>
        {children}
      </Wrapper>
    </Suspense>
  )
}
