/**
 * 基于双向链表实现的撤销/重做管理器。
 * 它通过存储操作节点来工作，内存效率高，适合记录结构化数据（如绘图指令）。
 * @template T 历史记录中每个节点存储的数据类型。
 * @example
 * ```ts
 * const history = new UnRedoLinkedList<string>();
 *
 * history.add('Action 1');
 * history.add('Action 2');
 * console.log(history.curValue); // 'Action 2'
 * console.log(history.canUndo);   // true
 * console.log(history.canRedo);   // false
 *
 * history.undo();
 * console.log(history.curValue); // 'Action 1'
 * console.log(history.canRedo);   // true
 *
 * history.redo();
 * console.log(history.curValue); // 'Action 2'
 *
 * history.undo();
 * history.add('Action 3'); // 在撤销后添加新动作
 * console.log(history.curValue); // 'Action 3'
 * console.log(history.canRedo);   // false, 因为 'Action 2' 的路径已被剪除
 * ```
 */
export class UnRedoLinkedList<T> {
  /** 头节点 */
  head: UnRedoNode<T> | null = null
  /** 尾节点 */
  tail: UnRedoNode<T> | null = null
  /**
   * 当前节点。
   * 当为 null 时，表示在最原始的初始状态。
   */
  curNode: UnRedoNode<T> | null = null

  private nextIndex = 0

  /**
   * 通知外部是否清空后续所有节点，当 cleanUnusedNodes 调用时告知用户
   */
  private needCleanAll = false
  private nodeMap: Map<number, UnRedoNode<T>> = new Map()

  /**
   * 添加一个新状态到历史记录中。
   * 这会自动清理掉所有可 "重做" 的历史路径。
   * @param item 要添加到历史记录中的新数据。
   * @returns 创建的新节点。
   */
  add(item: T): UnRedoNode<T> {
    this.cleanUnusedNodes()

    const newNode: UnRedoNode<T> = {
      id: this.nextIndex++,
      value: item,
      prev: this.curNode,
      next: null,
    }

    if (this.curNode) {
      this.curNode.next = newNode
    }

    this.tail = newNode
    this.curNode = newNode

    /** 如果头节点不存在，新节点就是头节点 */
    if (!this.head) {
      this.head = newNode
    }

    this.nodeMap.set(newNode.id, newNode)
    return newNode
  }

  /**
   * 撤销到上一个状态。
   * @returns 返回上一个状态的节点，如果已经是初始状态，则返回 null。
   */
  undo(): UnRedoNode<T> | null {
    if (!this.canUndo) {
      this.needCleanAll = true
      return null
    }

    this.curNode = this.curNode!.prev
    return this.curNode
  }

  /**
   * 重做到下一个状态。
   * @returns 返回下一个状态的节点，如果没有可重做的状态，则返回 null。
   */
  redo(): UnRedoNode<T> | null {
    this.needCleanAll = false
    const nextNode = !this.curNode
      ? this.head // 从初始状态重做，应回到第一个节点
      : this.curNode.next

    if (!nextNode)
      return null

    this.curNode = nextNode
    return this.curNode
  }

  /**
   * 是否可以执行撤销操作。
   */
  get canUndo(): boolean {
    return this.curNode !== null
  }

  /**
   * 是否可以执行重做操作。
   */
  get canRedo(): boolean {
    if (!this.curNode)
      return this.head !== null // 在初始状态，只要有历史记录就可以重做

    return this.curNode.next !== null
  }

  /**
   * 获取当前状态节点的值。
   */
  get curValue(): T | null {
    return this.curNode?.value ?? null
  }

  /**
   * 获取尾节点（最新状态）的值。
   */
  get tailValue(): T | null {
    return this.tail?.value ?? null
  }

  /**
   * 获取头节点（最旧状态）的值。
   */
  get headValue(): T | null {
    return this.head?.value ?? null
  }

  /**
   * 获取历史记录的长度。
   */
  get length(): number {
    return this.nodeMap.size
  }

  /**
   * 通过 ID 查找并返回一个历史节点。
   * @param id 节点的唯一ID。
   * @returns 找到的节点或 null。
   */
  findById(id: number): UnRedoNode<T> | null {
    return this.nodeMap.get(id) ?? null
  }

  /**
   * 从头到尾遍历整个链表。
   * @param callback 对每个节点执行的回调函数。
   * @param endCondition 一个可选的函数，若返回 true，则提前中止遍历。
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
   * 清理当前节点之后的所有 "重做" 路径。
   * 在 add 新节点时会自动调用，通常无需手动调用。
   */
  cleanUnusedNodes(callback?: (isCleanAll: boolean) => void) {
    if (this.needCleanAll) {
      this.needCleanAll = false
      this.cleanAll()
      callback?.(true)
      return
    }

    callback?.(false)

    /** 如果当前节点已经是尾节点，无需清理 */
    if (!this.curNode?.next)
      return

    /** 从当前节点的下一个节点开始，移除所有后续节点 */
    /** 显式声明 current 类型为可空，以修复 TypeScript 推断错误 */
    let current: UnRedoNode<T> | null = this.curNode.next
    while (current) {
      this.nodeMap.delete(current.id)
      current = current.next
    }

    /** 截断链接 */
    this.curNode.next = null
    this.tail = this.curNode
  }

  /**
   * 彻底清空所有历史记录。
   */
  cleanAll() {
    this.nodeMap.clear()
    this.head = null
    this.tail = null
    this.curNode = null
  }
}

/**
 * 创建一个基于数组实现的、简单的撤销/重做管理器。
 * 它通过存储两个列表（`undoList` 和 `redoList`）来工作，适合管理原子性的状态快照（如 base64 图像）。
 * @template T 历史记录中每个状态的数据类型。
 * @returns 返回一个包含撤销/重做功能的对象。
 * @example
 * ```ts
 * const history = createUnReDoList<string>();
 *
 * history.add('State 1');
 * history.add('State 2');
 * console.log(history.getLast()); // 'State 2'
 * console.log(history.canUndo()); // true
 * console.log(history.canRedo()); // false
 *
 * history.undo();
 * console.log(history.getLast()); // 'State 1'
 * console.log(history.canRedo()); // true
 *
 * history.redo();
 * console.log(history.getLast()); // 'State 2'
 * ```
 */
export function createUnReDoList<T>() {
  const undoList = [] as T[]
  const redoList = [] as T[]

  return {
    undoList,
    redoList,

    /** 是否可以执行撤销操作。 */
    canUndo: () => undoList.length > 0,
    /** 是否可以执行重做操作。 */
    canRedo: () => redoList.length > 0,

    /** 添加一个新状态。这会清空所有可重做的状态。 */
    add: (item: T) => {
      undoList.push(item)
      /** 添加新项时，重做列表必须清空 */
      if (redoList.length > 0)
        redoList.splice(0)
    },
    /** 获取当前（最新）的状态。 */
    getLast: () => undoList[undoList.length - 1],

    /** 彻底清空所有历史状态。 */
    cleanAll: () => {
      undoList.splice(0)
      redoList.splice(0)
    },

    /**
     * 撤销到上一个状态。
     * @param callback 一个可选的回调函数，接收撤销后的当前状态作为参数。
     * @returns 返回撤销后的当前状态。
     */
    undo: (callback?: (item: T) => void) => {
      if (undoList.length <= 0) {
        callback?.(undefined as any) // 保持回调行为一致性
        return
      }

      redoList.push(undoList.pop()!)
      const item = undoList[undoList.length - 1]
      callback?.(item)
      return item
    },
    /**
     * 重做到下一个状态。
     * @param callback 一个可选的回调函数，接收被重做的状态作为参数。
     * @returns 返回被重做的状态。
     */
    redo: (callback?: (item: T) => void) => {
      if (redoList.length <= 0) {
        callback?.(undefined as any)
        return
      }

      const item = redoList.pop()!
      undoList.push(item)
      callback?.(item)
      return item
    },
  }
}

/**
 * UnRedoLinkedList 的节点接口。
 * @internal
 */
export interface UnRedoNode<T> {
  id: number
  value: T
  prev: UnRedoNode<T> | null
  next: UnRedoNode<T> | null
}
