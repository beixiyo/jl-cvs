/**
 * 让你能用 Promise 的形式获取最新的 state
 * @example
 * ```ts
 * const [count, setCount] = useStateWithPromise(0)
 *
 * const newCount = await setCount(count + 1)
 * console.log(newCount) // 1
 * ```
 */
export function useStateWithPromise<T>(initState: T) {
  const [state, setState] = useState({
    value: initState,
    resolve: (_v: any) => { },
  })

  useEffect(() => {
    state.resolve(state.value)
  }, [state])

  return [
    state.value,
    (updater: any) => new Promise<{ value: T }>((resolve) => {
      let nextVal = updater

      setState((prevState) => {
        if (typeof updater === 'function') {
          nextVal = updater(prevState.value)
        }

        return {
          value: nextVal,
          resolve,
        }
      })
    }),
  ] as const
}
