import { setFont } from '@/canvas/tools'
import { BaseSource } from './BaseSource'

export class TxtSource extends BaseSource {
    option: TxtSourceOption

    constructor(isDynamic: boolean, option: TxtSourceOption) {
        super(isDynamic)
        this.option = option
    }

    protected setCvsSize() {
        const { canvas, ctx, option } = this

        canvas.width = option.txt.length * option.size
        canvas.height = option.size

        setFont(ctx, {
            size: option.size,
            family: option.family,
            weight: 'bold',
            color: option.color,
            textAlign: 'center',
            textBaseline: 'middle'
        })
    }

    /** 绘制大文字 */
    protected draw(): void {
        this.ctx.fillText(
            this.option.txt,
            this.canvas.width / 2,
            this.canvas.height / 2
        )
    }
}

export type TxtSourceOption = {
    txt: string
    size: number
    family: string
    color: string
}
