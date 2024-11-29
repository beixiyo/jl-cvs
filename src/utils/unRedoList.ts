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
