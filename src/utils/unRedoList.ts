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
    undo: (callback?: (item: T) => void) => {
      if (undoList.length <= 0) return

      redoList.push(undoList.pop()!)
      const item = undoList[undoList.length - 1]
      callback?.(item)
      return item
    },
    /** 重做 */
    redo: (callback?: (item: T) => void) => {
      if (redoList.length <= 0) return

      undoList.push(redoList.pop()!)
      const item = undoList[undoList.length - 1]
      callback?.(item)
      return item
    }
  }
}


export function createUnRedoLinked<T>() {
  let index = 0

  const data = {
    index: index++,
    prev: undefined,
    next: undefined,
    current: undefined
  } as UnRedoLink<T>

  function add(item: T): UnRedoLinkReturn<T> {
    if (!data.current) {
      data.current = item
      return data
    }

    const lastNode = getLast()
    if (lastNode) {
      const newNode: UnRedoLink<T> = {
        index: index++,
        current: item,
        prev: lastNode,
        next: undefined
      }
      lastNode.next = newNode

      return newNode
    }
  }

  function pop(): UnRedoLinkReturn<T> {
    const last = getLast()
    if (!last || !last.prev) return undefined

    last.prev.next = undefined
    index--
    return last
  }

  function findByIndex(index: number): UnRedoLinkReturn<T> {
    let current: UnRedoLinkReturn<T> = data
    while (current) {
      if (current.index === index) return current
      current = current.next
    }
    return undefined
  }

  function findByItem(item: T): UnRedoLinkReturn<T> {
    let current: UnRedoLinkReturn<T> = data
    while (current) {
      if (current.current === item) return current
      current = current.next
    }
    return undefined
  }

  function getLast(): UnRedoLinkReturn<T> {
    let current: UnRedoLinkReturn<T> = data
    while (current?.next) {
      current = current.next
    }
    return current === data && !data.current
      ? undefined
      : current
  }

  function walk(cb: (item: UnRedoLink<T>) => void) {
    let current: UnRedoLinkReturn<T> = data
    while (current) {
      cb(current)
      current = current.next
    }
  }

  return {
    data,

    add,
    pop,
    walk,

    findByItem,
    findByIndex,
    getLast,
  }
}


export type UnRedoLink<T> = {
  index: number
  current: T
  next?: UnRedoLink<T>
  prev?: UnRedoLink<T>
}

type UnRedoLinkReturn<T> = UnRedoLink<T> | undefined