import type { ShapeAttrs } from './type'

export interface BaseShape {

  isInPath(
    x: number,
    y: number
  ): boolean

  shapeAttrs: ShapeAttrs
  setShapeAttrs(shapeAttrs: ShapeAttrs): void

}