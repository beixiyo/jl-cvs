export type MouseEventFn = (e: MouseEvent) => void

export type ZoomFn = (
    zoomX: number,
    zoomY: number,
    offsetX: number,
    offsetY: number,
) => void

export type DragFn = (
    x: number,
    y: number
) => void

export type Mode = 'draw' | 'erase' | 'drag' | 'none'

export type NoteBoardOptions = {
    canvas: HTMLCanvasElement

    onMouseDown?: MouseEventFn
    onMouseMove?: MouseEventFn
    onMouseUp?: MouseEventFn
    onMouseLeave?: MouseEventFn

    onWheel?: ZoomFn
    onDrag?: DragFn

    onRedo?: () => void
    onUndo?: () => void
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

    [K: string]: any
}

export type Position = [x: number, y: number]
export type RecordItem = {
    point: {
        moveTo: Position
        lineTo: Position
    }[]
    attr: CanvasAttrs
}

export type DrawImgOpts = {
    /**
     * 绘制之前回调图片给你，你可以设置图片参数
     */
    beforeDraw?: (img: HTMLImageElement, minScale: number, scaleX: number, scaleY: number) => void
    /**
     * 绘制之后回调图片给你，你可以设置图片参数
     */
    afterDraw?: (img: HTMLImageElement, minScale: number, scaleX: number, scaleY: number) => void
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
     * 自适应大小
     * @default false
     */
    autoFit?: boolean
}
