export type EventMap = Record<string, any>

export class EventEmitter<EM extends EventMap> {
  private listeners: { [K in keyof EM]?: Array<(payload: EM[K]) => void> } = {}

  on<K extends keyof EM>(type: K, handler: (payload: EM[K]) => void): () => void {
    const arr = (this.listeners[type] ??= [])
    arr.push(handler as any)
    return () => this.off(type, handler)
  }

  off<K extends keyof EM>(type: K, handler: (payload: EM[K]) => void): void {
    const arr = this.listeners[type]
    if (!arr)
      return
    const idx = arr.indexOf(handler as any)
    if (idx >= 0)
      arr.splice(idx, 1)
  }

  emit<K extends keyof EM>(type: K, payload: EM[K]): void {
    const arr = this.listeners[type]
    if (!arr || arr.length === 0)
      return;
    /** 复制数组，避免回调中再次注册/注销影响本轮调用 */
    [...arr].forEach(fn => fn(payload))
  }

  clearAll(): void {
    (Object.keys(this.listeners) as Array<keyof EM>).forEach(k => (this.listeners[k] = []))
  }
}
