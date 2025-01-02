import { clearAllCvs, createCvs, getImg, cutImg, getCvsImg } from '@/canvasTool'
import { mergeOpts, setCanvas } from './tools'
import type { NoteBoardOptions, CanvasAttrs, Mode, ImgInfo, NoteBoardOptionsRequired, DrawImgOptions, CanvasItem, ExportOptions, AddCanvasOpts } from './type'
import { createUnReDoList, getCircleCursor } from '@/utils'
import type { ShapeType } from '@/Shapes'


/**
 * 使用 base64 实现历史记录的画板
 * ### 如需使用绘制图像，请使用 NoteBoard
 * 
 * 提供如下功能
 * - 签名涂抹
 * - 分层自适应绘图
 * 
 * - 擦除（仅针对 brushCanvas 画板）
 * - 撤销（仅针对 brushCanvas 画板）
 * - 重做（仅针对 brushCanvas 画板）
 * 
 * - 缩放
 * - 拖拽
 * 
 * - 截图
 */
export class NoteBoardWithBase64 {

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
  /** 绘制的图片尺寸信息 */
  imgInfo?: ImgInfo

  /** 存储的所有 Canvas 信息 */
  canvasList: CanvasItem[] = []

  private opts: NoteBoardOptionsRequired

  mode: NoteBoardWithBase64Mode = 'draw'

  /** 开启鼠标滚轮缩放 */
  isEnableZoom = true

  /**
   * 记录缩放、位置等属性
   */
  private isDrawing = false
  private drawStart = { x: 0, y: 0 }

  private isDragging = false
  private dragStart = { x: 0, y: 0 }
  private mousePoint = { x: 0, y: 0 }

  scale = 1
  translateX = 0
  translateY = 0

  /**
   * 历史记录
   */
  history = createUnReDoList<string>()

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
    this.el.style.position = 'relative'

    this.init()
  }

  /**
   * 设置模式
   */
  setMode(mode: NoteBoardWithBase64Mode) {
    this.mode = mode

    switch (mode) {
      case 'draw':
        this.setCursor()
        this.ctx.globalCompositeOperation = this.opts.drawGlobalCompositeOperation
        break

      case 'erase':
        this.setCursor()
        this.ctx.globalCompositeOperation = 'destination-out'
        break

      case 'none':
        this.canvas.style.cursor = 'unset'
        break

      case 'drag':
        this.canvas.style.cursor = 'grab'
        break

      default:
        break
    }
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
      canvas = this.canvas
    }: ExportOptions = {}
  ) {
    /**
     * 没有记录图像信息，或者不仅仅导出图像区域
     */
    if (!exportOnlyImgArea || !this.imgInfo) {
      return getCvsImg(canvas, 'base64', mimeType, quality)
    }

    const rawBase64 = await getCvsImg(canvas, 'base64', mimeType, quality)
    const img = await getImg(rawBase64)
    if (!img) return ''

    const { imgInfo } = this

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

    const imgWidth = options.imgWidth ?? newImg.width,
      imgHeight = options.imgHeight ?? newImg.height

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
   * 撤销
   */
  async undo() {
    return new Promise<boolean>((resolve) => {
      this.history.undo(async base64 => {
        this.clear(false)
        if (!base64) return resolve(false)

        // 保存当前的混合模式
        const currentCompositeOperation = this.ctx.globalCompositeOperation
        // 临时设置为默认混合模式
        this.ctx.globalCompositeOperation = 'source-over'

        const img = await getImg(base64, img => img.crossOrigin = 'anonymous') as HTMLImageElement
        this.ctx.drawImage(img, 0, 0)
        this.ctx.globalCompositeOperation = currentCompositeOperation

        this.opts.onUndo?.(base64)
        resolve(true)
      })
    })
  }

  /**
   * 重做
   */
  async redo() {
    return new Promise<boolean>((resolve) => {
      this.history.redo(async base64 => {
        this.clear(false)
        if (!base64) return resolve(false)

        // 保存当前的混合模式
        const currentCompositeOperation = this.ctx.globalCompositeOperation
        // 临时设置为默认混合模式
        this.ctx.globalCompositeOperation = 'source-over'

        const img = await getImg(base64, img => img.crossOrigin = 'anonymous') as HTMLImageElement
        this.ctx.drawImage(img, 0, 0)
        this.ctx.globalCompositeOperation = currentCompositeOperation

        this.opts.onRedo?.(base64)
        resolve(true)
      })
    })
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
   * 移除所有事件
   */
  rmEvent() {
    const { canvas } = this

    canvas.removeEventListener('mousedown', this.onMousedown)
    canvas.removeEventListener('mousemove', this.onMousemove)
    canvas.removeEventListener('mouseup', this.onMouseup)
    canvas.removeEventListener('mouseleave', this.onMouseLeave)
    canvas.removeEventListener('wheel', this.onWheel)
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

  /**
   * 添加一个新的历史记录
   * @param data 图片数据 base64，默认从画笔画布提取
   */
  async addNewRecord(data?: string) {
    const base64 = data || await this.exportMask()
    this.history.add(base64)
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

  private get canDraw() {
    return ['draw', 'erase'].includes(this.mode)
  }

  private init() {
    this.bindEvent()
    this.setStyle(this.opts)
    this.setMode(this.mode)
  }

  private bindEvent() {
    const { canvas: cvs } = this
    cvs.addEventListener('mousedown', this.onMousedown)
    cvs.addEventListener('mousemove', this.onMousemove)
    cvs.addEventListener('mouseup', this.onMouseup)
    cvs.addEventListener('mouseleave', this.onMouseLeave)
    cvs.addEventListener('wheel', this.onWheel)
  }

  private onMousedown = (e: MouseEvent) => {
    this.opts.onMouseDown?.(e)

    if (this.mode === 'drag') {
      this.isDragging = true
      this.dragStart = { x: e.offsetX, y: e.offsetY }
    }

    if (!this.canDraw) return

    // 画笔模式
    this.isDrawing = true
    this.ctx.beginPath()
    this.drawStart = {
      x: e.offsetX,
      y: e.offsetY,
    }
  }

  private onMousemove = (e: MouseEvent) => {
    this.opts.onMouseMove?.(e)

    /**
     * 拖拽
     */
    if (this.isDragging) {
      const dx = e.offsetX - this.dragStart.x
      const dy = e.offsetY - this.dragStart.y

      this.translateX = this.translateX + dx
      this.translateY = this.translateY + dy

      this.setTransform()
      this.opts.onDrag?.({
        translateX: this.translateX,
        translateY: this.translateY,
        transformOriginX: this.dragStart.x,
        transformOriginY: this.dragStart.y,
        e
      })
    }

    /**
     * 画笔
     */
    if (!this.canDraw || !this.isDrawing) return

    const { offsetX, offsetY } = e
    const { ctx, drawStart: start } = this

    ctx.moveTo(start.x, start.y)
    ctx.lineTo(offsetX, offsetY)

    ctx.lineWidth = this.opts.lineWidth
    ctx.stroke()

    this.drawStart = {
      x: offsetX,
      y: offsetY,
    }
  }

  private onMouseup = (e: MouseEvent) => {
    this.opts.onMouseUp?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
      this.translateX += e.offsetX - this.dragStart.x
      this.translateY += e.offsetY - this.dragStart.y
    }

    if (!this.canDraw) return

    this.isDrawing = false
    this.addNewRecord()
  }

  private onMouseLeave = (e: MouseEvent) => {
    this.opts.onMouseLeave?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
    }

    if (!this.canDraw) return
    this.isDrawing = false
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (!this.isEnableZoom) return

    this.mousePoint = {
      x: e.offsetX,
      y: e.offsetY
    }

    this.scale = e.deltaY > 0
      ? this.scale / 1.1
      : this.scale * 1.1

    this.scale = Math.min(Math.max(this.scale, this.opts.minScale), this.opts.maxScale)
    this.setTransform()

    this.opts.onWheel?.({
      scale: this.scale,
      e
    })
  }

}


export type NoteBoardWithBase64Mode = Exclude<Mode, ShapeType>