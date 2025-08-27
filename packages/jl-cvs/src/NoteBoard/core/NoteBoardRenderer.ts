import { ImageShape } from '@/Shapes'
import { NoteBoard } from '../NoteBoard'

/**
 * NoteBoard 渲染模块
 */
export class NoteBoardRenderer {
  constructor(private readonly noteBoard: NoteBoard) { }

  /**
   * 重绘所有内容
   */
  redrawAll() {
    const { noteBoard } = this
    /** 先重置变换矩阵，然后清屏 */
    noteBoard.canvasList.forEach((item) => {
      noteBoard.viewport.resetTransform(item.ctx, NoteBoard.dpr)
    })
    noteBoard.clear(false)

    /** 应用世界坐标变换 */
    noteBoard.canvasList.forEach((item) => {
      noteBoard.viewport.applyTransform(item.ctx, NoteBoard.dpr)
    })

    const lastRecord = noteBoard.history.curValue
    if (!lastRecord) {
      return
    }

    /** 按记录顺序绘制所有内容 */
    for (const record of lastRecord) {
      /** 设置绘制样式 */
      noteBoard.setStyle(record.canvasAttrs, noteBoard.ctx)

      /** 设置混合模式 */
      if (record.mode === 'erase') {
        noteBoard.ctx.globalCompositeOperation = 'destination-out'
      }
      else if (noteBoard.interaction.isShapeMode(record.mode)) {
        noteBoard.ctx.globalCompositeOperation = noteBoard.noteBoardOpts.shapeGlobalCompositeOperation
      }
      else {
        noteBoard.ctx.globalCompositeOperation = noteBoard.noteBoardOpts.drawGlobalCompositeOperation
      }

      /** 绘制所有图形 */
      for (const shape of record.shapes) {
        /** 如果是 ImageShape 且还没加载，设置加载完成后的重绘回调 */
        if (shape.name === 'imageShape' && shape instanceof ImageShape) {
          if (shape.loadState === 'loading' && !shape.onLoadCallback) {
            shape.onLoadCallback = () => {
              this.redrawAll()
            }
          }
        }
        shape.draw(noteBoard.ctx)
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
