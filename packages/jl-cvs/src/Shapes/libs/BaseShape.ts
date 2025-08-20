import type { BoundRect, ShapeStyle } from '../type'
import type { ShapeType } from './type'
import { uniqueId } from '@jl-org/tool'

export abstract class BaseShape {
  ctx?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

  startX: number
  startY: number
  endX: number
  endY: number

  abstract name: ShapeType
  shapeStyle: ShapeStyle = {}

  /**
   * Canvas系统元数据
   * 用于存放Canvas系统需要的额外属性（id、zIndex、visible等）
   */
  meta: ShapeMeta = {
    id: uniqueId(),
    zIndex: 0,
    visible: true,
  }

  constructor(opts: BaseShapeOpts) {
    opts.ctx && (this.ctx = opts.ctx)
    opts.meta && Object.assign(this.meta, opts.meta)

    this.startX = opts.startX
    this.startY = opts.startY
    this.endX = opts.endX ?? opts.startX
    this.endY = opts.endY ?? opts.startY

    this.setShapeStyle(opts.shapeStyle)
  }

  /**
   * 设置图形样式
   * @param shapeStyle 样式对象
   */
  setShapeStyle(shapeStyle: ShapeStyle = {}) {
    Object.assign(this.shapeStyle, shapeStyle)
  }

  /**
   * 绘制形状
   * @param ctx - 可选的 Canvas 渲染上下文
   */
  abstract draw(ctx?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void

  abstract isInPath(x: number, y: number): boolean

  /** 获取包围盒 */
  getBounds(): BoundRect {
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
  /** 图片源，用于 ImageShape */
  imgSrc?: string | HTMLImageElement
  /** 图片宽度，用于 ImageShape */
  width?: number
  /** 图片高度，用于 ImageShape */
  height?: number
}

export type BaseShapeOpts = {
  /** 起点x坐标 */
  startX: number
  /** 起点y坐标 */
  startY: number
  /** 终点x坐标 */
  endX?: number
  /** 终点y坐标 */
  endY?: number

  /** 画布上下文 */
  ctx?: CanvasRenderingContext2D
  /** 图形样式 */
  shapeStyle?: ShapeStyle
  /** Canvas系统元数据 */
  meta?: Partial<ShapeMeta>
}
