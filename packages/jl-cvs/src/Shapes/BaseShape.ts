import type { ShapeStyle } from './type'

export interface BaseShape {

  ctx: CanvasRenderingContext2D

  startX: number
  startY: number
  endX: number
  endY: number

  shapeStyle: ShapeStyle
  setShapeStyle(shapeStyle: ShapeStyle): void

  draw(): void

  isInPath(
    x: number,
    y: number
  ): boolean
}