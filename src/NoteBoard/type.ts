export type MouseEventFn = (e: MouseEvent) => void

export type Mode = 'draw' | 'erase' | 'drag' | 'none'

export type NoteBoardOptions = {
    canvas?: HTMLCanvasElement

    onMouseDown?: MouseEventFn
    onMouseMove?: MouseEventFn
    onMouseUp?: MouseEventFn
    onMouseLeave?: MouseEventFn

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