import type { NoteBoard, RecordPath } from '../'
import type { BoundRect } from '@/Shapes/type'
import { type BaseShape, ImageShape } from '@/Shapes'

/**
 * NoteBoard 渲染模块
 */
export class NoteBoardRenderer {
  /** 标志位，用于防止重复的重绘请求 */
  private isRedrawScheduled = false
  /** 用于实时预览的临时形状（如拖拽中的形状） */
  public tempShape: BaseShape | null = null

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

    const visibleRect = noteBoard.getVisibleWorldRect()

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

    if (lastRecord) {
      ctx.save()

      try {
        /**
         * 核心渲染逻辑：按 ID 去重，只绘制最新的形状
         * 遍历所有历史记录，后面的形状会覆盖前面相同 ID 的形状
         */
        const finalShapes = new Map<string, { shape: BaseShape, record: RecordPath }>()
        for (const record of lastRecord) {
          for (const shape of record.shapes) {
            finalShapes.set(shape.meta.id, { shape, record })
          }
        }

        /** 如果正在预览临时形状（如拖拽），则从最终列表中移除其原始版本 */
        if (this.tempShape) {
          finalShapes.delete(this.tempShape.meta.id)
        }

        /** 按 zIndex 排序，zIndex 大的后绘制 */
        const sortedShapes = [...finalShapes.values()].sort((a, b) => a.shape.meta.zIndex - b.shape.meta.zIndex)

        for (const { shape, record } of sortedShapes) {
          /** 可视区域渲染优化：只绘制视口内的形状 */
          if (!isRectIntersect(shape.getBounds(), visibleRect)) {
            continue
          }

          /** 设置绘制样式 */
          noteBoard.setStyle(shape.shapeStyle, ctx)

          /** 根据历史记录的模式设置混合模式 */
          if (record.mode === 'erase') {
            ctx.globalCompositeOperation = 'destination-out'
          }
          else if (record.mode === 'brush') {
            ctx.globalCompositeOperation = noteBoardOpts.drawGlobalCompositeOperation
          }
          else {
            ctx.globalCompositeOperation = noteBoardOpts.shapeGlobalCompositeOperation
          }

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
      finally {
        ctx.restore()
      }
    }

    /** 绘制临时的预览形状 */
    if (this.tempShape) {
      /** 可视区域渲染优化：只绘制视口内的形状 */
      if (isRectIntersect(this.tempShape.getBounds(), visibleRect)) {
        /** 临时形状的绘制也需要包裹，以防它污染最终的 setMode */
        ctx.save()
        try {
          ctx.globalCompositeOperation = noteBoardOpts.shapeGlobalCompositeOperation
          this.tempShape.draw(ctx)
        }
        finally {
          ctx.restore()
        }
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

    /** 如果正在拖拽形状，则保持 grabbing 光标，不进行任何设置 */
    if (noteBoard.interaction.isDragging) {
      return
    }

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

/**
 * 判断两个矩形是否相交
 */
function isRectIntersect(rect1: BoundRect, rect2: BoundRect): boolean {
  return (
    rect1.x < rect2.x + rect2.width
    && rect1.x + rect1.width > rect2.x
    && rect1.y < rect2.y + rect2.height
    && rect1.y + rect1.height > rect2.y
  )
}
