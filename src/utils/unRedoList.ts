/**
 * 创建撤销、重做链表
 */
export class UnRedoLinkedList<T> {

  /** 头节点 */
  head: UnRedoNode<T> | null = null
  /** 尾节点 */
  tail: UnRedoNode<T> | null = null
  /** 当前节点 */
  currentNode: UnRedoNode<T> | null = null

  private nextIndex = 0;
  private nodeMap: Map<number, UnRedoNode<T>> = new Map()

  /**
   * 添加新元素
   */
  add(item: T): UnRedoNode<T> {
    const newNode: UnRedoNode<T> = {
      index: this.nextIndex++,
      value: item,
      prev: this.currentNode,
      next: null
    }

    // 如果当前节点存在，截断后续链接
    if (this.currentNode) {
      this.currentNode.next = newNode
    }

    // 更新尾节点和当前节点
    this.tail = newNode
    this.currentNode = newNode

    // 首次设置头节点
    if (!this.head) {
      this.head = newNode
    }

    // 缓存节点
    this.nodeMap.set(newNode.index, newNode)

    return newNode
  }

  undo(): T | null {
    if (!this.currentNode || !this.currentNode.prev) return null

    this.currentNode = this.currentNode.prev
    return this.currentNode.value
  }

  redo(): T | null {
    if (!this.currentNode || !this.currentNode.next) return null

    this.currentNode = this.currentNode.next
    return this.currentNode.value
  }

  /**
   * 获取当前元素
   */
  get currentValue(): T | null {
    return this.currentNode?.value ?? null
  }

  get length(): number {
    return this.nodeMap.size
  }

  /**
   * 获取指定索引的节点
   */
  findByIndex(index: number): UnRedoNode<T> | null {
    return this.nodeMap.get(index) ?? null
  }

  forEach(callback: (node: UnRedoNode<T>) => void) {
    let current = this.head
    while (current) {
      callback(current)
      current = current.next
    }
  }

  /**
   * 清理不再需要的节点
   */
  cleanUnusedNodes() {
    const keepIndices = new Set<number>()

    // 标记需要保留的节点
    let current = this.currentNode
    while (current) {
      keepIndices.add(current.index)
      current = current.prev
    }

    // 移除不再需要的节点
    for (const [index] of this.nodeMap.entries()) {
      if (!keepIndices.has(index)) {
        this.nodeMap.delete(index)
      }
    }
  }

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

export interface UnRedoNode<T> {
  index: number
  value: T
  prev: UnRedoNode<T> | null
  next: UnRedoNode<T> | null
}
