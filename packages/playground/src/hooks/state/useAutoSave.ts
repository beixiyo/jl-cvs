import { deepCompare } from '@jl-org/tool'
import { useEffect, useRef } from 'react'
import { useCustomEffect } from '../lifecycle'
import { useLatestCallback } from '../memo'
import { useLatestRef } from '../ref'
import { useWatchDebounceState } from './state'

/**
 * 自动保存 hook，使用防抖来延迟保存操作
 * - 深比较（deepCompare）值变化，与上次已保存值 / 初始值相同时不触发保存
 * - 保存期间产生的新变更会在本次保存完成后追平，避免保存窗口内的改动丢失
 * - 防抖链路依赖 setState 重渲染，组件卸载后挂起的保存会被吞掉；
 *   需要保留时开启 flushOnUnmount，在卸载时同步冲刷最新值
 * - 失败语义：saveFn 抛错时不推进已保存快照，dirty 状态保留以便重试
 *   自动触发和卸载冲刷会吞掉错误（由 saveFn 自行上报），
 *   显式调用的 flush / flushValue 会把错误抛给调用方
 * - 失败熔断：同一个值自动保存失败后不再自动重发，避免「失败 → 缓存回滚 →
 *   重渲染 → 再失败」的死循环；值改变或显式 flush 时恢复
 */
export function useAutoSave<T>(options: UseAutoSaveOptions<T>) {
  const {
    value,
    saveFn,
    delayMS = 1000 * 5,
    enable = true,
    initialValue,
    flushOnUnmount = false,
    isEqual = deepCompare,
  } = options

  const debouncedValue = useWatchDebounceState(value, delayMS)
  const lastSavedValueRef = useRef<T | undefined>(initialValue)
  const isSavingRef = useRef(false)
  const pendingSaveRef = useRef<Promise<void> | null>(null)
  /**
   * 上一次自动保存失败的值，用来熔断重试风暴
   *
   * 失败后不推进 lastSavedValue，isUnchanged 会一直为 false；
   * 而失败常常伴随缓存回滚重渲染，会把新的 initialValue 传进来再次触发本 effect，
   * 于是形成「失败 → 回滚 → 重渲染 → 再失败」的死循环（实测约 9 次/秒）
   * 这里只熔断自动触发，显式 flush / flushValue 仍可重试同一个值
   */
  const lastFailedValueRef = useRef<T | undefined>(undefined)

  const valueRef = useLatestRef(value)
  const saveFnRef = useLatestRef(saveFn)
  const enableRef = useLatestRef(enable)
  const initialValueRef = useLatestRef(initialValue)
  const flushOnUnmountRef = useLatestRef(flushOnUnmount)

  /** 该值是否无需保存（默认深比较，与上次已保存值或初始值相同） */
  const isUnchanged = (val: T) => {
    if (isEqual(val, lastSavedValueRef.current)) {
      return true
    }

    return initialValueRef.current !== undefined
      && isEqual(val, initialValueRef.current)
  }

  /** 执行保存，并循环追平保存期间产生的新变更 */
  const executeSave = useLatestCallback(async (val: T) => {
    isSavingRef.current = true

    try {
      let toSave = val
      while (true) {
        try {
          await saveFnRef.current(toSave)
        }
        catch (err) {
          /** 记录失败值，熔断自动重试；显式 flush 会清掉这个标记 */
          lastFailedValueRef.current = toSave
          throw err
        }
        /** 只有服务端确认成功后，才推进已保存快照；失败时必须保留 dirty 状态以便重试 */
        lastSavedValueRef.current = toSave
        lastFailedValueRef.current = undefined

        const latest = valueRef.current
        if (isUnchanged(latest)) {
          break
        }
        toSave = latest
      }
    }
    finally {
      isSavingRef.current = false
    }
  })

  /** 合并并发 flush；正在保存时复用同一个 Promise，由 executeSave 内部追平最新值 */
  const runSave = useLatestCallback((val: T) => {
    if (pendingSaveRef.current) return pendingSaveRef.current

    const task = executeSave(val).finally(() => {
      if (pendingSaveRef.current === task) pendingSaveRef.current = null
    })
    pendingSaveRef.current = task
    return task
  })

  /** 忽略自动保存开关，提交调用方指定的最新值 */
  const flushValue = useLatestCallback(async (valueToSave: T) => {
    if (pendingSaveRef.current) {
      await pendingSaveRef.current
      return
    }

    if (isUnchanged(valueToSave)) return

    /** 显式提交是用户意图的重试，解除熔断 */
    lastFailedValueRef.current = undefined
    await runSave(valueToSave)
  })

  /** 立即保存最新值，并等待保存期间产生的后续变更全部追平 */
  const flush = useLatestCallback(async () => {
    if (!enableRef.current) return

    await flushValue(valueRef.current)
  })
  const flushRef = useLatestRef(flush)

  useCustomEffect(
    async () => {
      /** 如果正在保存，跳过；保存完成后由 runSave 内部追平 */
      if (!enable || isSavingRef.current) {
        return
      }

      if (isUnchanged(debouncedValue)) {
        return
      }

      /**
       * 熔断：同一个值自动保存失败过就不再自动重发
       * 值改变、或调用方显式 flush / flushValue 时才恢复
       */
      if (
        lastFailedValueRef.current !== undefined
        && isEqual(debouncedValue, lastFailedValueRef.current)
      ) {
        return
      }

      /**
       * 自动触发的保存吞掉失败：错误已由 saveFn 自己上报，
       * 这里再抛只会变成未捕获 rejection。dirty 状态由 executeSave 保留，
       * 下次值变化或显式 flush 会重试
       */
      await runSave(debouncedValue).catch(() => {})
    },
    [debouncedValue, enable, initialValue, saveFnRef],
  )

  /**
   * 卸载冲刷：防抖经由 setState → 重渲染 → effect 触发保存，
   * 卸载后 setState 变 no-op，挂起的保存永远不会发出，必须在这里补发
   * 若卸载时保存正在进行，runSave 的追平循环会继续消化最新值，无需重复发送
   */
  useEffect(
    () => {
      return () => {
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        if (!flushOnUnmountRef.current) {
          return
        }

        /** 卸载后已无处呈现错误，失败只保留 dirty，不抛成未捕获 rejection */
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        void flushRef.current().catch(() => {})
      }
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return {
    /** 是否正在保存 */
    isSavingRef,
    /** 立即保存并等待最新值落盘 */
    flush,
    /** 忽略 enable 限制，立即保存指定值 */
    flushValue,
  }
}

export type UseAutoSaveOptions<T> = {
  /**
   * 需要保存的值，即输入值
   * - 对象 / 数组请保持引用稳定（useMemo），否则每次渲染都会重置防抖计时
   */
  value: T
  /**
   * 保存函数
   */
  saveFn: (value: T) => void | Promise<void>
  /**
   * 防抖时间（毫秒），默认 1000 * 5（5秒）
   * @default 1000 * 5
   */
  delayMS?: number
  /**
   * 是否启用自动保存
   * @default true
   */
  enable?: boolean
  /**
   * 初始值，用于判断是否需要保存（如果 value 等于 initialValue，则不保存）
   */
  initialValue?: T
  /**
   * 自定义值比较器，返回 true 时视为无需保存
   * @default deepCompare
   */
  isEqual?: (value: T, other: T | undefined) => boolean
  /**
   * 组件卸载时，若存在未保存的变更则立即冲刷保存
   * @default false
   */
  flushOnUnmount?: boolean
}
