interface PromiseWithResolvers<T> {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

declare interface PromiseConstructor {
  withResolvers: <T>() => PromiseWithResolvers<T>
}
