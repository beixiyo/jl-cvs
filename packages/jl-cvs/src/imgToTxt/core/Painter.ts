import type { Pixel } from '@jl-org/tool'
import type { BaseSource } from './source'

/** 绘制类 */
export class Painter {
  private replaceText: string
  private gap: number
  private source: BaseSource
  private isDynamic: boolean

  /** 这里用的是用户传递的 canvas */
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private textIndex: number
  private isGray: boolean
  private raqId: number | null
  private isRunning = false

  constructor(options: PainterOptions) {
    this.canvas = options.canvas
    this.replaceText = options.replaceText
    this.gap = options.gap
    this.source = options.source
    this.isGray = options.isGray
    this.isDynamic = options.isDynamic
    this.ctx = this.canvas.getContext('2d')!
    this.textIndex = 0
    this.raqId = null
    this.initContext()
  }

  fps() {
    if (this.isRunning) return

    this.isRunning = true
    this.source.start()
    if (this.isDynamic) {
      const tick = () => {
        if (!this.isRunning) return

        this.draw()
        this.raqId = requestAnimationFrame(tick)
      }
      this.raqId = requestAnimationFrame(tick)
    }
    else {
      this.draw()
      this.isRunning = false
    }
  }

  stop() {
    this.isRunning = false
    if (this.raqId !== null) {
      cancelAnimationFrame(this.raqId)
      this.raqId = null
    }
    this.source.stop()
  }

  private initContext() {
    /**
     * 在调用 source.getBitmapAndDraw() 时，如果是文本，还会设置一遍字体
     * 所以这里并没有覆盖掉字体设置
     */
    this.ctx.font = `bold 12px 'Roboto Mono' 'Microsoft YaHei' '微软雅黑' 'sans-serif'`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
  }

  /** 用文本替代像素绘制 */
  private drawText(
    x: number,
    y: number,
    rgba: Pixel,
  ) {
    let [r, g, b, a] = rgba
    /** 不要透明的 */
    if (!a) return

    if (this.isGray) {
      r = g = b = 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const c = this.replaceText[this.textIndex]
    this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`
    this.textIndex = (this.textIndex + 1) % this.replaceText.length
    this.ctx.fillText(c, x, y)
  }

  /** 遍历每个像素，并绘制 */
  private draw() {
    const { canvas } = this
    const bitmap = this.source.getBitmapAndDraw()

    if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      this.initContext()
    }

    this.ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < bitmap.height; y += this.gap) {
      for (let x = 0; x < bitmap.width; x += this.gap) {
        const rgba = bitmap.getPixelAt(x, y)
        this.drawText(x, y, rgba)
      }
    }
  }
}

export type PainterOptions = {
  canvas: HTMLCanvasElement
  replaceText: string
  gap: number
  source: BaseSource
  isDynamic: boolean
  isGray: boolean
}
