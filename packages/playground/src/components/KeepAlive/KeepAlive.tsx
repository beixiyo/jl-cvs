'use client'

import type { ReactNode } from 'react'
import { memo, Suspense, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { KeepAliveContext, KeepAliveKeyContext, KeepAliveTransitionContext } from './hooks/context'
import { useDelayedActive } from './hooks/use-delayed-active'
import type { KeepAliveProps } from './types'

const Wrapper = memo(({ children, active }: { children: ReactNode; active: boolean }) => {
  const resolveRef = useRef<Function | null>(null)

  if (active) {
    resolveRef.current?.()
    resolveRef.current = null
  }
  else {
    throw new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }

  return children
})

/**
 * 利用 Suspense 实现的 KeepAlive 组件
 * 当 effectiveActive 为 false 时，抛异常，触发 Suspense 的 fallback
 * 当 effectiveActive 为 true 时，resolve 异常，触发 Suspense 的正常渲染
 *
 * effectiveActive 由 {@link useDelayedActive} 派生：未传 `transition` 时与 `active` 完全同步（逐帧零差异）；
 * 传入 `transition` 时失活会先保持 effectiveActive 为 true 一段时间（exiting 窗口），
 * 让退场动画在真正挂起前有机会播放完
 */
export const KeepAlive = memo(({
  uniqueKey: key,
  active,
  children,
  forceRender = false,
  transition,
  onExited,
  direction,
}: KeepAliveProps & { uniqueKey?: keyof any }) => {
  const { findEffect } = useContext(KeepAliveContext)
  const [renderKey, setRenderKey] = useState(0)

  const { effectiveActive, phase, finishEnter, finishExit, direction: capturedDirection } = useDelayedActive(active, transition, onExited, direction)

  /**
   * 触发激活 / 失活钩子
   *
   * 用「激活时执行 + cleanup 失活」的平衡写法，使 deactive 在两种情况都会触发：
   * ① effectiveActive 由 true → false（切走 / 退场完成）；② 组件卸载
   */
  useEffect(() => {
    if (!effectiveActive) return

    findEffect(key).activeEffect.forEach((fn) => fn())
    if (forceRender) {
      setRenderKey((v) => v + 1)
    }

    return () => {
      findEffect(key).deactiveEffect.forEach((fn) => fn())
    }
  }, [effectiveActive, findEffect, key, forceRender])

  const transitionState = useMemo(
    () => (transition
      ? { phase, finishEnter, finishExit, direction: capturedDirection }
      : null),
    [transition, phase, finishEnter, finishExit, capturedDirection],
  )

  return (
    <Suspense fallback={ null } key={ renderKey }>
      <KeepAliveKeyContext.Provider value={ key }>
        <KeepAliveTransitionContext.Provider value={ transitionState }>
          <Wrapper active={ effectiveActive }>
            { children }
          </Wrapper>
        </KeepAliveTransitionContext.Provider>
      </KeepAliveKeyContext.Provider>
    </Suspense>
  )
})
