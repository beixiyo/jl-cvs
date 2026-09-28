'use client'

import { useLatestRef } from '@/hooks'
import { clamp, FakeProgress as Progress } from '@jl-org/tool'
import classnames from 'clsx'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { ProgressBar } from '../Progress'
import type { FakeProgressProps, FakeProgressRef } from '../types'

function InnerFakeProgress({
  style,
  className,

  done,
  onChange: _onChange,
  uniqueKey,
  colors = ['rgb(var(--brand) / 0.1)', 'rgb(var(--brand) / 1)'],

  showText = true,
  showBar = true,
  onlyProgressBar,
  text,
}: FakeProgressProps, ref: React.Ref<FakeProgressRef>) {
  const canUseStorage = typeof localStorage !== 'undefined'
  const [val, setVal] = useState(0)
  const onChangeRef = useLatestRef(_onChange)

  const progress = useMemo(() => {
    /**
     * 持久化进度在创建实例时读一次即可
     * 切勿把它提到 render 期再作为本 useMemo 的依赖——onChange 每帧会把 val
     * 写回 localStorage，render 期读取会让依赖随之变化、不断重建实例，
     * 进而触发 effect 连锁 clear()→end()，表现为「100% 与某数反复闪烁」
     */
    const initialProgress = uniqueKey && canUseStorage
      ? Number(localStorage.getItem(uniqueKey) || 0)
      : 0

    const instance = new Progress({
      autoStart: false,
      timeConstant: 240000,
      initialProgress,

      onChange: (val) => {
        setVal(val)
        onChangeRef.current?.(val)
        if (uniqueKey && canUseStorage) {
          localStorage.setItem(uniqueKey, val.toString())
        }

        val >= 0.95 && instance.stop()
      },
    })
    return instance
  }, [canUseStorage, uniqueKey])

  const clear = useCallback(() => {
    progress.end()
    progress.stop()
    if (uniqueKey && canUseStorage) {
      localStorage.removeItem(uniqueKey)
    }
  }, [canUseStorage, progress, uniqueKey])

  /** 将方法暴露给ref */
  useImperativeHandle(ref, () => ({
    getProgress: () => val,
    setProgress: (value: number) => {
      const clampedValue = clamp(value, 0, 1)
      progress.setProgress(clampedValue)
    },
    start: () => progress.start(),
    stop: () => progress.stop(),
    end: () => progress.end(),
    clear,
  }), [clear, val, progress])

  useEffect(() => {
    progress.start()
    return clear
  }, [clear, progress])

  useEffect(() => {
    if (!done) return
    clear()
  }, [clear, done])

  if (onlyProgressBar) {
    return <ProgressBar value={ val } colors={ colors } />
  }

  return (
    <div
      className={ classnames(
        'absolute inset-0 bg-background2 flex justify-center items-center flex-col',
        className,
      ) }
      style={ style }
    >
      { /* { showLogo && <LogoLoading size={ size } /> } */ }

      { showText && (
        <p>
          <span className="text-text">
            { text ?? 'Estimated 2 minutes, please wait patiently... ' }
          </span>
          <span className="ml-2 text-blue-600">
            { ' ' }
            { (val * 100).toString().slice(0, 5) }
            %
          </span>
        </p>
      ) }

      { showBar && (
        <ProgressBar
          value={ val }
          colors={ colors }
          className="absolute bottom-0 z-5 w-full"
        />
      ) }
    </div>
  )
}
InnerFakeProgress.displayName = 'FakeProgress'

export const FakeProgress = memo(forwardRef<FakeProgressRef, FakeProgressProps>(InnerFakeProgress))
