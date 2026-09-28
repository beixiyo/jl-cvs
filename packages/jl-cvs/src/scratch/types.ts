export type ScratchOpts = {
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 背景色，默认 #999 */
  bg?: string
  /** 刮涂粗细 */
  lineWidth?: number
  /** 线帽 */
  lineCap?: CanvasPathDrawingStyles['lineCap']
  /** 线连接 */
  lineJoin?: CanvasPathDrawingStyles['lineJoin']

  /** 上下文选项 */
  ctxOpts?: CanvasRenderingContext2DSettings

  /** 刮动回调函数 */
  onScratch?: mouseMoveCb
}

export type mouseMoveCb = (e: MouseEvent) => void
