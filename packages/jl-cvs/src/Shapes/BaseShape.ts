import type { Rect, ShapeStyle } from './type'
import { uniqueId } from '@jl-org/tool'

/**
 * Canvas系统元数据
 * 用于存放形状在Canvas系统中需要的额外属性
 */
export interface ShapeMeta {
  /** 形状唯一标识 */
  id: string
  /** zIndex 越大越后绘制 */
  zIndex: number
  /** 是否可见 */
  visible: boolean
}

export abstract class BaseShape {
  abstract ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

  abstract startX: number
  abstract startY: number
  abstract endX: number
  abstract endY: number

  abstract shapeStyle: ShapeStyle
  abstract setShapeStyle(shapeStyle: ShapeStyle): void

  /**
   * Canvas系统元数据
   * 用于存放Canvas系统需要的额外属性（id、zIndex、visible等）
   */
  meta: ShapeMeta = {
    id: uniqueId(),
    zIndex: 0,
    visible: true,
  }

  constructor(opts: { meta?: ShapeMeta }) {
    opts.meta && (this.meta = opts.meta)
  }

  /**
   * 绘制形状
   * @param ctx - 可选的 Canvas 渲染上下文
   */
  abstract draw(ctx?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void

  abstract isInPath(x: number, y: number): boolean

  /** 获取包围盒 */
  getBounds(): Rect {
    const minX = Math.min(this.startX, this.endX)
    const minY = Math.min(this.startY, this.endY)
    const maxX = Math.max(this.startX, this.endX)
    const maxY = Math.max(this.startY, this.endY)

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }
}
