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
        e: MouseEvent
    }
) => void

export type Mode = 'draw' | 'erase' | 'drag' | 'none'

export type NoteBoardOptions = {
    el: HTMLElement

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

    /**
     * 画笔模式，默认 source-over
     */
    drawGlobalCompositeOperation?: GlobalCompositeOperation

    [K: string]: any
}

export type DrawImgOpts = {
    /**
     * 绘制之后回调图片给你，你可以设置图片参数
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
     * 自适应大小
     * @default false
     */
    autoFit?: boolean
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