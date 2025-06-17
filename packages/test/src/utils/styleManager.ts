export function svgStyle(svg: string, opts: {
  color: string
  size: string | number
}) {
  return {
    maskImage: `url(${svg})`,
    WebkitMaskImage: `url(${svg})`,
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    backgroundColor: opts.color,

    width: opts.size,
    height: opts.size,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',

  } as React.CSSProperties
}

/**
 * 全局的 z-index 管理器
 */
export function createZIndexStore(initZIndex = 50) {
  let globalZIndex = initZIndex

  function getZIndex() {
    return globalZIndex
  }

  function increaseZindex() {
    return ++globalZIndex
  }

  function decreaseZindex() {
    return --globalZIndex
  }

  return {
    /** 获取当前的 z-index */
    getZIndex,
    /** 增加并获取当前的 z-index */
    increaseZindex,
    /** 减少并获取当前的 z-index */
    decreaseZindex,
  }
}
