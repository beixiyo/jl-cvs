/**
 * @example
 * ```tsx
 * const dataLoader = createSuspenseData(() => { ... })
 *
 * const Comp = () => {
 *   const data = dataLoader.read()
 *   return <div>
 *     {data.map(it => <img key={it.base64} src={it.base64} />)}
 *   </div>
 * }
 *
 * const App = () => <Suspense fallback='loading...'>
 *   <Comp />
 * </Suspense>
 * export default App
 * ```
 */
export function createSuspenseData<T>(
  task: () => Promise<T>,
  loadMore?: (
    lastData: T,
    status: Status
  ) => Promise<T>,
) {
  let status: Status = 'pending'
  let result: T

  const suspender = new Promise<T>(async (resolve, reject) => {
    try {
      const data = await task()

      result = data
      status = 'success'
      resolve(result)
    }
    catch (error) {
      status = 'error'
      reject(error)
    }
  })

  return {
    read() {
      if (status !== 'success') {
        throw suspender
      }
      return result
    },
    async loadMore() {
      if (status !== 'success') {
        throw suspender
      }

      if (!loadMore)
        return result

      const data = await loadMore(result, status)
      result = data
      status = 'success'
      return result
    },
  }
}

export type Status = 'pending' | 'success' | 'error'
