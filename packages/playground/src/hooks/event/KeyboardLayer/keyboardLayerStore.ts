/**
 * 全局键盘交互层栈
 *
 * store 按事件类型各维护一份栈，只把事件交给该类型下优先级最高的活动层，
 * 避免嵌套浮层同时响应同一次按键；同一个层可以同时参与 keydown 和 keyup 两份栈
 */

import type { KeyEventType } from '@/utils/keyboard'

let layers: KeyboardLayerEntry[] = []
let order = 0

const listeningTypes = new Set<KeyEventType>()
const listeners = new Set<Listener>()
const KEY_EVENT_TYPES = ['keydown', 'keyup'] as const satisfies readonly KeyEventType[]

function emit() {
  for (const listener of listeners) listener()
}

function getTopLayer(eventType: KeyEventType) {
  let topLayer: KeyboardLayerEntry | undefined

  for (const layer of layers) {
    const options = layer.getOptions()
    if (!options.active || !options.eventTypes.includes(eventType)) continue
    if (
      !topLayer
      || options.priority > topLayer.getOptions().priority
      || (options.priority === topLayer.getOptions().priority && layer.order > topLayer.order)
    ) {
      topLayer = layer
    }
  }

  return topLayer
}

function handleEvent(event: KeyboardEvent) {
  const layer = getTopLayer(event.type as KeyEventType)
  if (!layer) return

  const options = layer.getOptions()
  if (!options.matches(event)) return

  if (options.consume) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (options.handlerEnabled && (options.allowRepeat || !event.repeat)) {
    const handler = event.type === 'keyup'
      ? options.onKeyUp
      : options.onKeyDown
    handler?.(event)
  }
}

function syncListener() {
  if (typeof document === 'undefined') return

  for (const eventType of KEY_EVENT_TYPES) {
    const shouldListen = !!getTopLayer(eventType)
    if (shouldListen === listeningTypes.has(eventType)) continue

    if (shouldListen) {
      listeningTypes.add(eventType)
      document.addEventListener(eventType, handleEvent, true)
    }
    else {
      listeningTypes.delete(eventType)
      document.removeEventListener(eventType, handleEvent, true)
    }
  }
}

export const keyboardLayerStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  /**
   * 指定层是否在它参与的每一种事件类型上都位于栈顶
   *
   * 返回布尔值而不是 id，是为了让 `useSyncExternalStore` 的快照天然稳定
   */
  isTopLayer(id: symbol, eventTypes: readonly KeyEventType[]) {
    return eventTypes.length > 0
      && eventTypes.every((eventType) => getTopLayer(eventType)?.id === id)
  },

  register(entry: KeyboardLayerEntry) {
    if (entry.getOptions().active) entry.order = ++order
    layers = layers.some((layer) => layer.id === entry.id)
      ? layers
      : [...layers, entry]
    syncListener()
    emit()
  },

  refresh() {
    syncListener()
    emit()
  },

  /** 仅在 inactive → active 时提升同优先级层的顺序 */
  activate(id: symbol) {
    const layer = layers.find((item) => item.id === id)
    if (!layer || !layer.getOptions().active) return

    layer.order = ++order
    syncListener()
    emit()
  },

  unregister(id: symbol) {
    if (!layers.some((layer) => layer.id === id)) return

    layers = layers.filter((layer) => layer.id !== id)
    syncListener()
    emit()
  },
}

interface KeyboardLayerEntry {
  id: symbol
  order: number
  getOptions: () => KeyboardLayerOptions
}

interface KeyboardLayerOptions {
  active: boolean
  eventTypes: readonly KeyEventType[]
  priority: number
  matches: (event: KeyboardEvent) => boolean
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  handlerEnabled: boolean
  allowRepeat: boolean
  consume: boolean
}

type Listener = () => void
