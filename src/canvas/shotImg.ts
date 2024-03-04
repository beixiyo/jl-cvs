import { HandleImgReturn, TransferType, cutImg } from './handleImg'


export class ShotImg {
    cvs: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    /** 手指起始位置 */
    stPos: Point = [0, 0]
    /** 手指结束位置 */
    endPos: Point = [0, 0]

    /** 拖动截图区域大小 */
    shotWidth: number = 0
    /** 拖动截图区域大小 */
    shotHeight: number = 0

    /** 填充图片宽度 也是`canvas`宽度 */
    width: number = 0
    /** 填充图片高度 也是`canvas`高度 */
    height: number = 0

    /** 你传递的图片 */
    img: HTMLImageElement | undefined
    /** 蒙层透明度 */
    opacity = .7

    /**
     * 把你传入的 Canvas 变成一个可拖动的截图区域
     * 传入一个 Canvas 元素，图片可选，你可以在后续调用 `setImg` 方法设置图片
     * @param cvs Canvas 元素
     * @param img 图片
     * @param opacity 蒙层透明度
     * @example new ShotImg(document.querySelector('canvas'), img)
     */
    constructor(cvs: HTMLCanvasElement, img?: HTMLImageElement, opacity?: number) {
        this.cvs = cvs
        this.ctx = cvs.getContext('2d', { willReadFrequently: true })!

        opacity !== undefined && (this.opacity = opacity)
        img && this.setImg(img)

        this.bindEvent()
    }

    /** 设置 Canvas 图片 */
    setImg(img: HTMLImageElement) {
        const { width, height } = img
        this.setSize(width, height)

        this.img = img
        this.drawImg()
    }

    /**
     * 获取选中区域的图片
     * 如果图片设置过大小，可能会导致截图区域不准确
     */
    getShotImg<T extends TransferType>(type: T): HandleImgReturn<T> | void {
        if (!this.img) {
            return console.warn('请调用 setImg 先设置图片 (plase call setImg first)')
        }

        return cutImg<T>(this.img, type, ...this.stPos, this.shotWidth, this.shotHeight)
    }


    /** =========================== 私有方法 ================================= */

    private setSize(w: number, h: number) {
        this.cvs.width = w
        this.cvs.height = h

        this.width = w
        this.height = h
    }

    /** 给图片画上蒙层 */
    private drawMask() {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`
        this.ctx.fillRect(0, 0, this.width, this.height)
    }

    private drawImg() {
        if (!this.img) {
            console.warn('请调用 setImg 先设置图片')
            return
        }
        this.ctx.drawImage(this.img, 0, 0, this.width, this.height)
    }

    private bindEvent() {
        this.cvs.addEventListener('mousedown', this.onMouseDown)
    }

    private onMouseDown = (e: MouseEvent) => {
        this.stPos = [e.offsetX, e.offsetY]

        this.cvs.addEventListener('mousemove', this.onMouseMove)
        this.cvs.addEventListener('mouseup', this.onMouseUp)
    }

    private onMouseMove = (e: MouseEvent) => {
        this.endPos = [e.offsetX, e.offsetY]
        const [stX, stY] = this.stPos,
            [endX, endY] = this.endPos

        // 记录 `终点 - 起点` 得到宽高
        this.shotWidth = endX - stX
        this.shotHeight = endY - stY

        this.clear()
        this.drawMask()
        this.drawSreenShot()
    }

    private onMouseUp = () => {
        this.cvs.removeEventListener('mousemove', this.onMouseMove)
        this.cvs.removeEventListener('mouseup', this.onMouseUp)
    }

    private clear() {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }

    private drawSreenShot() {
        if (!this.img) {
            console.warn('请调用 setImg 先设置图片')
            return
        }

        // 擦除区域模式
        this.ctx.globalCompositeOperation = 'destination-out'
        // 从鼠标点击起点开始画 
        this.ctx.fillRect(...this.stPos, this.shotWidth, this.shotHeight)

        // 往擦除区域填充
        this.ctx.globalCompositeOperation = 'destination-over'
        this.drawImg()
    }
}


export type Point = [number, number]
