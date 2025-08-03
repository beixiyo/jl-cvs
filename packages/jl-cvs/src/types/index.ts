export interface ILifecycleManager {
  /** 销毁实例 */
  dispose: () => void
  /** 绑定事件 */
  bindEvent: () => void
  /** 解绑所有事件 */
  rmEvent: () => void
}
