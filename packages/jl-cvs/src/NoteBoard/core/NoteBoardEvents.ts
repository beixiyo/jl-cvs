import type { NoteBoard } from '../'
import { Brush } from '@/Shapes'

/**
 * NoteBoard 事件处理模块
 */
export class NoteBoardEvents {
  private noteBoard: NoteBoard

  constructor(noteBoard: NoteBoard) {
    this.noteBoard = noteBoard
  }

  bindEvent() {
    this.rmEvent()
    const { canvas } = this.noteBoard

    canvas.addEventListener('mousedown', this.onMousedown)
    canvas.addEventListener('mousemove', this.onMousemove)
    canvas.addEventListener('mouseup', this.onMouseup)
    canvas.addEventListener('mouseleave', this.onMouseLeave)
    canvas.addEventListener('wheel', this.onWheel)
    canvas.addEventListener('contextmenu', this.onContextMenu)
  }

  rmEvent() {
    const { canvas } = this.noteBoard

    canvas.removeEventListener('mousedown', this.onMousedown)
    canvas.removeEventListener('mousemove', this.onMousemove)
    canvas.removeEventListener('mouseup', this.onMouseup)
    canvas.removeEventListener('mouseleave', this.onMouseLeave)
    canvas.removeEventListener('wheel', this.onWheel)
    canvas.removeEventListener('contextmenu', this.onContextMenu)
  }

  onMousedown = (e: MouseEvent) => {
    this.noteBoard.emit('mouseDown', e)
    this.noteBoard.renderer.setCursorForCurrentMode()

    /** 拖拽模式 */
    if (this.noteBoard.mode === 'drag') {
      this.noteBoard.isDragging = true
      this.noteBoard.dragStart = { x: e.offsetX, y: e.offsetY }
      return
    }

    /** 右键拖拽判断 */
    if (e.button === 2 && this.noteBoard.noteBoardOpts.enableRightDrag !== false) {
      e.preventDefault()
      this.noteBoard.isDragging = true
      this.noteBoard.rightMouseDragging = true
      this.noteBoard.dragStart = { x: e.offsetX, y: e.offsetY }
      this.noteBoard.canvas.style.cursor = 'grabbing'
      return
    }

    /** 笔刷模式 */
    if (this.noteBoard.interaction.isBrushMode()) {
      this.noteBoard.isDrawing = true

      /** 创建新的笔刷 */
      this.noteBoard.currentBrush = new Brush({
        startX: e.offsetX,
        startY: e.offsetY,
        ctx: this.noteBoard.ctx,
        shapeStyle: {
          strokeStyle: this.noteBoard.noteBoardOpts.strokeStyle,
          lineWidth: this.noteBoard.noteBoardOpts.lineWidth,
        },
      })

      this.noteBoard.drawStart = {
        x: e.offsetX,
        y: e.offsetY,
      }
      return
    }

    /** 图形模式由 DrawShape 处理 */
    if (this.noteBoard.interaction.isShapeMode()) {
      this.noteBoard.drawShape.handleMouseDown(e)
      return
    }
  }

  onMousemove = (e: MouseEvent) => {
    this.noteBoard.emit('mouseMove', e)

    /** 拖拽 */
    if (this.noteBoard.isDragging) {
      const dx = e.offsetX - this.noteBoard.dragStart.x
      const dy = e.offsetY - this.noteBoard.dragStart.y

      this.noteBoard.translateX = this.noteBoard.translateX + dx
      this.noteBoard.translateY = this.noteBoard.translateY + dy

      this.noteBoard.setTransform()
      this.noteBoard.emit('dragging', {
        translateX: this.noteBoard.translateX,
        translateY: this.noteBoard.translateY,
        transformOriginX: this.noteBoard.dragStart.x,
        transformOriginY: this.noteBoard.dragStart.y,
        e,
      })

      return
    }

    /** 笔刷绘制 */
    if (this.noteBoard.interaction.isBrushMode() && this.noteBoard.isDrawing && this.noteBoard.currentBrush) {
      const { offsetX, offsetY } = e

      /** 直接绘制从上一个点到当前点的线段 */
      this.noteBoard.renderer.drawCurrentSegment(
        this.noteBoard.drawStart.x,
        this.noteBoard.drawStart.y,
        offsetX,
        offsetY,
      )

      /** 添加点到当前笔刷 */
      this.noteBoard.currentBrush.addPoint(offsetX, offsetY)

      this.noteBoard.drawStart = {
        x: offsetX,
        y: offsetY,
      }
      return
    }

    /** 图形模式的鼠标移动处理 */
    if (this.noteBoard.interaction.isShapeMode()) {
      this.noteBoard.drawShape.handleMouseMove(e)
      return
    }
  }

  onMouseup = (e: MouseEvent) => {
    this.noteBoard.emit('mouseUp', e)
    this.noteBoard.renderer.setCursorForCurrentMode()

    /** 右键拖拽结束 */
    if (this.noteBoard.rightMouseDragging) {
      this.noteBoard.isDragging = false
      this.noteBoard.rightMouseDragging = false
      this.noteBoard.translateX += e.offsetX - this.noteBoard.dragStart.x
      this.noteBoard.translateY += e.offsetY - this.noteBoard.dragStart.y
      return
    }

    if (this.noteBoard.mode === 'drag') {
      this.noteBoard.isDragging = false
      this.noteBoard.translateX += e.offsetX - this.noteBoard.dragStart.x
      this.noteBoard.translateY += e.offsetY - this.noteBoard.dragStart.y
      return
    }

    /** 笔刷绘制结束 */
    if (this.noteBoard.interaction.isBrushMode()) {
      this.noteBoard.isDrawing = false

      /** 在绘制结束时添加到历史记录 */
      if (this.noteBoard.currentBrush) {
        this.noteBoard.interaction.addShapesToHistory([this.noteBoard.currentBrush])
        this.noteBoard.currentBrush = null
      }
      return
    }

    /** 图形模式的鼠标抬起处理 */
    if (this.noteBoard.interaction.isShapeMode()) {
      this.noteBoard.drawShape.handleMouseUp()
      return
    }
  }

  onMouseLeave = (e: MouseEvent) => {
    this.noteBoard.emit('mouseLeave', e)
    this.noteBoard.renderer.setCursorForCurrentMode()

    if (this.noteBoard.rightMouseDragging) {
      this.noteBoard.isDragging = false
      this.noteBoard.rightMouseDragging = false
      return
    }

    if (this.noteBoard.mode === 'drag') {
      this.noteBoard.isDragging = false
      return
    }

    /** 笔刷绘制结束 */
    if (this.noteBoard.interaction.isBrushMode()) {
      this.noteBoard.isDrawing = false

      /** 在绘制结束时添加到历史记录 */
      if (this.noteBoard.currentBrush) {
        this.noteBoard.interaction.addShapesToHistory([this.noteBoard.currentBrush])
        this.noteBoard.currentBrush = null
      }
      return
    }

    /** 图形模式的鼠标离开处理 */
    if (this.noteBoard.interaction.isShapeMode()) {
      this.noteBoard.drawShape.handleMouseLeave()
      return
    }
  }

  onContextMenu = (e: MouseEvent) => {
    this.noteBoard.emit('contextMenu', e)
    if (this.noteBoard.noteBoardOpts.enableRightDrag !== false)
      e.preventDefault()
  }

  onWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (!this.noteBoard.isEnableZoom)
      return

    this.noteBoard.mousePoint = {
      x: e.offsetX,
      y: e.offsetY,
    }

    this.noteBoard.scale = e.deltaY > 0
      ? this.noteBoard.scale / 1.1
      : this.noteBoard.scale * 1.1

    this.noteBoard.scale = Math.min(
      Math.max(this.noteBoard.scale, this.noteBoard.noteBoardOpts.minScale),
      this.noteBoard.noteBoardOpts.maxScale,
    )
    this.noteBoard.setTransform()

    this.noteBoard.emit('wheel', {
      scale: this.noteBoard.scale,
      e,
    })
  }
}
