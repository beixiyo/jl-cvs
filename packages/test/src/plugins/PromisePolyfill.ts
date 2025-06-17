export function PromisePolyfill() {
  // @ts-ignore
  if (Promise.withResolvers) {
    return
  }

  Promise.withResolvers = function <T>() {
    let resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void

    const promise = new Promise<T>((_res, _rej) => {
      resolve = _res
      reject = _rej
    })

    return {
      resolve: resolve!,
      reject: reject!,
      promise,
    }
  }
}
