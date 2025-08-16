import type { NoteBoard } from '../'

/**
 * NoteBoard 渲染模块
 */
export class NoteBoardRenderer {
  private noteBoard: NoteBoard

  constructor(noteBoard: NoteBoard) {
    this.noteBoard = noteBoard
  }

  /**
   * 重绘所有内容
   */
  redrawAll() {
    this.noteBoard.clear(false)

    const lastRecord = this.noteBoard.history.curValue
    if (!lastRecord) {
      return
    }

    /** 按记录顺序绘制所有内容 */
    for (const record of lastRecord) {
      /** 设置绘制样式 */
      this.noteBoard.setStyle(record.canvasAttrs, this.noteBoard.ctx)

      /** 设置混合模式 */
      if (record.mode === 'erase') {
        this.noteBoard.ctx.globalCompositeOperation = 'destination-out'
      }
      else if (this.noteBoard.interaction.isShapeMode(record.mode)) {
        this.noteBoard.ctx.globalCompositeOperation = this.noteBoard.noteBoardOpts.shapeGlobalCompositeOperation
      }
      else {
        this.noteBoard.ctx.globalCompositeOperation = this.noteBoard.noteBoardOpts.drawGlobalCompositeOperation
      }

      /** 绘制所有图形 */
      for (const shape of record.shapes) {
        shape.draw(this.noteBoard.ctx)
      }
    }

    /** 恢复当前模式的样式 */
    this.noteBoard.setMode(this.noteBoard.mode)
  }

  /**
   * 绘制当前线段（实时绘制优化）
   */
  drawCurrentSegment(fromX: number, fromY: number, toX: number, toY: number) {
    /** 设置当前笔刷的样式 */
    this.noteBoard.ctx.strokeStyle = this.noteBoard.noteBoardOpts.strokeStyle
    this.noteBoard.ctx.lineWidth = this.noteBoard.noteBoardOpts.lineWidth
    this.noteBoard.ctx.lineCap = 'round'
    this.noteBoard.ctx.lineJoin = 'round'

    /** 设置当前模式的混合模式 */
    if (this.noteBoard.mode === 'erase') {
      this.noteBoard.ctx.globalCompositeOperation = 'destination-out'
    }
    else {
      this.noteBoard.ctx.globalCompositeOperation = this.noteBoard.noteBoardOpts.drawGlobalCompositeOperation
    }

    /** 绘制线段 */
    this.noteBoard.ctx.beginPath()
    this.noteBoard.ctx.moveTo(fromX, fromY)
    this.noteBoard.ctx.lineTo(toX, toY)
    this.noteBoard.ctx.stroke()
  }

  /**
   * 恢复当前模式的光标样式
   */
  setCursorForCurrentMode() {
    switch (this.noteBoard.mode) {
      case 'brush':
      case 'erase':
        this.noteBoard.setCursor()
        break

      case 'none':
        this.noteBoard.canvas.style.cursor = 'unset'
        break
      case 'drag':
        this.noteBoard.canvas.style.cursor = 'grab'
        break

      case 'rect':
      case 'circle':
      case 'arrow':
        this.noteBoard.canvas.style.cursor = 'crosshair'
        break
      default:
        this.noteBoard.canvas.style.cursor = 'default'
        break
    }
  }
}
