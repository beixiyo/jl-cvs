import type { ShapeAttrs } from './type'

export interface BaseShape {

  ctx: CanvasRenderingContext2D

  startX: number
  startY: number
  endX: number
  endY: number

  shapeAttrs: ShapeAttrs
  setShapeAttrs(shapeAttrs: ShapeAttrs): void

  draw(): void

  isInPath(
    x: number,
    y: number
  ): boolean
}