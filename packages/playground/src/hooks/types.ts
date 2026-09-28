import type { Dispatch, SetStateAction } from 'react'

export type SetterParam<T> =
  | PrimitiveOrPartial<T>
  | ((prevState: T) => PrimitiveOrPartial<T>)

export interface SetterFn<T> {
  (value: SetterParam<T>): void
  reset: () => void
}

export interface SetterFnWittGetLatest<T> {
  (value: SetterParam<T>): void
  getLatest: () => T
  reset: () => void
}

export type UseGetStateReturn<T, V extends boolean> = V extends false ? [T, SetterFn<T>]
  : [T, SetterFnWittGetLatest<T>]

export type PrimitiveOrPartial<T> = T extends object ? Partial<T>
  : T

export interface UseReqOpts<T> {
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
  onFinally?: () => void
  setLoading?: (loading: boolean) => void

  /**
   * 请求失败时是否在触发 onError 之后向调用方 rethrow，
   * 以便 `await request()` 能感知失败（如乐观更新回滚）
   * 关闭后失败仅触发 onError、不会 reject
   * @default true
   */
  rethrow?: boolean

  /**
   * 初始数据状态，类型和请求返回值一致
   */
  initData: T
  initLoading?: boolean
}

export type SetStateParam<S> = Parameters<Dispatch<SetStateAction<S>>>[0]
