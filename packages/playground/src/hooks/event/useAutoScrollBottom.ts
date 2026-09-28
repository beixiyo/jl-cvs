import { useEffect, useRef, useState } from 'react'
import { useLatestCallback } from '../memo'
import { useLatestRef } from '../ref'

/**
 * 智能「自动滚到底」控制器 —— 基于**用户滚轮意图**而非单纯位置判断
 *
 * 本 hook 只回答「现在该不该自动滚到底」（`shouldAutoScroll`），实际怎么滚由调用方决定，
 * 因此既适用于普通滚动容器（`<div ref={bindScrollEl}>` + MutationObserver / useScrollBottom），
 * 也适用于虚拟列表（virtuoso `scrollerRef={bindScrollEl}` + `scrollToIndex`）
 *
 * 判定逻辑（不与用户对抗）：
 * - 用户向上滚（滚轮 `deltaY < 0`）→ 立即停止自动滚，哪怕内容还在更新
 * - 用户向下滚且接近底部 → 重新开启自动滚
 * - 程序化滚动（无滚轮事件）不会改变意图，避免内容增长把用户「拽下去」
 *
 * @example
 * // 普通容器
 * const { shouldAutoScrollRef, bindScrollEl } = useAutoScrollBottom()
 * <div ref={ bindScrollEl }>{ ... }</div>
 *
 * @example
 * // 虚拟列表（react-virtuoso）
 * const { shouldAutoScrollRef, bindScrollEl } = useAutoScrollBottom({ threshold: 80 })
 * <Virtuoso scrollerRef={ bindScrollEl } ... />
 * useEffect(() => { if (shouldAutoScrollRef.current) ref.current?.scrollToIndex({ index: 'LAST' }) }, [messages])
 */
export function useAutoScrollBottom(options: UseAutoScrollBottomOptions = {}) {
  const { enabled = true, threshold = 5 } = options

  const [shouldAutoScroll, setShouldAutoScroll] = useState(enabled)
  const shouldAutoScrollRef = useLatestRef(shouldAutoScroll)
  /** 最近一次滚轮方向（true=向下）。用 ref 避免 wheel→scroll 连续触发时的闭包过期 */
  const isDownScrollRef = useRef(true)
  /** 当前绑定的滚动元素 */
  const elRef = useRef<HTMLElement | null>(null)
  const enabledRef = useLatestRef(enabled)
  const thresholdRef = useLatestRef(threshold)

  const handleWheel = useLatestCallback((e: WheelEvent) => {
    isDownScrollRef.current = e.deltaY > 0
  })

  const handleScroll = useLatestCallback(() => {
    /** 向上滚 → 关闭；向下滚且接近底部 → 重新开启；其余维持现状（程序化滚动不打扰用户） */
    if (!isDownScrollRef.current) setShouldAutoScroll(false)
    else if (isNearBottom(elRef.current, thresholdRef.current)) setShouldAutoScroll(enabledRef.current)
  })

  /** callback ref：绑定滚动容器，自动挂/卸 wheel + scroll 监听（普通 div ref 或 virtuoso scrollerRef 均可） */
  const bindScrollEl = useLatestCallback((el: HTMLElement | Window | null) => {
    const next = el instanceof HTMLElement
      ? el
      : null
    if (elRef.current === next) return

    elRef.current?.removeEventListener('wheel', handleWheel)
    elRef.current?.removeEventListener('scroll', handleScroll)
    elRef.current = next
    next?.addEventListener('wheel', handleWheel, { passive: true })
    next?.addEventListener('scroll', handleScroll, { passive: true })
  })

  /** enabled 切换时同步状态 */
  useEffect(() => {
    setShouldAutoScroll(enabled)
  }, [enabled])

  /** 卸载时移除监听 */
  useEffect(
    () => () => {
      elRef.current?.removeEventListener('wheel', handleWheel)
      elRef.current?.removeEventListener('scroll', handleScroll)
    },
    [],
  )

  return {
    /** 当前是否应自动滚到底（响应式，用于渲染） */
    shouldAutoScroll,
    /** 同上 ref 版（用于回调 / effect，避免闭包过期） */
    shouldAutoScrollRef,
    /** 最近滚轮是否向下 */
    isDownScrollRef,
    /** callback ref：绑定到滚动容器（普通 div ref 或 virtuoso scrollerRef） */
    bindScrollEl,
    /** 手动设置自动滚动开关（如「发送消息」时强制恢复跟随） */
    setShouldAutoScroll,
  }
}

/** 是否接近底部 */
function isNearBottom(el: HTMLElement | null, threshold: number): boolean {
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
}

export type UseAutoScrollBottomOptions = {
  /**
   * 自动滚动总开关，false 时不自动滚动
   * @default true
   */
  enabled?: boolean
  /**
   * 距底多少 px 内算「在底部」
   * @default 5
   */
  threshold?: number
}
