import { BaseSource } from './BaseSource'

export class ImgSource extends BaseSource {
    img: HTMLImageElement
    width: number
    height: number
    constructor(option: ImgSourceOption) {
        super()
        this.img = option.img
        this.width = option.width
        this.height = option.height
    }

    protected initCanvas(): void {
        this.canvas.width = this.width
        this.canvas.height = this.height
    }
    protected draw(): void {
        this.ctx.drawImage(
            this.img,
            0,
            0,
            this.img.width,
            this.img.height,
            0,
            0,
            this.width,
            this.height
        )
    }
}

export type ImgSourceOption = {
    img: HTMLImageElement
    width: number
    height: number
}
