/**
 * 创建撤销、重做链表
 */
export class UnRedoLinkedList<T> {
  /** 头节点 */
  head: UnRedoNode<T> | null = null
  /** 尾节点 */
  tail: UnRedoNode<T> | null = null
  /** 当前节点 */
  curNode: UnRedoNode<T> | null = null

  private nextIndex = 0
  /**
   * 当 undo 退无可退时，需要标记
   * 下次 redo 时，返回第一个节点
   */
  private isInit = false
  /**
   * 是否需要清空所有节点
   */
  private needCleanAll = false

  private nodeMap: Map<number, UnRedoNode<T>> = new Map()

  /**
   * 添加新元素
   */
  add(item: T): UnRedoNode<T> {
    const newNode: UnRedoNode<T> = {
      id: this.nextIndex++,
      value: item,
      prev: this.curNode,
      next: null,
    }

    /** 如果当前节点存在，截断后续链接 */
    if (this.curNode) {
      this.curNode.next = newNode
    }

    /** 更新尾节点和当前节点 */
    this.tail = newNode
    this.curNode = newNode

    /** 首次设置头节点 */
    if (!this.head) {
      this.head = newNode
    }

    /** 缓存节点 */
    this.nodeMap.set(newNode.id, newNode)

    return newNode
  }

  undo(): UnRedoNode<T> | null {
    if (!this.curNode || !this.curNode.prev) {
      this.isInit = true
      this.needCleanAll = true
      return null
    }

    this.curNode = this.curNode.prev
    return this.curNode
  }

  redo(): UnRedoNode<T> | null {
    this.needCleanAll = false

    if (this.isInit) {
      this.isInit = false
      return this.head
    }
    if (!this.curNode || !this.curNode.next)
      return null

    this.curNode = this.curNode.next
    return this.curNode
  }

  /**
   * 获取当前元素
   */
  get curValue(): T | null {
    return this.curNode?.value ?? null
  }

  /**
   * 获取尾元素
   */
  get tailValue(): T | null {
    return this.tail?.value ?? null
  }

  /**
   * 获取头元素
   */
  get headValue(): T | null {
    return this.head?.value ?? null
  }

  get length(): number {
    return this.nodeMap.size
  }

  /**
   * 获取指定索引的节点
   */
  findById(id: number): UnRedoNode<T> | null {
    return this.nodeMap.get(id) ?? null
  }

  /**
   * 遍历整个链表
   * @param endId 结束节点 id
   */
  forEach(
    callback: (node: UnRedoNode<T>) => void,
    endCondition?: (node: UnRedoNode<T>) => boolean,
  ) {
    let current = this.head
    while (current) {
      if (endCondition?.(current)) {
        return
      }

      callback(current)
      current = current.next
    }
  }

  /**
   * 清理不再需要的节点
   */
  cleanUnusedNodes(callback?: (isCleanAll: boolean) => void) {
    if (this.needCleanAll) {
      this.needCleanAll = false
      this.cleanAll()
      callback?.(true)
      return
    }

    callback?.(false)
    const keepIndices = new Set<number>()

    /** 标记需要保留的节点 */
    let current = this.curNode
    while (current) {
      keepIndices.add(current.id)
      current = current.prev
    }

    /** 移除不再需要的节点 */
    for (const [id] of this.nodeMap.entries()) {
      if (!keepIndices.has(id)) {
        this.nodeMap.delete(id)
      }
    }

    if (this.curNode) {
      this.curNode.next = null
      this.tail = this.curNode
    }
  }

  /**
   * 清空所有节点
   */
  cleanAll() {
    this.nodeMap.clear()
    this.head = null
    this.tail = null
    this.curNode = null
  }
}

/**
 * 创建撤销、重做列表
 */
export function createUnReDoList<T>() {
  const undoList = [] as T[]
  const redoList = [] as T[]

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
      if (undoList.length <= 0)
        return

      redoList.push(undoList.pop()!)
      const item = undoList[undoList.length - 1]
      callback?.(item)
      return item
    },
    /** 重做 */
    redo: (callback?: (item: T) => void) => {
      if (redoList.length <= 0)
        return

      undoList.push(redoList.pop()!)
      const item = undoList[undoList.length - 1]
      callback?.(item)
      return item
    },
  }
}

export interface UnRedoNode<T> {
  id: number
  value: T
  prev: UnRedoNode<T> | null
  next: UnRedoNode<T> | null
}
