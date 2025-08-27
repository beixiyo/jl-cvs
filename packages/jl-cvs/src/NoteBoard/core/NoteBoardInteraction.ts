import type { NoteBoard, NoteBoardMode } from '../'
import type { BaseShape } from '@/Shapes/libs/BaseShape'
import { excludeKeys } from '@/utils'

/**
 * NoteBoard 交互逻辑模块
 */
export class NoteBoardInteraction {
  constructor(private readonly noteBoard: NoteBoard) { }

  /**
   * 设置 DrawShape 的事件函数
   */
  setupDrawShapeEvents() {
    /** 当 DrawShape 创建新图形时的回调 */
    this.noteBoard.drawShape.on('shapeCreated', (shape: BaseShape) => {
      this.addShapesToHistory([shape])
    })

    /** 当 DrawShape 更新图形时的回调 */
    this.noteBoard.drawShape.on('shapeUpdated', () => {
      this.noteBoard.renderer.redrawAll()
    })

    /** 当 DrawShape 需要设置光标时的回调 */
    this.noteBoard.drawShape.on('cursorChange', (cursor: string) => {
      /** 如果正在进行拖拽（右键拖拽或拖拽模式），不更新光标样式 */
      if (this.noteBoard.rightMouseDragging || (this.noteBoard.mode === 'drag' && this.noteBoard.isDragging)) {
        return
      }
      this.noteBoard.canvas.style.cursor = cursor
    })

    /** 当 DrawShape 开始拖拽图形时的回调 */
    this.noteBoard.drawShape.on('shapeDragStart', (shape: BaseShape) => {
      /** 拖拽时需要撤销上一步操作，因为拖拽不应该创建新的历史记录 */
      this.noteBoard.history.undo()
      this.noteBoard.history.cleanUnusedNodes()
    })

    /** 当 DrawShape 结束拖拽时的回调 */
    this.noteBoard.drawShape.on('shapeDragEnd', () => {
      /** 拖拽结束后添加新的历史记录 */
      const shapes = this.getAllShapes()
      if (shapes.length > 0) {
        this.addShapesToHistory(shapes)
      }
    })
  }

  /**
   * 是图形模式
   */
  isShapeMode(mode?: string) {
    return ['rect', 'circle', 'arrow'].includes(mode ?? this.noteBoard.mode)
  }

  /**
   * 是笔刷模式（draw/erase）
   */
  isBrushMode(mode?: string) {
    return ['brush', 'erase'].includes(mode ?? this.noteBoard.mode)
  }

  /**
   * 添加多个图形到历史记录（用于拖拽结束后）
   */
  addShapesToHistory(shapes: BaseShape[], mode?: NoteBoardMode) {
    const lastRecord = this.noteBoard.history.curValue
    this.noteBoard.history.add([
      ...(lastRecord || []),
      {
        canvasAttrs: excludeKeys(
          { ...this.noteBoard.noteBoardOpts },
          [
            'el',
            'minScale',
            'maxScale',
            'height',
            'width',
          ],
        ),
        shapes: [...shapes], // 复制所有当前图形
        mode: mode ?? this.noteBoard.mode,
      },
    ])
  }

  /**
   * 获取当前所有图形（包括笔刷）
   */
  getAllShapes(): BaseShape[] {
    const lastRecord = this.noteBoard.history.curValue
    if (!lastRecord || lastRecord.length === 0) {
      return []
    }
    return lastRecord[lastRecord.length - 1].shapes
  }
}
