import { useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../../utils/prefers-reduced-motion'
import type { KeepAliveTransitionDirection, KeepAliveTransitionOptions, KeepAliveTransitionPhase } from '../types'

const DEFAULT_TIMEOUT = 500

/**
 * 让 `active` 的切换经过一段可控的过渡窗口，而非立即生效：
 * - 失活（true → false）：`effectiveActive` 仍保持 true，直到 finishExit 被调用或超时，才真正转为 false
 * - 激活（false → true）：`effectiveActive` 立即为 true（副作用照常开始），phase 先停在 entering，
 *   直到 finishEnter 被调用或超时才转为 entered
 *
 * 未传 `transition`，或命中 `prefers-reduced-motion: reduce`（默认遵循）时，
 * 完全退化为「立即切换」，与未接入过渡前逐帧一致
 */
export function useDelayedActive(
  active: boolean,
  transition?: KeepAliveTransitionOptions,
  onExited?: () => void,
  direction?: KeepAliveTransitionDirection,
) {
  /**
   * 是否跳过过渡窗口（未配置 transition，或遵循 reduced-motion 且命中）
   * 在渲染期同步计算，使 skip 路径下 effectiveActive 直接跟随 active、
   * 不经 effect 里 setPhase 的 phase——否则激活时会晚一帧才 reveal（回归）
   */
  const skip = !transition
    || (transition.respectReducedMotion !== false && prefersReducedMotion())

  const [phase, setPhase] = useState<KeepAliveTransitionPhase>(() => {
    if (skip) {
      return active
        ? 'entered'
        : 'exited'
    }
    return active
      ? 'entering'
      : 'exited'
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seqRef = useRef(0)
  const onExitedRef = useRef(onExited)
  onExitedRef.current = onExited

  /** effect 上一次见到的 active：用于识别「挂载即失活 / 配置变更但 active 未变」的重放 */
  const lastActiveRef = useRef(active)

  /** 始终持有最新 direction；只在 active 切换的瞬间被读取快照，避免动画播放中途方向突变 */
  const directionRef = useRef<KeepAliveTransitionDirection>(direction ?? 'replace')
  directionRef.current = direction ?? 'replace'
  const [capturedDirection, setCapturedDirection] = useState<KeepAliveTransitionDirection>(directionRef.current)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const finishEnter = useCallback(() => {
    clearTimer()
    setPhase('entered')
  }, [clearTimer])

  const finishExit = useCallback(() => {
    clearTimer()
    setPhase('exited')
    onExitedRef.current?.()
  }, [clearTimer])

  useEffect(() => {
    const activeChanged = lastActiveRef.current !== active
    lastActiveRef.current = active

    const mySeq = ++seqRef.current
    clearTimer()
    setCapturedDirection(directionRef.current)

    if (skip) {
      setPhase(
        active
          ? 'entered'
          : 'exited',
      )
      /**
       * 立即切换语义下，失活即「退场瞬时完成」：同样要通知 onExited，
       * 否则上层的临时占位（如结构上会被移除的槽位）在 reduced-motion / 关闭过渡时无法回收
       */
      if (!active && activeChanged) onExitedRef.current?.()
      return
    }

    if (active) {
      setPhase('entering')
      timerRef.current = setTimeout(() => {
        if (seqRef.current === mySeq) finishEnter()
      }, transition?.enterTimeout ?? DEFAULT_TIMEOUT)
    }
    else {
      /**
       * 挂载即失活（或配置变更重放、StrictMode 二次执行）：没有退场可播，
       * 直接落在 exited，不得启动退场窗口——否则会白冻结 exitTimeout 并假触发 onExited
       */
      if (!activeChanged) {
        setPhase('exited')
        return
      }
      setPhase('exiting')
      timerRef.current = setTimeout(() => {
        if (seqRef.current === mySeq) finishExit()
      }, transition?.exitTimeout ?? DEFAULT_TIMEOUT)
    }

    return clearTimer
  }, [
    active,
    skip,
    transition?.enterTimeout,
    transition?.exitTimeout,
    clearTimer,
    finishEnter,
    finishExit,
  ])

  /**
   * skip 路径同步跟随 active（无一帧滞后）；过渡路径以 phase 为唯一真相源，
   * exiting 期间保持挂载播动画，直到退场彻底完成后（phase 变 exited）才视为失活
   */
  const effectiveActive = skip
    ? active
    : phase !== 'exited'

  return { effectiveActive, phase, finishEnter, finishExit, direction: capturedDirection }
}
