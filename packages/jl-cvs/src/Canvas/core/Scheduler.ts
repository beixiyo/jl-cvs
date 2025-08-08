type RafHandle = number

/**
 * rAF 调度器
 * - 封装 requestAnimationFrame 循环，提供启动/停止/状态查询
 */
export class Scheduler {
  private rafId: RafHandle | null = null
  private running = false
  private loop: (ts: number) => void

  /**
   * @param loop 每帧回调，参数为高精度时间戳
   */
  constructor(loop: (ts: number) => void) {
    this.loop = loop
  }

  /** 启动循环 */
  start() {
    if (this.running)
      return
    this.running = true
    const tick = (ts: number) => {
      if (!this.running)
        return
      this.loop(ts)
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  /** 停止循环 */
  stop() {
    this.running = false
    if (this.rafId != null)
      cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  /** 是否正在运行 */
  isRunning(): boolean {
    return this.running
  }
}
