import { getImg } from '@/canvasTool'
import type { Mode, NoteBoardOptions } from './type'
import { createUnReDoList } from '@/utils'
import type { ShapeType } from '@/Shapes'
import { NoteBoardBase } from './NoteBoardBase'


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
export class NoteBoardWithBase64 extends NoteBoardBase {

  mode: NoteBoardWithBase64Mode = 'draw'

  /**
   * 历史记录
   */
  history = createUnReDoList<string>()

  constructor(opts: NoteBoardOptions) {
    super(opts)
    this.bindEvent()
    this.setMode(this.mode)
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
   * 添加一个新的历史记录
   * @param data 图片数据 base64，默认从画笔画布提取
   */
  async addNewRecord(data?: string) {
    const base64 = data || await this.exportMask()
    this.history.add(base64)
  }

  /***************************************************
   *                    Events
   ***************************************************/

  bindEvent() {
    const { canvas: cvs } = this
    cvs.addEventListener('mousedown', this.onMousedown)
    cvs.addEventListener('mousemove', this.onMousemove)
    cvs.addEventListener('mouseup', this.onMouseup)
    cvs.addEventListener('mouseleave', this.onMouseLeave)
    cvs.addEventListener('wheel', this.onWheel)
  }

  onMousedown = (e: MouseEvent) => {
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

  onMousemove = (e: MouseEvent) => {
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

  onMouseup = (e: MouseEvent) => {
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

  onMouseLeave = (e: MouseEvent) => {
    this.opts.onMouseLeave?.(e)

    if (this.mode === 'drag') {
      this.isDragging = false
    }

    if (!this.canDraw) return
    this.isDrawing = false
  }

  onWheel = (e: WheelEvent) => {
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