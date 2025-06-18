export type ScratchOpts = {
  width?: number
  height?: number
  /** 背景色，默认 #999 */
  bg?: string
  /** 刮涂粗细 */
  lineWidth?: number
  lineCap?: CanvasPathDrawingStyles['lineCap']
  lineJoin?: CanvasPathDrawingStyles['lineJoin']

  ctxOpts?: CanvasRenderingContext2DSettings
}

export type mouseMoveCb = (e: MouseEvent) => void
