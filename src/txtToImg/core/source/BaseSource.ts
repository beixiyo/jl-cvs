import { Bitmap } from '../Bitmap'

/**
 * 图片源基类，里面有 初始化 和 获取像素 方法
 */
export abstract class BaseSource {
    /** 这里的 canvas 是自己创建的，而非用户的 */
    protected canvas: HTMLCanvasElement
    protected ctx: CanvasRenderingContext2D
    private isInit: boolean

    constructor(isDynamic = false) {
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d', {
            willReadFrequently: isDynamic
        })!
        this.isInit = false
    }

    /** 设置大小等参数 */
    protected abstract setCvsSize(): void
    protected abstract draw(): void

    /** 仅仅调用一次实现类的 setCvsSize 方法 */
    private init() {
        if (this.isInit) return

        this.setCvsSize()
        this.isInit = true
    }

    /** 绘制并返回 Bitmap */
    getBitmapAndDraw() {
        this.init()
        this.draw()

        /** 这里的大小，已经在 setCvsSize 设置过了 */
        const { width, height } = this.canvas
        const imgData = this.ctx.getImageData(0, 0, width, height).data
        return new Bitmap(width, height, imgData)
    }
}
