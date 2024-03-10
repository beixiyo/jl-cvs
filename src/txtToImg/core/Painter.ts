import { BaseSource } from './source'

export class Painter {
    private replaceText: string
    private raduis: number
    private source: BaseSource
    private isDynamic: boolean
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private textIndex: number
    private isGray: boolean
    private raqId: number

    constructor(options: PainterOptions) {
        this.replaceText = options.replaceText
        this.raduis = options.raduis
        this.source = options.source
        this.isGray = options.isGray
        this.isDynamic = options.isDynamic
        this.canvas = options.canvas
        this.ctx = this.canvas.getContext('2d')!
        this.textIndex = 0
        this.raqId = 0
        this.initContext()
    }

    fps() {
        if (this.isDynamic) {
            this.raqId = requestAnimationFrame(() => {
                this.draw()
                this.fps()
            })
        } 
        else {
            this.draw()
        }
    }

    stop() {
        cancelAnimationFrame(this.raqId)
        this.raqId = 0
    }

    private initContext() {
        this.ctx.font = `bold 12px 'Roboto Mono' 'Microsoft YaHei' '微软雅黑' 'sans-serif'`
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
    }

    private drawText(
        x: number,
        y: number,
        rgba: [number, number, number, number]
    ) {
        let [r, g, b, a] = rgba
        if (!a) {
            return
        }
        if (this.isGray) {
            r = g = b = 0.2126 * r + 0.7152 * g + 0.0722 * b
        }

        const c = this.replaceText[this.textIndex]
        this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`
        this.textIndex = (this.textIndex + 1) % this.replaceText.length
        this.ctx.fillText(c, x, y)
    }

    private draw() {
        const bitmap = this.source.getBitmap()

        this.canvas.width = bitmap.width
        this.canvas.height = bitmap.height
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        for (let y = 0; y < bitmap.height; y += this.raduis) {
            for (let x = 0; x < bitmap.width; x += this.raduis) {
                const rgba = bitmap.getPixelAt(x, y)
                this.drawText(x, y, rgba)
            }
        }
    }
}


export type PainterOptions = {
    canvas: HTMLCanvasElement
    replaceText: string
    raduis: number
    source: BaseSource
    isDynamic: boolean
    isGray: boolean
}
