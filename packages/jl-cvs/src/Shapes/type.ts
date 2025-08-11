export type ShapeStyle = {
  /**
   * 画笔颜色
   * @default '#000'
   */
  strokeStyle?: string
  /**
   * 画笔粗细
   * @default 1
   */
  lineWidth?: number
  /**
   * 填充色
   */
  fillStyle?: string
}

export interface BoundRect {
  x: number
  y: number
  width: number
  height: number
}
