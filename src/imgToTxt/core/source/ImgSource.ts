import { BaseSource } from './BaseSource'

export class ImgSource extends BaseSource {
    img: HTMLImageElement
    width: number
    height: number

    constructor(isDynamic: boolean, option: ImgSourceOption) {
        super(isDynamic)
        this.img = option.img
        this.width = option.width
        this.height = option.height
    }

    protected override setCvsSize() {
        this.canvas.width = this.width
        this.canvas.height = this.height
    }

    protected override draw() {
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
