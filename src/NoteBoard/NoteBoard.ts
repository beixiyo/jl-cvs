import { clearAllCvs, getImg } from '@/canvasTool/tools'
import { cutImg, getCvsImg } from '@/canvasTool/handleImg'
import { getCursor, mergeOpts, setCanvas } from './tools'
import type { NoteBoardOptions, CanvasAttrs, Mode, DrawImgOpts, ImgInfo } from './type'
import { createUnReDoList } from '@/utils'


/**
 * ### 画板，提供如下功能
 * - 签名涂抹
 * - 分层自适应绘图
 * 
 * - 擦除
 * - 撤销
 * - 重做
 * 
 * - 缩放
 * - 拖拽
 * 
 * - 截图
 */
export class NoteBoard {

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
  imgInfo: ImgInfo

  /** 存储的所有 Canvas 信息 */
  canvasList: CanvasItem[] = [
    {
      canvas: this.canvas,
      ctx: this.ctx,
      name: 'brushCanvas'
    },
    {
      canvas: this.imgCanvas,
      ctx: this.imgCtx,
      name: 'imgCanvas'
    }
  ]

  opts: NoteBoardOptions

  mode: Mode = 'draw'
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
   * 统一事件，方便解绑
   */
  private onMousedown = this._onMousedown.bind(this)
  private onMousemove = this._onMousemove.bind(this)
  private onMouseup = this._onMouseup.bind(this)
  private onMouseLeave = this._onMouseLeave.bind(this)
  private onWheel = this._onWheel.bind(this)

  /**
   * 历史记录
   */
  unReDoList = createUnReDoList<string>()

  constructor(opts?: NoteBoardOptions) {
    this.opts = mergeOpts(opts)

    const {
      el,
      width,
      height,
    } = this.opts

    // 设置画笔画板置顶，透明
    this.canvas.style.zIndex = '99'
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)'

    /**
     * 大小属性等设置
     */
    for (const item of this.canvasList) {
      el.appendChild(item.canvas)
      setCanvas(item.canvas, width, height)
    }

    el.style.overflow = 'hidden'
    el.style.position = 'relative'
    this.el = el

    this.init()
  }

  /**
   * 设置模式
   */
  setMode(mode: Mode) {
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
   * 获取画板图像内容，默认为 base64
   */
  async shotImg(
    {
      exportOnlyImgArea = false,
      mimeType,
      quality,
      canvas = this.imgCanvas
    }: ShotParams = {}
  ) {
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
   * 获取画板遮罩（画笔）内容，默认为 base64
   */
  async shotMask(
    {
      exportOnlyImgArea = false,
      mimeType,
      quality,
      canvas = this.canvas
    }: ShotParams = {}
  ) {
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
   * 拖拽、缩放画布
   */
  async setTransform() {
    const { canvas: cvs, imgCanvas: imgCvs } = this

    const transformOrigin = `${this.mousePoint.x}px ${this.mousePoint.y}px`,
      transform = `scale(${this.scale}, ${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`

    cvs.style.transformOrigin = transformOrigin
    cvs.style.transform = transform

    imgCvs.style.transformOrigin = transformOrigin
    imgCvs.style.transform = transform
  }

  /**
   * 重置大小
   */
  async reset() {
    const { canvas: cvs, imgCanvas: imgCvs } = this
    cvs.style.transformOrigin = 'none'
    cvs.style.transform = 'none'

    imgCvs.style.transformOrigin = 'none'
    imgCvs.style.transform = 'none'
  }

  /**
   * 撤销
   */
  async undo() {
    return new Promise<boolean>((resolve) => {
      this.unReDoList.undo(async base64 => {
        this.clear(false)
        if (!base64) return resolve(false)

        // 保存当前的混合模式
        const currentCompositeOperation = this.ctx.globalCompositeOperation
        // 临时设置为默认混合模式
        this.ctx.globalCompositeOperation = 'source-over'

        const img = await getImg(base64) as HTMLImageElement
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
      this.unReDoList.redo(async base64 => {
        this.clear(false)
        if (!base64) return resolve(false)

        // 保存当前的混合模式
        const currentCompositeOperation = this.ctx.globalCompositeOperation
        // 临时设置为默认混合模式
        this.ctx.globalCompositeOperation = 'source-over'

        const img = await getImg(base64) as HTMLImageElement
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
    const { canvas: cvs } = this

    cvs.removeEventListener('mousedown', this.onMousedown)
    cvs.removeEventListener('mousemove', this.onMousemove)
    cvs.removeEventListener('mouseup', this.onMouseup)
    cvs.removeEventListener('mouseleave', this.onMouseLeave)
    cvs.removeEventListener('wheel', this.onWheel)
  }

  /**
   * 绘制图片，可调整大小，自适应尺寸等
   */
  async drawImg(
    img: HTMLImageElement | string,
    {
      afterDraw,
      needClear = false,
      autoFit,
      center,
      context = this.imgCtx,
      needRecordImgInfo = true
    }: DrawImgOpts = {}
  ) {
    needClear && this.clear()

    const newImg = typeof img === 'string'
      ? await getImg(img)
      : img
    if (!newImg) return new Error('Image load failed')

    const {
      width: canvasWidth,
      height: canvasHeight
    } = this.opts

    const imgWidth = newImg.width,
      imgHeight = newImg.height

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
   * 添加新的画布到 canvasList 中
   */
  addCanvas(canvas: HTMLCanvasElement, name: string) {
    this.canvasList.push({
      canvas,
      ctx: canvas.getContext('2d') as CanvasRenderingContext2D,
      name
    })
  }

  /**
   * 设置样式
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
        ctx[k] = attr
      }
      else {
        for (const item of this.canvasList) {
          item.ctx[k] = attr
        }
      }
    }
  }

  setCursor(lineWidth?: number, strokeStyle?: string) {
    this.canvas.style.cursor = getCursor(
      lineWidth || this.opts.lineWidth,
      strokeStyle || this.opts.strokeStyle
    )
  }

  private canDraw() {
    return ['draw', 'erase'].includes(this.mode)
  }

  private init() {
    this.bindEvent()
    this.setDefaultStyle()
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

  private _onMousedown(e: MouseEvent) {
    this.opts.onMouseDown?.(e)

    if (this.mode === 'drag') {
      this.isDragging = true
      this.dragStart = { x: e.offsetX, y: e.offsetY }
    }

    if (!this.canDraw()) return

    this.isDrawing = true
    this.drawStart = {
      x: e.offsetX,
      y: e.offsetY,
    }
  }

  private _onMousemove(e: MouseEvent) {
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
    if (!this.canDraw() || !this.isDrawing) return

    const { offsetX, offsetY } = e
    const { ctx, drawStart: start } = this

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(offsetX, offsetY)

    ctx.lineWidth = this.opts.lineWidth
    ctx.stroke()

    this.drawStart = {
      x: offsetX,
      y: offsetY,
    }
  }

  private _onMouseup(e: MouseEvent) {
    this.opts.onMouseUp?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
      this.translateX += e.offsetX - this.dragStart.x
      this.translateY += e.offsetY - this.dragStart.y
    }

    if (!this.canDraw()) return

    this.isDrawing = false
    this.addNewRecord()
  }

  private _onMouseLeave(e: MouseEvent) {
    this.opts.onMouseLeave?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
    }

    if (!this.canDraw()) return
    this.isDrawing = false
  }

  private _onWheel(e: WheelEvent) {
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

  private setDefaultStyle() {
    const {
      fillStyle, strokeStyle,
      lineCap, lineWidth,
    } = this.opts

    this.setStyle({
      fillStyle,
      strokeStyle,
      lineCap,
      lineWidth,
    })
  }

  /**
   * 添加一个新的记录
   */
  private async addNewRecord() {
    const base64 = await this.shotMask()
    this.unReDoList.add(base64)
  }

}


type ShotParams = {
  /**
   * 导出时，仅仅把图片区域内容导出，并且还原图片大小（需要记录 imgInfo 后才有此区域）
   */
  exportOnlyImgArea?: boolean
  /**
   * 图片的 MIME 格式
   */
  mimeType?: string
  /**
   * 压缩质量
   */
  quality?: number
  /**
   * 指定导出的画布
   */
  canvas?: HTMLCanvasElement
}

export type CanvasItem = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  name: string
}