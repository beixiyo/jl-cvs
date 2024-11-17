export type MouseEventFn = (e: MouseEvent) => void

export type ZoomFn = (
  params: {
    scale: number
    e: WheelEvent
  }
) => void

export type DragFn = (
  params: {
    translateX: number
    translateY: number
    transformOriginX: number
    transformOriginY: number
    e: MouseEvent
  }
) => void

export type Mode = 'draw' | 'erase' | 'drag' | 'none'

export type NoteBoardOptions = {
  el: HTMLElement
  /**
   * @default 0.5
   */
  minScale?: number
  /**
   * @default 8
   */
  maxScale?: number

  onMouseDown?: MouseEventFn
  onMouseMove?: MouseEventFn
  onMouseUp?: MouseEventFn
  onMouseLeave?: MouseEventFn

  onWheel?: ZoomFn
  onDrag?: DragFn

  onRedo?: (base64: string) => void
  onUndo?: (base64: string) => void
} & CanvasAttrs


export type CanvasAttrs = {
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
  /** 填充色 */
  fillStyle?: string
  lineCap?: CanvasPathDrawingStyles['lineCap']

  /**
   * 宽度
   * @default 800
   */
  width?: number
  /**
   * 高度
   * @default 600
   */
  height?: number

  /**
   * 画笔模式，默认 source-over
   */
  drawGlobalCompositeOperation?: GlobalCompositeOperation

  [K: string]: any
}

export type DrawImgOpts = {
  /**
   * 图片宽度
   * @default Image.width
   */
  imgWidth?: number
  /**
   * 图片高度
   * @default Image.height
   */
  imgHeight?: number
  /**
   * 绘制之前的回调
   */
  beforeDraw?: () => void
  /**
   * 绘制之后回调图片信息给你
   */
  afterDraw?: (imgInfo: ImgInfo) => void
  /**
   * 是否先清除画布
   * @default false
   */
  needClear?: boolean
  /**
   * 是否居中
   * @default false
   */
  center?: boolean
  /**
   * 自适应大小，保持宽高比的情况下，使图片适应画布大小
   * @default false
   */
  autoFit?: boolean
  /** 指定画布上下文，默认背景画布上下文 */
  context?: CanvasRenderingContext2D
  /** 是否记录图片信息，后续导出图片时调整大小需要 */
  needRecordImgInfo?: boolean
}

export type ImgInfo = {
  img: HTMLImageElement
  minScale: number
  scaleX: number
  scaleY: number

  x: number
  y: number

  drawWidth: number
  drawHeight: number
  rawWidth: number
  rawHeight: number
}