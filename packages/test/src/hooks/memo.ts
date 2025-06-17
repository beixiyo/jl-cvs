/**
 * 等价于 useCallback(fn, [])
 */
export function useMemoFn<Fn extends Function = Function>(fn: Fn) {
  return useCallback<Fn>(fn, [])
}
