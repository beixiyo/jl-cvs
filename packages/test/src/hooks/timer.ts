import { applyAnimation, Clock } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useUpdateEffect } from './lifecycle'

/**
 * 延迟加载组件，直到指定帧数后停止
 *
 * @example
 * ```ts
 * const defer = useDefer(60)
 *
 * // 59帧 后才渲染组件
 * {defer(59) && <Component />}
 * ```
 *
 * @param stopFrame 停止的帧数
 * @returns 一个函数，返回当前帧数是否大于指定帧数
 */
export function useDefer(stopFrame: number) {
  /**
   * 当前帧数
   */
  const [curFrame, setCurFrame] = useState<number>(0)

  useEffect(() => {
    const stop = applyAnimation(() => {
      setCurFrame((curFrame) => {
        const nextFrame = curFrame + 1

        if (nextFrame > stopFrame) {
          stop()
        }

        return nextFrame
      })
    })

    return stop
  }, [stopFrame])

  return (frame: number) => curFrame >= frame
}

/**
 * 间隔时间执行函数，类似 setInterval，但是性能更好，并且会自动清理
 * @param fn 执行的函数
 * @returns 开始函数、清理函数
 */
export function useTimer(
  fn: VoidFunction,
  {
    durationMS = 1000,
    immediate = true,
  }: TimerOpts = {},
) {
  const tick = useRef(durationMS / durationMS)

  /**
   * 当他的值变化了，就会触发依赖变化，重新执行计时器
   * ### 控制重新执行的函数
   */
  const [startController, setStartController] = useState(0)
  const stopFn = useRef(() => { })
  const effectFn = immediate
    ? useEffect
    : useUpdateEffect

  /**
   * 开始执行函数
   */
  effectFn(() => {
    tick.current = durationMS / durationMS
    const clock = new Clock()

    stopFn.current()
    stopFn.current = applyAnimation(() => {
      /**
       * 没到时间，则返回
       */
      if (clock.elapsedMS / durationMS <= tick.current) {
        return
      }

      tick.current++
      fn?.()
    })

    return stopFn.current
  }, [durationMS, fn, startController])

  return {
    start: useCallback(() => setStartController(v => v + 1), []),
    stop: useCallback(() => stopFn.current(), []),
  }
}

interface TimerOpts {
  /**
   * 刷新时间
   * @default 1000 即 1 秒执行一次
   */
  durationMS?: number
  /**
   * 是否立即执行
   * @default true
   */
  immediate?: boolean
}
