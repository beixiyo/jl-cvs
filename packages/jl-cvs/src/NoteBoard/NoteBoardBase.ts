import type { AddCanvasOpts, CanvasAttrs, CanvasItem, DisposeOpts, DrawImgOptions, ExportOptions, ImgInfo, Mode, NoteBoardOptions, NoteBoardOptionsRequired } from './type'
import type { ShapeType } from '@/Shapes/libs'
import type { ILifecycleManager } from '@/types'
import { EventBus } from '@jl-org/tool'
import { clearAllCvs, createCvs, cutImg, getCvsImg, getDPR, getImg } from '@/canvasTool'
import { getCircleCursor } from '@/utils'
import { mergeOpts, setCanvas } from './tools'

export abstract class NoteBoardBase<T extends Record<string, any>>
  extends EventBus<T>
  implements ILifecycleManager {
  static dpr = getDPR()

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

  noteBoardOpts: NoteBoardOptionsRequired

  /** 开启鼠标滚轮缩放 */
  isEnableZoom = true

  /**
   * 记录缩放、位置等属性
   */
  isDrawing = false
  drawStart = { x: 0, y: 0 }

  isDragging = false
  dragStart = { x: 0, y: 0 }
  mousePoint = { x: 0, y: 0 }

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
   * 是否可以执行撤销
   */
  abstract canUndo(): boolean

  /**
   * 是否可以执行重做
   */
  abstract canRedo(): boolean

  /**
   * 移除所有事件
   */
  abstract rmEvent(): void
  abstract bindEvent(): void

  /**
   * 设置模式
   */
  abstract setMode(mode: any): void

  /**
   * 清理并释放所有资源
   */
  dispose(opts: DisposeOpts = {}) {
    if (opts.handleCleanCanvasList) {
      opts.handleCleanCanvasList(this.canvasList)
    }
    else {
      /** 移除所有画布元素 */
      this.canvasList.forEach((item) => {
        if (item.canvas.parentNode) {
          item.canvas.parentNode.removeChild(item.canvas)
        }
      })
      /** 清空画布列表 */
      this.canvasList.splice(0)
    }

    /** 移除所有事件监听器 */
    this.rmEvent()

    /** 清空画布内容 */
    this.clear(true, true)

    /** 重置变换 */
    this.resetSize()

    /** 清理引用 */
    this.imgInfo = undefined
    this.el = null as any
    this.canvas = null as any
    this.ctx = null as any
    this.imgCanvas = null as any
    this.imgCtx = null as any
  }

  constructor(opts: NoteBoardOptions) {
    super({ triggerBefore: true })
    this.noteBoardOpts = mergeOpts(opts, NoteBoardBase.dpr)

    /** 设置画笔画板置顶 */
    this.canvas.style.zIndex = this.noteBoardOpts.canvasZIndex
    this.el = opts.el

    this.el.style.overflow = 'hidden'
    if (getComputedStyle(this.el).position === 'static') {
      this.el.style.position = 'relative'
    }

    this.addCanvas(
      'imgCanvas',
      { canvas: this.imgCanvas },
    )
    this.addCanvas(
      'brushCanvas',
      { canvas: this.canvas },
    )
    this.setStyle(this.noteBoardOpts)

    this.ctx.scale(NoteBoardBase.dpr, NoteBoardBase.dpr)
    this.imgCtx.scale(NoteBoardBase.dpr, NoteBoardBase.dpr)
  }

  protected get canDraw() {
    return ['draw', 'erase'].includes(this.mode)
  }

  /**
   * 获取画板图像内容
   */
  async exportImg(
    options: Omit<ExportOptions, 'canvas'> = {},
  ) {
    const canvas = this.imgCanvas
    return this.exportLayer({
      ...options,
      canvas,
    })
  }

  /**
   * 获取画板遮罩（画笔）内容
   */
  async exportMask(
    options: Omit<ExportOptions, 'canvas'> = {},
  ) {
    const canvas = this.canvas
    return this.exportLayer({
      ...options,
      canvas,
    })
  }

  /**
   * 导出整个图层，或者指定多个 canvas 图层
   */
  async exportAllLayer(
    options: Omit<ExportOptions, 'canvas'> = {},
    canvasList: HTMLCanvasElement[] = this.canvasList.map(item => item.canvas),
  ) {
    const canvasDataUrls = []
    for (const canvas of canvasList) {
      canvasDataUrls.push(await this.exportLayer({
        ...options,
        canvas,
      }))
    }

    const imgs = await Promise.all(canvasDataUrls.map(item => getImg(item))) as HTMLImageElement[]
    for (const item of imgs) {
      if (!item)
        return ''
    }
    const img = imgs[0]

    let width: number,
      height: number

    if (options.exportOnlyImgArea) {
      width = img.width
      height = img.height
    }
    else {
      width = this.noteBoardOpts.width
      height = this.noteBoardOpts.height
    }

    const { ctx, cvs } = createCvs(width, height, { dpr: NoteBoardBase.dpr })
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
      imgInfo = this.imgInfo,
    }: ExportOptions = {},
  ) {
    const rawBase64 = await getCvsImg(canvas, 'base64', mimeType, quality)

    /**
     * 没有记录图像信息，或者不仅仅导出图像区域
     * 则不做任何处理，直接导出整个画布
     */
    if (!exportOnlyImgArea || !imgInfo) {
      return rawBase64
    }

    const img = await getImg(rawBase64)
    if (!img)
      return ''

    const {
      x,
      y,
      width,
      height,
      scaleX,
      scaleY,
    } = this.calcImgInfoWithDPR(imgInfo)

    return await cutImg(img, {
      x,
      y,
      width,
      height,
      scaleX,
      scaleY,
      mimeType,
      quality,
    })
  }

  /**
   * 根据 dpr 计算图片信息
   */
  calcImgInfoWithDPR(imgInfo = this.imgInfo) {
    if (!imgInfo)
      throw new Error('imgInfo is undefined')

    /**
     * 缩放回原始大小的计算过程
     */
    const dpr = NoteBoardBase.dpr

    // 1. 计算源图像（物理像素图像）上的裁剪区域（物理像素）
    const physicalX = imgInfo.x * dpr
    const physicalY = imgInfo.y * dpr
    const physicalWidth = imgInfo.drawWidth * dpr // 这是图像在画布上绘制的物理宽度
    const physicalHeight = imgInfo.drawHeight * dpr // 这是图像在画布上绘制的物理高度

    // 2. 计算目标尺寸：图像的原始的尺寸
    const { rawWidth, rawHeight } = imgInfo

    // 3. 计算 cutImg 需要的 scaleX 和 scaleY
    const scaleXNeeded = rawWidth / physicalWidth
    const scaleYNeeded = rawHeight / physicalHeight
    const minScale = Math.min(scaleXNeeded, scaleYNeeded)

    return {
      minScale,
      scaleX: scaleXNeeded,
      scaleY: scaleYNeeded,

      x: physicalX,
      y: physicalY,
      width: physicalWidth,
      height: physicalHeight,
    }
  }

  /**
   * 绘制图片，可调整大小，自适应尺寸等
   * ### 图片默认使用单独的画布绘制，置于底层
   */
  async drawImg(
    img: HTMLImageElement | string,
    options: DrawImgOptions = {},
  ) {
    const {
      afterDraw,
      beforeDraw,
      needClear = false,
      autoFit,
      center,
      context = this.imgCtx,
      needRecordImgInfo = true,
    } = options

    beforeDraw?.()
    needClear && this.clear()

    const newImg = typeof img === 'string'
      ? await getImg(img, img => img.crossOrigin = 'anonymous')
      : img
    if (!newImg)
      return new Error('Image load failed')

    const {
      width: canvasWidth,
      height: canvasHeight,
    } = this.noteBoardOpts

    const imgWidth = options.imgWidth ?? newImg.naturalWidth
    const imgHeight = options.imgHeight ?? newImg.naturalHeight

    const scaleX = canvasWidth / imgWidth
    const scaleY = canvasHeight / imgHeight
    const minScale = Math.min(scaleX, scaleY)

    let drawWidth = imgWidth
    let drawHeight = imgHeight
    let x = 0
    let y = 0

    if (autoFit) {
      /** 保持宽高比的情况下，使图片适应画布 */
      drawWidth = imgWidth * minScale
      drawHeight = imgHeight * minScale
    }
    if (center) {
      /** 计算居中位置 */
      x = (canvasWidth - drawWidth) / 2
      y = (canvasHeight - drawHeight) / 2
    }

    context.drawImage(
      newImg,
      x,
      y,
      drawWidth,
      drawHeight,
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
   * @param callback 在设置完成 canvas 后执行的回调
   */
  async setTransform(callback?: (styles: {
    transform: string
    transformOrigin: string
  }) => void) {
    const transformOrigin = `${this.mousePoint.x}px ${this.mousePoint.y}px`
    const transform = `scale(${this.scale}, ${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`

    this.canvasList.forEach((item) => {
      item.canvas.style.transformOrigin = transformOrigin
      item.canvas.style.transform = transform
    })

    callback?.({
      transform,
      transformOrigin,
    })
  }

  /**
   * 重置大小
   */
  async resetSize() {
    this.canvasList.forEach((item) => {
      item.canvas.style.transformOrigin = 'none'
      item.canvas.style.transform = 'none'
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
   * 添加新的画布到 canvasList 中
   * ## 记得手动设置 ctx.scale(dpr, dpr)
   */
  addCanvas(name: string, opts: AddCanvasOpts) {
    const options = this.getAddcanvasOpts(opts)
    this.canvasList.push({
      canvas: options.canvas,
      ctx: options.canvas.getContext('2d') as CanvasRenderingContext2D,
      name,
    })

    options.parentEl.appendChild(options.canvas)
    setCanvas(options, NoteBoardBase.dpr)
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

      this.noteBoardOpts[k] = attr
      if (k === 'width' || k === 'height') {
        for (const item of this.canvasList) {
          item.canvas[k] = attr * NoteBoardBase.dpr
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
      lineWidth || this.noteBoardOpts.lineWidth,
      strokeStyle || this.noteBoardOpts.strokeStyle,
    )
  }

  /***************************************************
   *                    Private
   ***************************************************/

  private getAddcanvasOpts(opts: AddCanvasOpts) {
    return {
      width: this.noteBoardOpts.width,
      height: this.noteBoardOpts.height,
      center: true,
      parentEl: this.el,
      ...opts,
    } satisfies Required<AddCanvasOpts> & {
      parentEl: HTMLElement
    }
  }
}

export type NoteBoardWithBase64Mode = Exclude<Mode, ShapeType>
