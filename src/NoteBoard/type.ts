import type { ShapeType, UnRedoReturn } from '@/Shapes'
import type { BaseShape } from '@/Shapes/BaseShape'
import type { UnRedoLinkedList } from '@/utils'
import type { PartRequired } from '@jl-org/ts-tool'

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

export type Mode = 'draw' | 'erase' | 'drag' | 'none' | ShapeType

type OnUnRedoParams = {
  recordPath?: RecordPath[]
  mode: Mode
  shape?: BaseShape
  shapes?: BaseShape[]
}

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

  onRedo?: (params: OnUnRedoParams) => void
  onUndo?: (params: OnUnRedoParams) => void
} & CanvasAttrs

export type NoteBoardOptionsRequired = PartRequired<
  NoteBoardOptions,
  'width' |
  'height' |
  'minScale' |
  'maxScale' |
  'lineWidth' |
  'strokeStyle' |
  'lineCap' |
  'globalCompositeOperation'
>


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
  globalCompositeOperation?: GlobalCompositeOperation

  [K: string]: any
}

export type DrawImgOptions = {
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
  afterDraw?: (imgInfo?: ImgInfo) => void
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
  /** 
   * 是否记录图片信息，后续导出图片时调整大小需要
   * @default true
   */
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

export type RecordPath = {
  path: {
    moveTo: [number, number]
    lineTo: [number, number]
  }[]
  canvasAttrs: Omit<CanvasAttrs, 'width' | 'height'>
  mode: Mode
  shapes: BaseShape[]
}

export type ExportOptions = {
  /**
   * 导出时，仅仅把图片区域内容导出，而不是整个画布，并且还原图片大小
   * ### 需要在 drawImg 时记录 imgInfo 后才有此区域
   */
  exportOnlyImgArea?: boolean
  /**
   * 图片的 MIME 格式
   */
  mimeType?: string
  /**
   * 压缩质量
   */
  quality?: number
  /**
   * 指定导出的画布
   */
  canvas?: HTMLCanvasElement
}

export type CanvasItem = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  name: string
}

export type DrawMapVal = {
  unRedo: (options: {
    type: 'undo' | 'redo'
  }) => UnRedoReturn | undefined

  draw: VoidFunction
  getHistory: () => UnRedoLinkedList<RecordPath[]>

  /**
   * 同步图形绘制记录到 NoteBoard 类
   */
  syncShapeRecord: () => void
  cleanShapeRecord: VoidFunction
}