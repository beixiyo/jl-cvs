import { clearAllCvs, createCvs, cutImg, getCvsImg, getDPR, getImg } from '@/canvasTool'
import type { ILifecycleManager } from '@/types'
import { getCircleCursor } from '@/utils'
import { EventBus } from '@jl-org/tool'
import { applyHiDPI } from '../utils/dpr'
import { mergeOpts, setCanvas } from './tools'
import type {
  AddCanvasOpts,
  CanvasAttrs,
  CanvasItem,
  DisposeOpts,
  DrawImgOptions,
  ExportOptions,
  ImgInfo,
  NoteBoardOptions,
  NoteBoardOptionsRequired,
} from './type'

export abstract class NoteBoardBase<T extends Record<string, any>> extends EventBus<T> implements ILifecycleManager {
  dpr = getDPR()

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
  /** 背景画布的绘制记录，用于视口变化后完整重绘 */
  private imgDrawRecords: ImgInfo[] = []
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

  /** 是否正在绘制 */
  isDrawing = false
  drawStart = { x: 0, y: 0 }

  /** 是否正在拖拽 */
  isDragging = false
  dragStart = { x: 0, y: 0 }
  mousePoint = { x: 0, y: 0 }

  /** 当前模式 */
  abstract mode: any

  /** 历史记录 */
  abstract history: any

  /** 撤销 */
  abstract undo(): void

  /** 重做 */
  abstract redo(): void

  /** 是否可以执行撤销 */
  abstract canUndo(): boolean

  /** 是否可以执行重做 */
  abstract canRedo(): boolean

  /** 移除所有事件 */
  abstract rmEvent(): void

  /** 绑定事件 */
  abstract bindEvent(): void

  /** 设置模式 */
  abstract setMode(mode: any): void

  /** 清理并释放所有资源 */
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
  }

  constructor(opts: NoteBoardOptions) {
    super({ triggerBefore: true })
    this.noteBoardOpts = mergeOpts(opts)

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
  }

  protected get canDraw() {
    return ['brush', 'erase'].includes(this.mode)
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
    canvasList: HTMLCanvasElement[] = this.canvasList.map((item) => item.canvas),
  ) {
    const canvasDataUrls = []
    for (const canvas of canvasList) {
      canvasDataUrls.push(
        await this.exportLayer({
          ...options,
          canvas,
        }),
      )
    }

    const imgs = await Promise.all(canvasDataUrls.map((item) => getImg(item))) as HTMLImageElement[]
    for (const item of imgs) {
      if (!item) return ''
    }
    const img = imgs[0]
    const width = img.naturalWidth || img.width
    const height = img.naturalHeight || img.height
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
    if (!img) return ''

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
    if (!imgInfo) throw new Error('imgInfo is undefined')

    /**
     * 缩放回原始大小的计算过程
     */
    const dpr = this.dpr

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
      ? await getImg(img, (img) => img.crossOrigin = 'anonymous')
      : img
    if (!newImg) return new Error('Image load failed')

    const {
      width: canvasWidth,
      height: canvasHeight,
    } = this.noteBoardOpts

    const imgWidth = options.imgWidth ?? (newImg.naturalWidth || newImg.width)
    const imgHeight = options.imgHeight ?? (newImg.naturalHeight || newImg.height)

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

    const currentImgInfo: ImgInfo = {
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

    context.drawImage(newImg, x, y, drawWidth, drawHeight)

    if (context === this.imgCtx) {
      this.imgDrawRecords.push(currentImgInfo)
    }
    if (needRecordImgInfo) {
      this.imgInfo = currentImgInfo
    }
    afterDraw?.(currentImgInfo)
  }

  /**
   * 按记录重绘背景画布
   */
  redrawImgCanvas() {
    this.imgDrawRecords.forEach((item) => {
      const { img, x, y, drawWidth, drawHeight } = item
      this.imgCtx.drawImage(img, x, y, drawWidth, drawHeight)
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
    if (clearImg) {
      clearAllCvs(this.imgCtx, this.imgCanvas)
      this.imgDrawRecords = []
      this.imgInfo = undefined
    }
  }

  /**
   * 添加新的画布到 canvasList 中
   * 尺寸与逻辑坐标变换由 setCanvas 内的 applyHiDPI 统一处理，无需手动设置
   */
  addCanvas(name: string, opts: AddCanvasOpts) {
    const options = this.getAddcanvasOpts(opts)
    this.canvasList.push({
      canvas: options.canvas,
      ctx: options.canvas.getContext('2d') as CanvasRenderingContext2D,
      name,
    })

    options.parentEl.appendChild(options.canvas)
    setCanvas(options, this.dpr)
  }

  /**
   * 设置画布和上下文样式
   * @param recordStyle 样式
   * @param ctx 指定某个画布上下文，不指定则设置全部
   */
  setStyle(recordStyle: CanvasAttrs, ctx?: CanvasRenderingContext2D) {
    const { width, height } = recordStyle
    if (width !== undefined || height !== undefined) {
      /** 尺寸变更必须走 applyHiDPI，避免 canvas.width 赋值丢失逻辑坐标系变换 */
      for (const item of this.canvasList) {
        const w = width ?? this.noteBoardOpts.width
        const h = height ?? this.noteBoardOpts.height
        applyHiDPI(item.canvas, item.ctx, w, h, this.dpr)
      }
    }

    const contexts = ctx
      ? [ctx]
      : this.canvasList.map((item) => item.ctx)

    for (const targetCtx of contexts) {
      if (recordStyle.strokeStyle !== undefined) targetCtx.strokeStyle = recordStyle.strokeStyle
      if (recordStyle.lineWidth !== undefined) targetCtx.lineWidth = recordStyle.lineWidth
      if (recordStyle.fillStyle !== undefined) targetCtx.fillStyle = recordStyle.fillStyle
      if (recordStyle.lineCap !== undefined) targetCtx.lineCap = recordStyle.lineCap
      if (recordStyle.globalCompositeOperation !== undefined) {
        targetCtx.globalCompositeOperation = recordStyle.globalCompositeOperation
      }
    }
  }

  /**
   * 更新画板的全局配置选项
   * @param opts - 需要更新的选项
   */
  updateOptions(opts: Partial<CanvasAttrs>) {
    /** 1. 更新主配置对象 */
    Object.assign(this.noteBoardOpts, opts)

    /** 2. 将新样式应用到当前上下文中，以便立即生效 */
    this.setStyle(opts)
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
