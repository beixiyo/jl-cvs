export interface ILifecycleManager {
  /** 销毁实例 */
  dispose: (...args: any[]) => void
  /** 绑定事件 */
  bindEvent: (...args: any[]) => void
  /** 解绑所有事件 */
  rmEvent: (...args: any[]) => void
}
