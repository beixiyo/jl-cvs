import { clearAllCvs, getImg } from '@/canvasTool/tools'
import { cutImg, getCvsImg } from '@/canvasTool/handleImg'
import { mergeOpts, setCanvas } from './tools'
import type { CanvasAttrs, Mode, DrawImgOpts, ImgInfo, RecordPath, CanvasItem, ShotParams, NoteBoardOptions, DrawMapVal, NoteBoardOptionsRequired } from './type'
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
 * 扩展了绘制图形的 NoteBoard
 * @bug 尚未完成 撤销与重做
 */
export class NoteBoardWithShape extends DrawShape {

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
    this.setDrawMap()

    const {
      el,
      width,
      height,
    } = this.opts

    // 设置画笔画板置顶
    this.canvas.style.zIndex = '99'

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

      default:
        break
    }
  }

  /**
   * 获取画板图像内容
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
   * 获取画板遮罩（画笔）内容
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
  async reset() {
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
   * 绘制图片，可调整大小，自适应尺寸等
   */
  async drawImg(
    img: HTMLImageElement | string,
    options: DrawImgOpts = {}
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
    return ['rect'].includes(mode ?? this.mode)
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

  private setDrawMap() {
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
