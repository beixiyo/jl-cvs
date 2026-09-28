import type { KeyEventType } from '@/utils/keyboard'
import { isComposingEvent, matchesKey, matchesModifiers } from '@/utils/keyboard'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { useLatestCallback } from '../../memo'
import { useLatestRef } from '../../ref'
import { keyboardLayerStore } from './keyboardLayerStore'
import type { KeyboardLayerController, UseKeyboardLayerOptions } from './types'

const DEFAULT_EVENT_TYPES: readonly KeyEventType[] = ['keydown']

const useIsomorphicLayoutEffect = typeof window === 'undefined'
  ? useEffect
  : useLayoutEffect

/**
 * 将交互区域注册到全局键盘响应栈
 *
 * 最高 priority 的层优先；同 priority 时，最近激活的层优先
 */
export function useKeyboardLayer(options: UseKeyboardLayerOptions): KeyboardLayerController {
  const {
    active,
    eventTypes,
    keys,
    codes,
    mod,
    ctrl,
    shift,
    alt,
    meta,
    when,
    ignoreComposing = true,
    priority = 0,
    onKeyDown,
    onKeyUp,
    handlerEnabled = true,
    allowRepeat = true,
    consume = true,
  } = options

  const idRef = useRef<symbol>(undefined)
  if (!idRef.current) idRef.current = Symbol('keyboard-layer')
  const id = idRef.current
  const previousActiveRef = useRef(active)

  const matches = useLatestCallback((event: KeyboardEvent) => {
    if (ignoreComposing && isComposingEvent(event)) return false
    if (!matchesKey(event, { key: keys, code: codes })) return false
    if (!matchesModifiers(event, { mod, ctrl, shift, alt, meta })) return false

    return when?.(event) ?? true
  })

  const handleKeyDown = useLatestCallback((event: KeyboardEvent) => {
    onKeyDown?.(event)
  })
  const handleKeyUp = useLatestCallback((event: KeyboardEvent) => {
    onKeyUp?.(event)
  })

  const resolvedEventTypes = useResolvedEventTypes(eventTypes, !!onKeyDown, !!onKeyUp)

  const optionsRef = useLatestRef({
    active,
    eventTypes: resolvedEventTypes,
    priority,
    matches,
    onKeyDown: onKeyDown && handleKeyDown,
    onKeyUp: onKeyUp && handleKeyUp,
    handlerEnabled,
    allowRepeat,
    consume,
  })

  useIsomorphicLayoutEffect(() => {
    keyboardLayerStore.register({
      id,
      order: 0,
      getOptions: () => optionsRef.current,
    })

    return () => keyboardLayerStore.unregister(id)
  }, [id, optionsRef])

  useIsomorphicLayoutEffect(() => {
    const wasActive = previousActiveRef.current
    previousActiveRef.current = active

    if (!wasActive && active) keyboardLayerStore.activate(id)
    else keyboardLayerStore.refresh()
  }, [active, id, priority, resolvedEventTypes])

  const getSnapshot = useCallback(
    () => keyboardLayerStore.isTopLayer(id, resolvedEventTypes),
    [id, resolvedEventTypes],
  )
  const isTopLayer = useSyncExternalStore(
    keyboardLayerStore.subscribe,
    getSnapshot,
    getSnapshot,
  )

  return {
    isTopLayer: active && isTopLayer,
  }
}

/**
 * 归一化参与响应的事件类型：显式传入优先，否则由回调存在与否推导，
 * 都没有时按 `['keydown']` 处理，保证「无回调的纯阻断层」仍然生效
 *
 * 返回引用稳定的数组，避免每次渲染都让订阅副作用重跑
 */
function useResolvedEventTypes(
  eventTypes: readonly KeyEventType[] | undefined,
  hasKeyDown: boolean,
  hasKeyUp: boolean,
): readonly KeyEventType[] {
  const explicit = eventTypes?.join(',')

  return useMemo(() => {
    if (explicit) return explicit.split(',') as KeyEventType[]

    const derived: KeyEventType[] = []
    if (hasKeyDown) derived.push('keydown')
    if (hasKeyUp) derived.push('keyup')

    return derived.length > 0
      ? derived
      : DEFAULT_EVENT_TYPES
  }, [explicit, hasKeyDown, hasKeyUp])
}
