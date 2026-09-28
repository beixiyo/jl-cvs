export interface ILifecycleManager {
  /** 销毁实例 */
  dispose: (...args: any[]) => void
  /** 绑定事件 */
  bindEvent: (...args: any[]) => void
  /** 解绑所有事件 */
  rmEvent: (...args: any[]) => void
}

/**
 * 将指定字段改为可选
 */
export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>

/**
 * 将指定字段改为必填
 */
export type PartRequired<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>
