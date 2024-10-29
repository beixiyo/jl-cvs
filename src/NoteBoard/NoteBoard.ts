import type { TransferType } from '@/types'
import { clearAllCvs, createCvs } from '@/canvasTool/tools'
import { getCvsImg, type HandleImgReturn } from '@/canvasTool/handleImg'
import { getCursor, mergeOpts } from './tools'
import type { NoteBoardOptions, MouseEventFn, RecordItem, CanvasAttrs, Mode } from './type'


/**
 * ### 画板，提供如下功能
 * - 签名涂抹
 * - 擦除
 * - 撤销
 * - 重做
 * - 缩放
 * - 颜色等样式处理
 * - 下载图片
 */
export class NoteBoard {

    ctx: CanvasRenderingContext2D
    cvs: HTMLCanvasElement
    private opts: NoteBoardOptions

    mode: Mode = 'none'
    /** 开启鼠标滚轮缩放 */
    isEnableZoom = true

    /**
     * 记录缩放、位置等属性
     */
    private zoom = 1
    private isDrawing = false
    private start = { x: 0, y: 0 }

    private isDragging = false
    private dragStart = { x: 0, y: 0 }
    private offsetX = 0
    private offsetY = 0

    /** 
     * 统一事件，方便解绑
     */
    private onMousedown = this._onMousedown.bind(this)
    private onMousemove = this._onMousemove.bind(this)
    private onMouseup = this._onMouseup.bind(this)
    private onMouseLeave = this._onMouseLeave.bind(this)
    private onWheel = this._onWheel.bind(this)

    /**
     * 用户事件
     */
    customMouseDown?: MouseEventFn
    customMouseMove?: MouseEventFn
    customMouseUp?: MouseEventFn
    customMouseLeave?: MouseEventFn

    /**
     * 撤销与重做
     */
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
            onMouseLeave,

            onUndo,
            onRedo
        } = this.opts

        this.customMouseDown = onMouseDown
        this.customMouseMove = onMouseMove
        this.customMouseUp = onMouseUp
        this.customMouseLeave = onMouseLeave

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

    setMode(mode: Mode) {
        this.mode = mode

        switch (mode) {
            case 'draw':
                this.setCursor()
                this.setDefaultStyle()
                // 恢复正常模式，而非擦除模式
                this.ctx.globalCompositeOperation = 'xor'
                break

            case 'erase':
                this.setCursor()
                this.ctx.strokeStyle = 'tranparent'
                this.ctx.globalCompositeOperation = 'destination-out'
                break

            case 'none':
                this.cvs.style.cursor = 'unset'
                break

            case 'drag':
                this.cvs.style.cursor = 'grab'
                break

            default:
                break
        }
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
     * 缩放
     */
    zoomTo(scaleX: number, scaleY: number, clientX: number, clientY: number) {
        const { ctx, cvs } = this
        this.clear()

        // 获取鼠标在canvas上的坐标
        const rect = cvs.getBoundingClientRect()
        const mouseX = clientX - rect.left
        const mouseY = clientY - rect.top

        // 保存当前状态
        ctx.save()

        // 将鼠标位置移到画布中心
        ctx.translate(mouseX, mouseY)
        // 进行缩放
        ctx.scale(scaleX, scaleY)
        // 将鼠标位置移回原来的位置
        ctx.translate(-mouseX, -mouseY)

        this.drawRecord()

        // 恢复保存的状态
        ctx.restore()
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
        const { cvs } = this

        cvs.removeEventListener('mousedown', this.onMousedown)
        cvs.removeEventListener('mousemove', this.onMousemove)
        cvs.removeEventListener('mouseup', this.onMouseup)
        cvs.removeEventListener('mouseleave', this.onMouseLeave)
        cvs.removeEventListener('wheel', this.onWheel)
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
     * CanvasRenderingContext2D 原始的 drawImage 方法
     */
    drawImage(...params: Parameters<CanvasRenderingContext2D['drawImage']>) {
        return this.ctx.drawImage(...params)
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

    setCursor(width?: number, fillStyle?: string) {
        this.cvs.style.cursor = getCursor(
            width || this.opts.lineWidth,
            fillStyle || this.opts.fillStyle
        )
    }

    private canDraw() {
        return ['draw', 'erase'].includes(this.mode)
    }

    private init() {
        this.bindEvent()
        this.setDefaultStyle()
    }

    private bindEvent() {
        const { cvs } = this
        cvs.addEventListener('mousedown', this.onMousedown)
        cvs.addEventListener('mousemove', this.onMousemove)
        cvs.addEventListener('mouseup', this.onMouseup)
        cvs.addEventListener('mouseleave', this.onMouseLeave)
        cvs.addEventListener('wheel', this.onWheel)
    }

    private dragCanvas(dx: number, dy: number) {
        const { cvs, ctx } = this

        this.offsetX += dx
        this.offsetY += dy

        this.clear()
        ctx.save()

        ctx.resetTransform()
        ctx.translate(this.offsetX, this.offsetY) // 添加平移
        ctx.scale(this.zoom, this.zoom) // 考虑缩放
        this.drawRecord()

        ctx.restore()
    }

    private _onMousedown(e: MouseEvent) {
        if (this.mode === 'drag') {
            this.isDragging = true
            this.dragStart = { x: e.offsetX, y: e.offsetY }
        }

        if (!this.canDraw()) return
        this.customMouseDown?.(e)
        this.addNewRecord()

        this.isDrawing = true
        const { offsetX, offsetY } = e
        this.start = {
            x: offsetX,
            y: offsetY,
        }
    }

    private _onMousemove(e: MouseEvent) {
        if (this.isDragging) {
            const dx = e.offsetX - this.dragStart.x
            const dy = e.offsetY - this.dragStart.y
            this.dragCanvas(dx, dy)
            this.dragStart = { x: e.offsetX, y: e.offsetY }
        }

        if (!this.canDraw()) return
        if (!this.isDrawing) return

        this.customMouseMove?.(e)
        const { offsetX, offsetY } = e
        const { ctx, start } = this

        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(offsetX, offsetY)

        ctx.lineWidth = this.opts.lineWidth
        ctx.stroke()

        this.prevList[this.prevList.length - 1].point.push({
            moveTo: [start.x, start.y],
            lineTo: [offsetX, offsetY],
        })

        this.start = {
            x: offsetX,
            y: offsetY,
        }
    }

    private _onMouseup(e: MouseEvent) {
        if (this.mode === 'drag') {
            this.isDragging = false
        }

        if (!this.canDraw()) return
        this.customMouseUp?.(e)
        this.isDrawing = false
    }

    private _onMouseLeave(e: MouseEvent) {
        if (this.mode === 'drag') {
            this.isDragging = false
        }

        if (!this.canDraw()) return
        this.customMouseLeave?.(e)
        this.isDrawing = false
    }

    private _onWheel(e: WheelEvent) {
        if (!this.isEnableZoom) return

        e.preventDefault()
        this.zoom = e.deltaY > 0
            ? this.zoom / 1.1
            : this.zoom * 1.1

        if (this.zoom >= 20) {
            this.zoom = 20
        }
        this.zoom = Math.max(this.zoom, .05)

        this.zoomTo(this.zoom, this.zoom, e.clientX, e.clientY)
    }

    private setDefaultStyle() {
        const {
            fillStyle, strokeStyle,
            lineCap, lineWidth,
        } = this.opts

        this.setStyle({
            fillStyle,
            strokeStyle,
            lineCap,
            lineWidth,
        })
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
                lineCap: ctx.lineCap,
                globalCompositeOperation: ctx.globalCompositeOperation,
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
