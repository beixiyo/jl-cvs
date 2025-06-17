export function arrPolyfill() {
  // @ts-ignore
  if (Array.prototype.at) {
    return
  }

  Object.defineProperty(Array.prototype, 'at', {
    value(index: number) {
      if (index < 0) {
        index += this.length
      }
      return this[index]
    },
    configurable: false,
    writable: false,
  })
}
