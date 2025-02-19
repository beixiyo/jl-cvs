import { clearAllCvs, createCvs, getImg, cutImg, getCvsImg } from '@/canvasTool'
import { mergeOpts, setCanvas } from './tools'
import type { NoteBoardOptions, CanvasAttrs, Mode, ImgInfo, NoteBoardOptionsRequired, DrawImgOptions, CanvasItem, ExportOptions, AddCanvasOpts } from './type'
import { getCircleCursor } from '@/utils'
import type { ShapeType } from '@/Shapes'


export abstract class NoteBoardBase {

  /** 容器 */
  el: HTMLElement
  /** 画笔画板 canvas */
  canvas = document.createElement('canvas')
  /** 画笔画板 上下文 */
  ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

  /** 图片画板 canvas */
  imgCanvas = document.createElement('canvas')
  /** 图片画板 上下文 */
  imgCtx = this.imgCanvas.getContext('2d') as CanvasRenderingContext2D
  /**
   * 记录绘制的图片尺寸信息
   * 有了它才能自适应尺寸和居中绘制
   */
  imgInfo?: ImgInfo

  /** 存储的所有 Canvas 信息 */
  canvasList: CanvasItem[] = []

  protected opts: NoteBoardOptionsRequired

  /** 开启鼠标滚轮缩放 */
  isEnableZoom = true

  /**
   * 记录缩放、位置等属性
   */
  protected isDrawing = false
  protected drawStart = { x: 0, y: 0 }

  protected isDragging = false
  protected dragStart = { x: 0, y: 0 }
  protected mousePoint = { x: 0, y: 0 }

  scale = 1
  translateX = 0
  translateY = 0

  abstract mode: any

  /**
   * 历史记录
   */
  abstract history: any
  /**
    * 撤销
    */
  abstract undo(): void
  /**
   * 重做
   */
  abstract redo(): void

  /**
   * 移除所有事件
   */
  abstract rmEvent(): void
  abstract bindEvent(): void

  abstract onMousedown: (e: MouseEvent) => void
  abstract onMousemove: (e: MouseEvent) => void

  abstract onMouseup: (e: MouseEvent) => void
  abstract onMouseLeave: (e: MouseEvent) => void

  abstract onWheel: (e: WheelEvent) => void

  /**
   * 设置模式
   */
  abstract setMode(mode: any): void

  constructor(opts: NoteBoardOptions) {
    this.opts = mergeOpts(opts)

    // 设置画笔画板置顶
    this.canvas.style.zIndex = '99'
    this.el = opts.el

    this.addCanvas('imgCanvas', {
      canvas: this.imgCanvas,
    })
    this.addCanvas('brushCanvas', {
      canvas: this.canvas,
    })

    this.el.style.overflow = 'hidden'
    if (getComputedStyle(this.el).position === 'static') {
      this.el.style.position = 'relative'
    }
    this.setStyle(this.opts)
  }

  protected get canDraw() {
    return ['draw', 'erase'].includes(this.mode)
  }

  /**
   * 获取画板图像内容
   */
  async exportImg(
    options: Omit<ExportOptions, 'canvas'> = {}
  ) {
    const canvas = this.imgCanvas
    return this.exportLayer({
      ...options,
      canvas
    })
  }

  /**
   * 获取画板遮罩（画笔）内容
   */
  async exportMask(
    options: Omit<ExportOptions, 'canvas'> = {}
  ) {
    const canvas = this.canvas
    return this.exportLayer({
      ...options,
      canvas
    })
  }

  /**
   * 导出整个图层，或者指定多个 canvas 图层
   */
  async exportAllLayer(
    options: Omit<ExportOptions, 'canvas'> = {},
    canvasList: HTMLCanvasElement[] = this.canvasList.map((item) => item.canvas)
  ) {
    const canvasDataUrls = []
    for (const canvas of canvasList) {
      canvasDataUrls.push(await this.exportLayer({
        ...options,
        canvas
      }))
    }

    const imgs = await Promise.all(canvasDataUrls.map((item) => getImg(item))) as HTMLImageElement[]
    for (const item of imgs) {
      if (!item) return ''
    }
    const img = imgs[0]

    let width: number,
      height: number

    if (options.exportOnlyImgArea) {
      width = img.width
      height = img.height
    }
    else {
      width = this.opts.width
      height = this.opts.height
    }

    const { ctx, cvs } = createCvs(width, height)
    for (const img of imgs) {
      ctx.drawImage(img, 0, 0)
    }

    return await getCvsImg(cvs, 'base64')
  }

  /**
   * 导出指定图层
   */
  async exportLayer(
    {
      exportOnlyImgArea = false,
      mimeType,
      quality,
      canvas = this.canvas,
      imgInfo = this.imgInfo
    }: ExportOptions = {}
  ) {
    /**
     * 没有记录图像信息，或者不仅仅导出图像区域
     * 则不做任何处理，直接导出整个画布
     */
    if (!exportOnlyImgArea || !imgInfo) {
      return getCvsImg(canvas, 'base64', mimeType, quality)
    }

    const rawBase64 = await getCvsImg(canvas, 'base64', mimeType, quality)
    const img = await getImg(rawBase64)
    if (!img) return ''

    return await cutImg(img, {
      x: imgInfo.x,
      y: imgInfo.y,
      width: imgInfo.drawWidth,
      height: imgInfo.drawHeight,
      scaleX: 1 / imgInfo.minScale,
      scaleY: 1 / imgInfo.minScale,
    })
  }


  /**
   * 绘制图片，可调整大小，自适应尺寸等
   * ### 图片默认使用单独的画布绘制，置于底层
   */
  async drawImg(
    img: HTMLImageElement | string,
    options: DrawImgOptions = {}
  ) {
    const {
      afterDraw,
      beforeDraw,
      needClear = false,
      autoFit,
      center,
      context = this.imgCtx,
      needRecordImgInfo = true
    } = options

    beforeDraw?.()
    needClear && this.clear()

    const newImg = typeof img === 'string'
      ? await getImg(img, img => img.crossOrigin = 'anonymous')
      : img
    if (!newImg) return new Error('Image load failed')

    const {
      width: canvasWidth,
      height: canvasHeight
    } = this.opts

    const imgWidth = options.imgWidth ?? newImg.naturalWidth,
      imgHeight = options.imgHeight ?? newImg.naturalHeight

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

    context.drawImage(
      newImg,
      x, y,
      drawWidth,
      drawHeight
    )

    if (needRecordImgInfo) {
      this.imgInfo = {
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
      }
    }
    afterDraw?.(this.imgInfo)
  }

  /**
   * 拖拽、缩放画布
   */
  async setTransform() {
    const { canvas, imgCanvas } = this

    const transformOrigin = `${this.mousePoint.x}px ${this.mousePoint.y}px`,
      transform = `scale(${this.scale}, ${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`

    canvas.style.transformOrigin = transformOrigin
    canvas.style.transform = transform

    imgCanvas.style.transformOrigin = transformOrigin
    imgCanvas.style.transform = transform
  }

  /**
   * 重置大小
   */
  async resetSize() {
    const { canvas, imgCanvas } = this
    canvas.style.transformOrigin = 'none'
    canvas.style.transform = 'none'

    imgCanvas.style.transformOrigin = 'none'
    imgCanvas.style.transform = 'none'
  }

  /**
   * 清空画板
   */
  clear(
    clearImg = true,
    clearMask = true,
  ) {
    clearMask && clearAllCvs(this.ctx, this.canvas)
    clearImg && clearAllCvs(this.imgCtx, this.imgCanvas)
  }

  /**
   * 添加新的画布到 canvasList 中
   */
  addCanvas(name: string, opts: AddCanvasOpts) {
    const options = this.getAddcanvasOpts(opts)
    this.canvasList.push({
      canvas: options.canvas,
      ctx: options.canvas.getContext('2d') as CanvasRenderingContext2D,
      name
    })

    setCanvas(options)
  }

  /**
   * 设置画布和上下文样式
   * @param recordStyle 样式
   * @param ctx 指定某个画布上下文，不指定则设置全部
   */
  setStyle(recordStyle: CanvasAttrs, ctx?: CanvasRenderingContext2D) {
    for (const k in recordStyle) {
      const attr = recordStyle[k]

      if (typeof attr === 'function') {
        continue
      }

      this.opts[k] = attr
      if (k === 'width' || k === 'height') {
        for (const item of this.canvasList) {
          item.canvas[k] = attr
        }
        continue
      }

      if (ctx) {
        // @ts-ignore
        ctx[k] = attr
      }
      else {
        for (const item of this.canvasList) {
          // @ts-ignore
          item.ctx[k] = attr
        }
      }
    }
  }

  /**
   * 设置光标样式
   * @param lineWidth 大小
   * @param strokeStyle 颜色
   */
  setCursor(lineWidth?: number, strokeStyle?: string) {
    this.canvas.style.cursor = getCircleCursor(
      lineWidth || this.opts.lineWidth,
      strokeStyle || this.opts.strokeStyle
    )
  }

  /***************************************************
   *                    Private
   ***************************************************/

  private getAddcanvasOpts(opts: AddCanvasOpts) {
    return {
      width: this.opts.width,
      height: this.opts.height,
      center: true,
      parentEl: this.el,
      ...opts,
    } satisfies Required<AddCanvasOpts> & {
      parentEl: HTMLElement
    }
  }

}


export type NoteBoardWithBase64Mode = Exclude<Mode, ShapeType>