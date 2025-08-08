import type { IShape, Rect, ShapeId } from '../utils/types'
import { rectsIntersect } from '../utils/geometry'

/**
 * 场景容器
 * - 维护形状列表与 id 索引，支持 zIndex 排序与矩形查询
 */
export class Scene {
  private shapes: IShape[] = []
  private idToShape: Map<ShapeId, IShape> = new Map()
  private sortDirty = false

  /** 添加形状（重复 id 忽略） */
  add(shape: IShape): void {
    if (this.idToShape.has(shape.id))
      return
    this.shapes.push(shape)
    this.idToShape.set(shape.id, shape)
    this.sortDirty = true
  }

  /** 根据 id 移除形状 */
  remove(id: ShapeId): void {
    const s = this.idToShape.get(id)
    if (!s)
      return
    this.idToShape.delete(id)
    const idx = this.shapes.indexOf(s)
    if (idx >= 0)
      this.shapes.splice(idx, 1)
  }

  /** 清空所有形状 */
  clear(): void {
    this.idToShape.clear()
    this.shapes.length = 0
  }

  /** 根据 id 获取形状 */
  getById(id: ShapeId): IShape | undefined {
    return this.idToShape.get(id)
  }

  /** 获取全部形状（按 zIndex 排序） */
  getAll(): IShape[] {
    if (this.sortDirty) {
      this.shapes.sort((a, b) => a.zIndex - b.zIndex)
      this.sortDirty = false
    }
    return this.shapes
  }

  /** 标记需要重新排序 */
  markSortDirty(): void {
    this.sortDirty = true
  }

  /**
   * 按矩形查询候选形状（初版线性扫描）
   * - 后续将接入 QuadTree 以提升性能
   */
  queryByRect(rect: Rect): IShape[] {
    /** 初版线性扫描，后续接入 QuadTree */
    const result: IShape[] = []
    const arr = this.getAll()
    for (let i = 0; i < arr.length; i++) {
      const shape = arr[i]
      if (!shape.visible)
        continue
      const b = shape.getBounds()
      if (rectsIntersect(rect, b))
        result.push(shape)
    }
    return result
  }
}
