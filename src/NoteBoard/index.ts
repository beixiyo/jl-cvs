import type { TransferType } from '@/types'
import { clearAllCvs, createCvs } from '@/canvasTool/tools'
import { getCvsImg, type HandleImgReturn } from '@/canvasTool/handleImg'
import { mergeOpts } from './tools'


/**
 * ### 画板，提供如下功能
 * - 签名涂抹
 * - 撤销
 * - 重做
 * - 颜色等样式处理
 * - 下载图片
 */
export class NoteBoard {

    ctx: CanvasRenderingContext2D
    cvs: HTMLCanvasElement
    private opts: NoteBoardOptions

    private isDrawing = false
    private start = { x: 0, y: 0 }

    private onMousedown = this._onMousedown.bind(this)
    private onMousemove = this._onMousemove.bind(this)
    private onMouseup = this._onMouseup.bind(this)

    customMouseDown?: MouseEventFn
    customMouseMove?: MouseEventFn
    customMouseUp?: MouseEventFn

    onUndo?: () => void
    onRedo?: () => void

    /**
     * 记录
     */
    private prevList: RecordItem[] = []
    private nextList: RecordItem[] = []

    constructor(opts?: NoteBoardOptions) {
        this.opts = mergeOpts(opts)

        const {
            canvas,
            width,
            height,

            onMouseDown,
            onMouseMove,
            onMouseUp,

            onUndo,
            onRedo
        } = this.opts

        this.customMouseDown = onMouseDown
        this.customMouseMove = onMouseMove
        this.customMouseUp = onMouseUp

        this.onUndo = onUndo
        this.onRedo = onRedo

        if (!canvas) {
            const { ctx, cvs } = createCvs(width, height)
            this.ctx = ctx
            this.cvs = cvs
        }
        else {
            this.cvs = canvas
            canvas.width = width
            canvas.height = height
            this.ctx = canvas.getContext('2d')
        }

        this.init()
    }

    /**
     * 获取画板内容，默认为 base64
     * @param resType 需要返回的文件格式，默认 `base64`
     * @param type 图片的 MIME 格式
     * @param quality 压缩质量
     */
    shotImg<T extends TransferType>(
        resType: T = 'base64' as T,
        mimeType?: string,
        quality?: number
    ): HandleImgReturn<T> {
        return getCvsImg<T>(this.cvs, resType, mimeType, quality)
    }

    /**
     * 撤销
     */
    undo() {
        if (this.prevList.length < 1) {
            return 
        }

        this.nextList.push(this.prevList.pop())

        this.clear()
        this.drawRecord()
        this.onUndo?.()
    }

    /**
     * 重做
     */
    redo() {
        if (!this.nextList.length) {
            return 
        }

        this.prevList.push(this.nextList.pop())

        this.clear()
        this.drawRecord()
        this.onRedo?.()
    }

    /**
     * 清空画板
     */
    clear() {
        clearAllCvs(this.ctx, this.cvs)
    }

    /** 
     * 移除所有事件
     */
    rmEvent() {
        this.cvs.removeEventListener('mousedown', this.onMousedown)
        this.cvs.removeEventListener('mousemove', this.onMousemove)
        window.removeEventListener('mouseup', this.onMouseup)
    }

    /**
     * 根据当前配置，用 fillRect 绘制整个背景
     */
    drawBg() {
        const { ctx, cvs } = this
        const { fillStyle } = this.opts

        if (fillStyle) {
            ctx.fillStyle = fillStyle
            ctx.fillRect(0, 0, cvs.width, cvs.height)
        }
    }

    /**
     * 设置样式
     */
    setStyle(recordStyle: CanvasAttrs = {}) {
        const { ctx, cvs } = this

        for (const k in recordStyle) {
            const attr = recordStyle[k]

            if (typeof attr === 'function') {
                continue
            }

            if (k === 'width') {
                cvs.width = attr
                continue
            }
            if (k === 'height') {
                cvs.height = attr
                continue
            }

            ctx[k] = attr
        }
    }

    private init() {
        this.bindEvent()
        this.setStyle()

        const { ctx } = this
        ctx.lineCap = 'round'
        ctx.strokeStyle = this.opts.strokeStyle || '#000'
        this.ctx.lineWidth = this.opts.lineWidth || 1
    }

    private bindEvent() {
        this.cvs.addEventListener('mousedown', this.onMousedown)
        this.cvs.addEventListener('mousemove', this.onMousemove)
        window.addEventListener('mouseup', this.onMouseup)
    }

    private _onMousedown(e: MouseEvent) {
        this.customMouseDown?.(e)
        this.addNewRecord()

        this.isDrawing = true
        const { offsetX, offsetY } = e
        this.start = { x: offsetX, y: offsetY }
    }

    private _onMousemove(e: MouseEvent) {
        if (!this.isDrawing) return

        this.customMouseMove?.(e)
        const { offsetX, offsetY } = e
        const { ctx, start } = this

        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(offsetX, offsetY)
        ctx.stroke()

        this.prevList[this.prevList.length - 1].point.push({
            moveTo: [start.x, start.y],
            lineTo: [offsetX, offsetY]
        })

        this.start = { x: offsetX, y: offsetY }
    }

    private _onMouseup(e: MouseEvent) {
        this.customMouseUp?.(e)
        this.isDrawing = false
    }

    /**
     * 添加一个新的记录，并删除多余的 redo
     */
    private addNewRecord() {
        const { ctx, opts } = this

        this.nextList.splice(0)
        this.prevList.push({
            point: [],
            attr: {
                strokeStyle: opts.strokeStyle,
                lineWidth: opts.lineWidth,
                fillStyle: opts.fillStyle,
                lineCap: ctx.lineCap
            },
        })
    }

    private drawRecord() {
        const { ctx } = this

        for (let i = 0; i < this.prevList.length; i++) {
            const item = this.prevList[i]
            this.setStyle(item.attr)

            for (let j = 0; j < item.point.length; j++) {
                const point = item.point[j]

                ctx.beginPath()
                ctx.moveTo(...point.moveTo)
                ctx.lineTo(...point.lineTo)
                ctx.stroke()
            }
        }
    }

}


type MouseEventFn = (e: MouseEvent) => void

export type NoteBoardOptions = {
    canvas?: HTMLCanvasElement

    onMouseDown?: MouseEventFn
    onMouseMove?: MouseEventFn
    onMouseUp?: MouseEventFn

    onRedo?: () => void
    onUndo?: () => void
} & CanvasAttrs


type CanvasAttrs = {
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

type Position = [x: number, y: number]
type RecordItem = {
    point: {
        moveTo: Position
        lineTo: Position
    }[]
    attr: CanvasAttrs
}