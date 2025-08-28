import type { NoteBoard } from '../NoteBoard'
import { ImageShape } from '@/Shapes'

/**
 * NoteBoard 渲染模块
 */
export class NoteBoardRenderer {
  /** 标志位，用于防止重复的重绘请求 */
  private isRedrawScheduled = false

  constructor(private readonly noteBoard: NoteBoard) { }

  /**
   * 请求重绘所有内容 (异步队列)
   * 使用 requestAnimationFrame 来合并多次连续的重绘请求，在下一帧统一处理，从而优化性能
   */
  redrawAll() {
    if (this.isRedrawScheduled) {
      return // 如果已经安排了重绘，则直接返回，等待下一帧的绘制
    }
    this.isRedrawScheduled = true
    requestAnimationFrame(() => {
      this._performRedraw()
      this.isRedrawScheduled = false
    })
  }

  /**
   * 真正执行重绘所有内容的核心逻辑
   */
  private _performRedraw() {
    const { noteBoard } = this
    const { noteBoardOpts, canvasList, viewport, history, imgInfo, ctx } = noteBoard

    /** 重置和清空画布 */
    canvasList.forEach((item) => {
      /** 如果背景不跟随，则完全跳过对它的任何操作 */
      if (item.name === 'imgCanvas' && !noteBoardOpts.isImgCanvasFollow) {
        return
      }
      viewport.resetTransform(item.ctx, noteBoard.dpr)
    })

    /** 如果背景不跟随，则不清空它 */
    noteBoard.clear(noteBoardOpts.isImgCanvasFollow, true)

    /** 应用变换 */
    canvasList.forEach((item) => {
      if (item.name === 'imgCanvas' && !noteBoardOpts.isImgCanvasFollow) {
        return
      }
      viewport.applyTransform(item.ctx, noteBoard.dpr)
    })

    /** 重绘背景图片 */
    if (noteBoardOpts.isImgCanvasFollow && imgInfo) {
      const { img, x, y, drawWidth, drawHeight } = imgInfo
      noteBoard.imgCtx.drawImage(img, x, y, drawWidth, drawHeight)
    }

    const lastRecord = history.curValue
    if (!lastRecord) {
      return
    }

    /** 按记录顺序绘制所有内容 */
    for (const record of lastRecord) {
      /** 设置绘制样式 */
      noteBoard.setStyle(record.canvasAttrs, ctx)

      /** 设置混合模式 */
      if (record.mode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out'
      }
      else if (noteBoard.interaction.isShapeMode(record.mode)) {
        ctx.globalCompositeOperation = noteBoardOpts.shapeGlobalCompositeOperation
      }
      else {
        ctx.globalCompositeOperation = noteBoardOpts.drawGlobalCompositeOperation
      }

      /** 绘制所有图形 */
      for (const shape of record.shapes) {
        /** 如果是 ImageShape 且还没加载，设置加载完成和失败后的重绘回调 */
        if (shape.name === 'imageShape' && shape instanceof ImageShape) {
          if (shape.loadState === 'loading') {
            if (!shape.onLoadCallback) {
              shape.onLoadCallback = () => this.redrawAll()
            }
            if (!shape.onErrorCallback) {
              shape.onErrorCallback = () => this.redrawAll()
            }
          }
        }
        shape.draw(ctx)
      }
    }

    /** 恢复当前模式的样式 */
    noteBoard.setMode(noteBoard.mode)
  }

  /**
   * 绘制当前线段（实时绘制优化）
   */
  drawCurrentSegment(fromX: number, fromY: number, toX: number, toY: number) {
    const { noteBoard } = this

    /** 设置当前笔刷的样式 */
    noteBoard.ctx.strokeStyle = noteBoard.noteBoardOpts.strokeStyle
    noteBoard.ctx.lineWidth = noteBoard.noteBoardOpts.lineWidth
    noteBoard.ctx.lineCap = 'round'
    noteBoard.ctx.lineJoin = 'round'

    /** 设置当前模式的混合模式 */
    if (noteBoard.mode === 'erase') {
      noteBoard.ctx.globalCompositeOperation = 'destination-out'
    }
    else {
      noteBoard.ctx.globalCompositeOperation = noteBoard.noteBoardOpts.drawGlobalCompositeOperation
    }

    /** 绘制线段 */
    noteBoard.ctx.beginPath()
    noteBoard.ctx.moveTo(fromX, fromY)
    noteBoard.ctx.lineTo(toX, toY)
    noteBoard.ctx.stroke()
  }

  /**
   * 恢复当前模式的光标样式
   */
  setCursorForCurrentMode() {
    const { noteBoard } = this

    switch (noteBoard.mode) {
      case 'brush':
      case 'erase':
        noteBoard.setCursor()
        break

      case 'none':
        noteBoard.canvas.style.cursor = 'unset'
        break
      case 'drag':
        noteBoard.canvas.style.cursor = 'grab'
        break

      case 'rect':
      case 'circle':
      case 'arrow':
        noteBoard.canvas.style.cursor = 'crosshair'
        break
      default:
        noteBoard.canvas.style.cursor = 'default'
        break
    }
  }
}
