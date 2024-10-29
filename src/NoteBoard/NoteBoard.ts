import type { TransferType } from '@/types'
import { clearAllCvs, createCvs, getImg } from '@/canvasTool/tools'
import { getCvsImg, type HandleImgReturn } from '@/canvasTool/handleImg'
import { getCursor, mergeOpts } from './tools'
import type { NoteBoardOptions, MouseEventFn, CanvasAttrs, Mode, DrawImgOpts, ZoomFn, DragFn } from './type'
import { createUnReDoList, throttle } from '@/utils'


/**
 * ### 画板，提供如下功能
 * - 签名涂抹
 * - 自适应绘图
 * 
 * - 擦除
 * - 撤销
 * - 重做
 * 
 * - 缩放
 * - 拖拽
 * 
 * - 颜色等样式处理
 * - 截图
 */
export class NoteBoard {

    /** 容器 */
    el: HTMLElement
    cvs = document.createElement('canvas')
    ctx = this.cvs.getContext('2d') as CanvasRenderingContext2D
    private opts: NoteBoardOptions

    mode: Mode = 'none'
    /** 开启鼠标滚轮缩放 */
    isEnableZoom = true

    /**
     * 记录缩放、位置等属性
     */
    private zoom = 1
    private isDrawing = false
    private drawStart = { x: 0, y: 0 }

    private isDragging = false
    private dragStart = { x: 0, y: 0 }
    private scale = 1
    private translateX = 0
    private translateY = 0

    /** 
     * 统一事件，方便解绑
     */
    private onMousedown = this._onMousedown.bind(this)
    private onMousemove = this._onMousemove.bind(this)
    private onMouseup = this._onMouseup.bind(this)
    private onMouseLeave = this._onMouseLeave.bind(this)
    private onWheel = this._onWheel.bind(this)

    /**
     * 节流函数
     */
    private _zoomTo = throttle(this.zoomTo.bind(this), 30)

    /**
     * 用户事件
     */
    customMouseDown?: MouseEventFn
    customMouseMove?: MouseEventFn
    customMouseUp?: MouseEventFn
    customMouseLeave?: MouseEventFn

    customOnWheel?: ZoomFn
    customOnDrag?: DragFn

    /**
     * 撤销与重做
     */
    onUndo?: () => void
    onRedo?: () => void

    /**
     * 记录
     */
    private unReDoList = createUnReDoList<string>()

    constructor(opts?: NoteBoardOptions) {
        this.opts = mergeOpts(opts)

        const {
            el,
            width,
            height,

            onMouseDown,
            onMouseMove,
            onMouseUp,
            onMouseLeave,

            onWheel,
            onDrag,

            onUndo,
            onRedo
        } = this.opts

        /**
         * 用户事件
         */
        this.customMouseDown = onMouseDown
        this.customMouseMove = onMouseMove
        this.customMouseUp = onMouseUp
        this.customMouseLeave = onMouseLeave

        this.customOnWheel = onWheel
        this.customOnDrag = onDrag

        this.onUndo = onUndo
        this.onRedo = onRedo

        /**
         * 大小设置
         */
        this.cvs.width = width
        this.cvs.height = height

        el.appendChild(this.cvs)
        el.style.overflow = 'hidden'
        el.style.width = `${width}px`
        el.style.height = `${height}px`
        this.el = el

        this.init()
    }

    setMode(mode: Mode) {
        this.mode = mode

        switch (mode) {
            case 'draw':
                this.setCursor()
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
     * 缩放画布
     */
    async zoomTo(
        scaleX: number, scaleY: number,
        clientX: number, clientY: number
    ) {
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

        await this.drawLast()

        // 恢复保存的状态
        ctx.restore()
    }

    /**
     * 拖拽画布
     */
    async dragCanvas() {
        const { cvs } = this
        cvs.style.transform = `scale(${this.scale}, ${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`
    }

    /**
     * 重置大小
     */
    async reset() {
        const { ctx } = this
        this.clear()

        ctx.resetTransform()
        await this.drawLast()
    }

    /**
     * 撤销
     */
    async undo() {
        return new Promise<boolean>((resolve) => {
            this.unReDoList.undo(async base64 => {
                this.clear()
                if (!base64) return resolve(false)

                // 保存当前的混合模式
                const currentCompositeOperation = this.ctx.globalCompositeOperation
                // 临时设置为默认混合模式
                this.ctx.globalCompositeOperation = 'source-over'

                const img = await getImg(base64) as HTMLImageElement
                this.ctx.drawImage(img, 0, 0)
                this.ctx.globalCompositeOperation = currentCompositeOperation

                this.onUndo?.()
                resolve(true)
            })
        })
    }

    /**
     * 重做
     */
    async redo() {
        return new Promise<boolean>((resolve) => {
            this.unReDoList.redo(async base64 => {
                this.clear()
                if (!base64) return resolve(false)

                // 保存当前的混合模式
                const currentCompositeOperation = this.ctx.globalCompositeOperation
                // 临时设置为默认混合模式
                this.ctx.globalCompositeOperation = 'source-over'

                const img = await getImg(base64) as HTMLImageElement
                this.ctx.drawImage(img, 0, 0)
                this.ctx.globalCompositeOperation = currentCompositeOperation

                this.onUndo?.()
                resolve(true)
            })
        })
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
     * 绘制图片，可调整大小，自适应尺寸等
     */
    async drawImg(img: HTMLImageElement | string, {
        afterDraw,
        needClear = false,
        autoFit,
        center,
    }: DrawImgOpts = {}) {
        needClear && this.clear()

        const newImg = typeof img === 'string'
            ? await getImg(img)
            : img
        if (!newImg) return new Error('Image load failed')

        const {
            width: canvasWidth,
            height: canvasHeight
        } = this.opts

        const imgWidth = newImg.width,
            imgHeight = newImg.height

        const scaleX = canvasWidth / imgWidth,
            scaleY = canvasHeight / imgHeight,
            minScale = Math.min(scaleX, scaleY)

        let drawWidth = imgWidth,
            drawHeight = imgHeight,
            x = 0,
            y = 0

        if (autoFit) {
            // 保持宽高比的情况下，使图片适应画布
            drawWidth = imgWidth * minScale
            drawHeight = imgHeight * minScale
        }
        if (center) {
            // 计算居中位置
            x = (canvasWidth - drawWidth) / 2
            y = (canvasHeight - drawHeight) / 2
        }

        this.ctx.drawImage(
            newImg,
            x, y,
            drawWidth,
            drawHeight
        )

        afterDraw?.({
            minScale,
            scaleX,
            scaleY,
            img: newImg,

            x,
            y,
            drawWidth,
            drawHeight,
            rawWidth: imgWidth,
            rawHeight: imgHeight,
        })
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

            this.opts[k] = attr
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

    private async drawLast() {
        const lastBase64 = this.unReDoList.getLast()
        if (lastBase64) {
            const img = await getImg(lastBase64) as HTMLImageElement
            this.ctx.drawImage(img, 0, 0)
        }
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

    private _onMousedown(e: MouseEvent) {
        this.customMouseDown?.(e)

        if (this.mode === 'drag') {
            this.isDragging = true
            this.dragStart = { x: e.offsetX, y: e.offsetY }
        }

        if (!this.canDraw()) return

        this.isDrawing = true
        this.drawStart = {
            x: e.offsetX,
            y: e.offsetY,
        }
    }

    private _onMousemove(e: MouseEvent) {
        this.customMouseMove?.(e)

        if (this.isDragging) {
            const dx = e.offsetX - this.dragStart.x
            const dy = e.offsetY - this.dragStart.y

            this.translateX = this.translateX + dx
            this.translateY = this.translateY + dy

            this.dragCanvas()
            this.customOnDrag({
                translateX: this.translateX,
                translateY: this.translateY,
                e
            })
        }

        if (!this.canDraw() || !this.isDrawing) return

        const { offsetX, offsetY } = e
        const { ctx, drawStart: start } = this

        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(offsetX, offsetY)

        ctx.lineWidth = this.opts.lineWidth
        ctx.stroke()

        this.drawStart = {
            x: offsetX,
            y: offsetY,
        }
    }

    private _onMouseup(e: MouseEvent) {
        this.customMouseUp?.(e)

        if (this.mode === 'drag') {
            this.isDragging = false
            this.translateX += e.offsetX - this.dragStart.x
            this.translateY += e.offsetY - this.dragStart.y
        }

        if (!this.canDraw()) return

        this.isDrawing = false
        this.addNewRecord()
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

        this._zoomTo(this.zoom, this.zoom, e.clientX, e.clientY)
        this.customOnWheel?.({
            zoomX: this.zoom,
            zoomY: this.zoom,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            e
        })
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
     * 添加一个新的记录
     */
    private async addNewRecord() {
        const base64 = await this.shotImg('base64')
        this.unReDoList.add(base64)
    }

}
