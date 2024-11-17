/**
 * 从数组删除某一项
 * @param arr 
 * @param target 要删除的目标
 */
export const delFromItem = <T>(arr: T[], target: T) => {
  const index = arr.indexOf(target)
  index !== -1 && arr.splice(index, 1)
}

/**
 * 获取随机范围数值，不包含最大值
 * @param min 最小值
 * @param max 最大值
 * @param enableFloat 是否返回浮点数，默认 false
 */
export function getRandomNum(min: number, max: number, enableFloat = false) {
  const r = Math.random()

  if (!enableFloat) {
    return Math.floor(r * (max - min) + min)
  }

  if (r < .01) return min
  return r * (max - min) + min
}

/**
 * 解决 Number.toFixed 计算错误
 * @example
 * 1.335.toFixed(2) => '1.33'
 * numFixed(1.335) => 1.34
 *
 * @param num 数值
 * @param precision 精度 默认 2
 */
export function numFixed(num: number, precision = 2) {
  const scale = 10 ** precision
  return Math.round(num * scale) / scale
}

/** 获取一个随机字符串 */
export function getRandomStr() {
  return Math.random().toString(36)[2]
}

/**
 * 创建撤销、重做列表
 */
export function createUnReDoList<T>() {
  const undoList = [] as T[],
    redoList = [] as T[]

  return {
    undoList,
    redoList,
    /** 添加一项 */
    add: (item: T) => {
      undoList.push(item)
      redoList.splice(0)
    },
    /** 获取最后一项 */
    getLast: () => undoList[undoList.length - 1],
    /** 清空 */
    clear: () => {
      undoList.splice(0)
      redoList.splice(0)
    },

    /** 撤销 */
    undo: (callback: (item: T) => void) => {
      if (undoList.length <= 0) return

      redoList.push(undoList.pop()!)
      callback(undoList[undoList.length - 1])
    },
    /** 重做 */
    redo: (callback: (item: T) => void) => {
      if (redoList.length <= 0) return

      undoList.push(redoList.pop()!)
      callback(undoList[undoList.length - 1])
    }
  }
}


/**
 * 节流
 * @param delay 延迟时间（ms），@default 200
 */
export function throttle<R, P extends any[]>(
  fn: (...args: P) => R,
  delay = 200
) {
  let st = 0

  return function (this: any, ...args: P) {
    const now = Date.now()
    if (now - st > delay) {
      st = now
      return fn.apply(this, args) as R
    }
  }
}

/**
 * 防抖
 * @param delay 延迟时间（ms），@default 200
 */
export function debounce<R, P extends any[]>(
  fn: (...args: P) => R,
  delay = 200
) {
  let id: number

  return function (this: any, ...args: P) {
    id && clearTimeout(id)
    id = window.setTimeout(() => {
      return fn.apply(this, args) as R
    }, delay)
  }
}