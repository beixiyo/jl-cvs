import type { NoteBoard, NoteBoardMode } from '../'
import type { Point } from '../type'
import type { BaseShape } from '@/Shapes/libs/BaseShape'
import { excludeKeys } from '@/utils'

/**
 * NoteBoard 交互逻辑模块
 */
export class NoteBoardInteraction {
  /** 正在拖拽的形状副本 */
  draggedShape: BaseShape | null = null
  /** 是否正在拖拽形状 */
  isDragging = false
  /** 拖拽起始的世界坐标 */
  dragStartPoint: Point = { x: 0, y: 0 }

  constructor(private readonly noteBoard: NoteBoard) { }

  /**
   * 设置 DrawShape 的事件函数
   */
  setupDrawShapeEvents() {
    const { noteBoard } = this

    /** 当 DrawShape 创建新图形时的回调 */
    noteBoard.drawShape.on('shapeCreated', (shape: BaseShape) => {
      this.addShapesToHistory([shape])
    })

    /** 当 DrawShape 更新图形时的回调 */
    noteBoard.drawShape.on('shapeUpdated', () => {
      noteBoard.renderer.redrawAll()
    })

    /** 当 DrawShape 需要设置光标时的回调 */
    noteBoard.drawShape.on('cursorChange', (cursor: string) => {
      /** 如果正在进行画布拖拽或形状拖拽，不更新光标样式 */
      if (
        noteBoard.rightMouseDragging
        || (noteBoard.mode === 'drag' && noteBoard.isDragging)
        || this.isDragging
        || noteBoard.interaction.isDragging
      ) {
        return
      }
      noteBoard.canvas.style.cursor = cursor
    })

    /** 当 DrawShape 开始拖拽图形时的回调 */
    noteBoard.drawShape.on('shapeDragStart', (shape: BaseShape) => {
      /** 拖拽时需要撤销上一步操作，因为拖拽不应该创建新的历史记录 */
      noteBoard.history.undo()
      noteBoard.history.cleanUnusedNodes()
    })

    /** 当 DrawShape 结束拖拽时的回调 */
    noteBoard.drawShape.on('shapeDragEnd', () => {
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

    const finalShapes = new Map<string, BaseShape>()
    for (const record of lastRecord) {
      for (const shape of record.shapes) {
        finalShapes.set(shape.meta.id, shape)
      }
    }
    return [...finalShapes.values()]
  }

  /**
   * 获取指定世界坐标点下的最顶层形状
   * @param worldPoint - 世界坐标点
   */
  getShapeAtPoint(worldPoint: Point): BaseShape | null {
    const shapes = this.getAllShapes()

    /** 从最顶层（数组末尾）开始查找 */
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i]
      if (shape.isInPath(worldPoint.x, worldPoint.y)) {
        return shape
      }
    }

    return null
  }
}
