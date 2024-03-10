import { BaseSource } from './BaseSource'

export class TextSource extends BaseSource {
    option: TextSourceOption
    constructor(option: TextSourceOption) {
        super()
        this.option = option
    }

    protected initCanvas() {
        const { canvas, ctx, option } = this

        canvas.width = option.txt.length * option.fontSize
        canvas.height = option.fontSize
        
        ctx.font = `bold ${option.fontSize}px ${option.fontFamily}`
        ctx.fillStyle = '#000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
    }

    protected draw(): void {
        this.ctx.fillText(
            this.option.txt,
            this.canvas.width / 2,
            this.canvas.height / 2
        )
    }
}

export type TextSourceOption = {
    txt: string
    fontSize: number
    fontFamily: string
}
