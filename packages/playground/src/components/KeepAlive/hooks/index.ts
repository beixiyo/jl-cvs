import type { SyntheticEvent } from 'react'
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeepAliveContextType, KeepAliveEffectCallback, KeepAliveTransitionDirection, KeepAliveTransitionState } from '../types'
import { KeepAliveContext, KeepAliveKeyContext, KeepAliveTransitionContext } from './context'

/**
 * ## 必须在 KeepAlive 组件传递 uniqueKey 属性才能使用
 * 注册激活回调
 */
export const useActiveEffect: KeepAliveContextType['registerActiveEffect'] = (key, callback) => {
  const { registerActiveEffect, delActiveEffect } = useContext(KeepAliveContext)

  useEffect(() => {
    registerActiveEffect?.(key, callback)

    return () => {
      delActiveEffect?.(key, callback)
    }
  }, [])
}

/**
 * ## 必须在 KeepAlive 组件传递 uniqueKey 属性才能使用
 * 注册失活回调
 */
export const useDeactiveEffect: KeepAliveContextType['registerDeactiveEffect'] = (key, callback) => {
  const { registerDeactiveEffect, delDeactiveEffect } = useContext(KeepAliveContext)

  useEffect(() => {
    registerDeactiveEffect?.(key, callback)

    return () => {
      delDeactiveEffect?.(key, callback)
    }
  }, [])
}

/**
 * KeepAlive 可见性感知 effect —— {@link useEffect} 的缓存版
 *
 * - 页面**激活**（首次挂载即可见，或 keep-alive 由隐藏切回）时执行 `effect`
 * - 页面**失活**（被缓存隐藏）或**卸载**时执行 `effect` 返回的 cleanup
 *
 * 解决「缓存页用普通 `useEffect`，cleanup 只在真卸载时跑、隐藏时不触发」导致的副作用 /
 * 当前页信号残留。自动经 {@link KeepAliveKeyContext} 解析所属缓存单元，无需手动传 key；
 * 未被 KeepAlive 包裹时退化为普通 effect（挂载执行、卸载清理）
 *
 * 内部用 ref 始终调用最新闭包，无 stale 问题，故不需要依赖数组
 *
 * @example
 * useKeepAliveEffect(() => {
 *   reportActiveSurface(true)
 *   return () => reportActiveSurface(false) // 隐藏 / 卸载都会复位
 * })
 */
export function useKeepAliveEffect(effect: KeepAliveEffectCallback): void {
  const key = useContext(KeepAliveKeyContext)
  const {
    registerActiveEffect,
    registerDeactiveEffect,
    delActiveEffect,
    delDeactiveEffect,
  } = useContext(KeepAliveContext)

  const effectRef = useRef(effect)
  effectRef.current = effect
  const cleanupRef = useRef<ReturnType<KeepAliveEffectCallback>>(undefined)

  useEffect(() => {
    /** 幂等开关：避免「mount 自跑」与 KeepAlive 同一 tick 的 activeEffect 重复执行 */
    let running = false

    const activate = () => {
      if (running) return
      running = true
      cleanupRef.current = effectRef.current()
    }
    const deactivate = () => {
      if (!running) return
      running = false
      cleanupRef.current?.()
      cleanupRef.current = undefined
    }

    /** 未被 KeepAlive 包裹：退化为普通 effect（挂载执行、卸载清理） */
    if (key === undefined) {
      activate()
      return deactivate
    }

    registerActiveEffect(key, activate)
    registerDeactiveEffect(key, deactivate)

    /**
     * 组件只会在「页面激活时」挂载（隐藏时整棵子树被 Suspense 挂起、不挂载），故挂载即激活：
     * 主动跑一次。这样晚于 KeepAlive 初次 activeEffect 挂载的后代也能拿到初次激活；
     * 与同 tick 的 activeEffect 由 `running` 幂等去重，不会重复执行
     */
    activate()

    return () => {
      delActiveEffect(key, activate)
      delDeactiveEffect(key, deactivate)
      deactivate()
    }
  }, [key, registerActiveEffect, registerDeactiveEffect, delActiveEffect, delDeactiveEffect])
}

/**
 * 读取当前 KeepAlive 实例的过渡状态：`entering`/`entered`/`exiting`/`exited` 四个阶段，
 * 以及 `finishEnter`/`finishExit` 两个手动确认回调
 *
 * 未开启过渡（{@link KeepAliveProps.transition} 未配置）或未被 KeepAlive 包裹时返回 `null`——
 * 消费者应将其视为「无需关心过渡，正常渲染即可」，不必对 `null` 做降级动画处理
 *
 * @example
 * const transition = useKeepAliveTransition()
 * if (transition?.phase === 'exiting') {
 *   // 播放退场动画，动画结束后调用 transition.finishExit()
 * }
 */
export function useKeepAliveTransition(): KeepAliveTransitionState | null {
  return useContext(KeepAliveTransitionContext)
}

/**
 * {@link useKeepAliveTransitionBindings} 的返回值
 */
export interface KeepAliveTransitionBindings {
  /** 原始过渡状态；未开启过渡（或未被 KeepAlive 包裹）时为 `null` */
  transition: KeepAliveTransitionState | null
  /** 本次切换的方向，未开启过渡时兜底 `replace` */
  direction: KeepAliveTransitionDirection
  /** 进场首帧（应渲染为「进场起始态」：隐藏 / 偏移）；下一帧自动翻转，CSS transition 由此被触发 */
  isEntering: boolean
  /** 退场中（应渲染为「退场终态」） */
  isExiting: boolean
  /**
   * 展开到执行动画的元素上（`{...bind}`）：
   * 动画结束自动通知完成过渡，内置 target 过滤（忽略子元素冒泡上来的 transitionend / animationend）
   * 与 phase 分发（exiting → finishExit、entering → finishEnter），无需手动接线
   *
   * 引用全程恒定，可安全传入 memo 组件 / deps 数组
   */
  bind: {
    onTransitionEnd: (e: SyntheticEvent) => void
    onAnimationEnd: (e: SyntheticEvent) => void
  }
}

/**
 * {@link useKeepAliveTransition} 的开箱即用封装：样式仍完全由使用方决定（headless），
 * 但把消费过渡状态的三个易错细节收进库里——
 *
 * 1. **进场双帧节奏**：先以起始态提交一帧、下一帧再翻转（`useLayoutEffect` 在 paint 前复位，
 *    缓存页复活时不会闪现终态），否则 CSS transition 捕捉不到属性变化
 * 2. **transitionend 冒泡过滤**：子元素（如 hover 变色）的事件不会误判为页面动画完成
 * 3. **phase 分发**：动画结束自动调用对应的 finishExit / finishEnter
 *
 * 用 JS 动画库（motion/react 等）需要精确控制时，仍可用 {@link useKeepAliveTransition}
 * 的 `finishEnter` / `finishExit` 原语手动接线
 *
 * @example
 * const { isEntering, isExiting, direction, bind } = useKeepAliveTransitionBindings()
 * return (
 *   <div
 *     style={{
 *       transition: 'all 300ms ease-out',
 *       opacity: isEntering || isExiting ? 0 : 1,
 *     }}
 *     {...bind}
 *   >
 *     { children }
 *   </div>
 * )
 */
export function useKeepAliveTransitionBindings(): KeepAliveTransitionBindings {
  const transition = useKeepAliveTransition()
  const [revealed, setRevealed] = useState(false)
  const phase = transition?.phase

  useLayoutEffect(() => {
    if (phase !== 'entering') return

    setRevealed(false)
    const raf = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(raf)
  }, [phase])

  /**
   * latest-ref：让 handleEnd / bind 引用全程恒定——
   * 返回值会进入使用方的 memo 组件 props 与 deps 数组，不稳定的引用会击穿它们的缓存
   */
  const transitionRef = useRef(transition)
  transitionRef.current = transition
  const revealedRef = useRef(revealed)
  revealedRef.current = revealed

  const handleEnd = useCallback((e: SyntheticEvent) => {
    if (e.target !== e.currentTarget) return

    const current = transitionRef.current
    if (current?.phase === 'exiting') current.finishExit()
    else if (current?.phase === 'entering' && revealedRef.current) current.finishEnter()
  }, [])

  const bind = useMemo(() => ({
    onTransitionEnd: handleEnd,
    onAnimationEnd: handleEnd,
  }), [handleEnd])

  return useMemo(() => ({
    transition,
    direction: transition?.direction ?? 'replace',
    isEntering: phase === 'entering' && !revealed,
    isExiting: phase === 'exiting',
    bind,
  }), [transition, phase, revealed, bind])
}
