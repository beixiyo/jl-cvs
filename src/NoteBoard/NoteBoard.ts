import { clearAllCvs, createCvs, getImg, cutImg, getCvsImg } from '@/canvasTool'
import { mergeOpts, setCanvas } from './tools'
import type { CanvasAttrs, Mode, DrawImgOptions, ImgInfo, RecordPath, CanvasItem, ExportOptions, NoteBoardOptions, DrawMapVal, NoteBoardOptionsRequired, AddCanvasOpts } from './type'
import { excludeKeys, getCircleCursor, UnRedoLinkedList } from '@/utils'
import { DrawShape } from '@/Shapes'


/**
 * 统一绘图函数
 */
export const DRAW_MAP = new WeakMap<
  DrawShape,
  DrawMapVal
>()

/**
 * 画板，提供如下功能
 * - 签名涂抹
 * - 绘制矩形
 * - 绘制圆形
 * 
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
export class NoteBoard extends DrawShape {

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

  mode: Mode = 'draw'

  /** 开启鼠标滚轮缩放 */
  isEnableZoom = true

  /**
   * 记录缩放、位置等属性
   */
  private drawStart = { x: 0, y: 0 }
  private isDrawing = false

  private isDragging = false
  private dragStart = { x: 0, y: 0 }
  private mousePoint = { x: 0, y: 0 }

  scale = 1
  translateX = 0
  translateY = 0

  /**
   * 历史记录
   */
  history = new UnRedoLinkedList<RecordPath[]>()

  constructor(opts: NoteBoardOptions) {
    super()
    super.initial({
      canvas: this.canvas,
      context: this.ctx,
    })

    this.opts = mergeOpts(opts)
    this.initDrawMap()

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
   * 设置绘制模式
   */
  setMode(mode: Mode) {
    this.mode = mode
    this.drawShapeDiable = true
    this.ctx.globalCompositeOperation = this.opts.globalCompositeOperation

    switch (mode) {
      case 'draw':
        this.setCursor()
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

      case 'rect':
        this.shapeType = 'rect'
        this.drawShapeDiable = false
        this.canvas.style.cursor = 'crosshair'
        break

      case 'circle':
        this.shapeType = 'circle'
        this.drawShapeDiable = false
        this.canvas.style.cursor = 'crosshair'
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
  undo() {
    const recordPath = this.history.undo()
    if (!recordPath?.value) {
      this.clear(false)
      // 清理图形里不要的记录
      this.drawShapeUndo()

      return
    }

    const drawFn = this.drawMap?.unRedo
    if (!drawFn) return
    const data = drawFn({ type: 'undo' })

    this.opts.onUndo?.({
      mode: this.mode,
      ...data,
    })
  }

  /**
   * 重做
   */
  redo() {
    const recordPath = this.history.redo()
    if (!recordPath?.value) {
      return
    }

    const drawFn = this.drawMap?.unRedo
    if (!drawFn) return

    const data = drawFn({ type: 'redo' })
    this.opts.onRedo?.({
      mode: this.mode,
      ...data,
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
    this.drawShapeRmEvent()
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

  /**
   * 是否为绘制模式
   */
  private get canDraw() {
    return ['draw', 'erase'].includes(this.mode)
  }

  /**
   * 能否添加记录
   */
  private get canAddRecord() {
    return this.canDraw || this.isShapeMode()
  }

  /**
   * 是图形模式
   */
  private isShapeMode(mode?: Mode) {
    return ['rect', 'circle'].includes(mode ?? this.mode)
  }

  private init() {
    this.bindEvent()
    this.setStyle(this.opts)
    this.setMode(this.mode)
  }

  private bindEvent() {
    const { canvas } = this

    canvas.addEventListener('mousedown', this.onMousedown)
    canvas.addEventListener('mousemove', this.onMousemove)
    canvas.addEventListener('mouseup', this.onMouseup)
    canvas.addEventListener('mouseleave', this.onMouseLeave)
    canvas.addEventListener('wheel', this.onWheel)
  }

  private onMousedown = (e: MouseEvent) => {
    this.opts.onMouseDown?.(e)

    // 拖拽模式
    if (this.mode === 'drag') {
      this.isDragging = true
      this.dragStart = { x: e.offsetX, y: e.offsetY }
      return
    }

    /**
     * 添加记录
     */
    if (this.canAddRecord) {
      this.history.cleanUnusedNodes()
      this.addHistory()
      this.drawMap?.syncShapeRecord()
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

      return
    }

    /**
     * 画笔
     */
    if (!this.canDraw || !this.isDrawing) return

    const { offsetX, offsetY } = e
    const { ctx, drawStart } = this
    const lastRecord = this.history.curValue

    ctx.moveTo(drawStart.x, drawStart.y)
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()

    this.drawStart = {
      x: offsetX,
      y: offsetY,
    }

    if (!lastRecord) return
    lastRecord[lastRecord.length - 1].path.push({
      moveTo: [drawStart.x, drawStart.y],
      lineTo: [offsetX, offsetY]
    })
  }

  private onMouseup = (e: MouseEvent) => {
    this.opts.onMouseUp?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
      this.translateX += e.offsetX - this.dragStart.x
      this.translateY += e.offsetY - this.dragStart.y
      return
    }

    if (!this.canDraw) return
    this.isDrawing = false
  }

  private onMouseLeave = (e: MouseEvent) => {
    this.opts.onMouseLeave?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
      return
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

  private addHistory() {
    const lastRecord = this.history.curValue
    this.history.add([
      ...(lastRecord || []),
      {
        canvasAttrs: excludeKeys(
          { ...this.opts },
          [
            'el',
            'minScale', 'maxScale',
            'onMouseDown', 'onMouseMove',
            'onMouseUp', 'onMouseLeave',
            'onWheel', 'onDrag',
            'onRedo', 'onUndo',
            'height', 'width',
          ]
        ),
        path: [],
        shapes: [],
        mode: this.mode,
      }
    ])
  }

  /**
   * 绘制笔画
   */
  private drawRecord() {
    const lastRecord = this.history.curValue
    if (!lastRecord) return
    const { ctx } = this
    const currentMode = this.mode

    for (const item of lastRecord) {
      this.setStyle(item.canvasAttrs, this.ctx)
      this.setMode(item.mode)
      ctx.beginPath()

      for (const point of item.path) {
        ctx.moveTo(...point.moveTo)
        ctx.lineTo(...point.lineTo)
        ctx.stroke()
      }
    }

    this.setMode(currentMode)
  }

  private initDrawMap() {
    const draw = () => {
      this.clear(false)

      /**
       * 绘制图形
       */
      const lastRecord = this.history.curValue
      if (lastRecord) {
        this.ctx.globalCompositeOperation = this.opts.globalCompositeOperation
        lastRecord[lastRecord.length - 1].shapes.forEach(shape => {
          shape.draw()
        })
      }

      this.drawRecord()
    }

    const syncShapeRecord = () => {
      /**
       * 确保有记录后执行
       */
      setTimeout(() => {
        const lastRecord = this.history.curValue
        if (lastRecord?.[lastRecord!.length - 1]?.shapes) {
          lastRecord[lastRecord!.length - 1].shapes = [...this.shapes]
        }
      })
    }

    const cleanShapeRecord = () => {
      const lastRecord = this.history.curValue
      lastRecord?.[lastRecord!.length - 1]?.shapes?.splice(0)
    }

    DRAW_MAP.set(this, {
      draw,
      syncShapeRecord,
      cleanShapeRecord,

      getHistory: () => this.history,

      unRedo: ({ type }) => {
        const fnMap = {
          undo: 'drawShapeUndo' as const,
          redo: 'drawShapeRedo' as const,
        }

        const lastRecord = this.history.curNode?.next?.value
        if (this.isShapeMode(lastRecord?.[lastRecord.length - 1].mode)) {
          this[fnMap[type]](false)
        }

        draw()
        syncShapeRecord()

        return {
          shape: this.lastShape,
          shapes: this.shapes,
        }
      },
    })
  }
}
