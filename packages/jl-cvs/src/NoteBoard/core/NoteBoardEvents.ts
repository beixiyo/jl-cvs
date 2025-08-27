import type { NoteBoard } from '../NoteBoard'
import { Brush } from '@/Shapes'

export class NoteBoardEvents {
  constructor(private readonly noteBoard: NoteBoard) { }

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
    const { noteBoard } = this
    noteBoard.emit('mouseDown', e)
    noteBoard.renderer.setCursorForCurrentMode()

    /** 拖拽模式 */
    if (noteBoard.mode === 'drag') {
      noteBoard.isDragging = true
      noteBoard.dragStart = { x: e.offsetX, y: e.offsetY }
      return
    }

    /** 右键拖拽判断 */
    if (e.button === 2 && noteBoard.noteBoardOpts.enableRightDrag !== false) {
      e.preventDefault()
      noteBoard.isDragging = true
      noteBoard.rightMouseDragging = true
      noteBoard.dragStart = { x: e.offsetX, y: e.offsetY }
      noteBoard.canvas.style.cursor = 'grabbing'
      return
    }

    /** 笔刷模式 */
    if (noteBoard.interaction.isBrushMode()) {
      noteBoard.isDrawing = true

      const worldPoint = noteBoard.screenToWorld({ x: e.offsetX, y: e.offsetY })
      noteBoard.currentBrush = new Brush({
        startX: worldPoint.x,
        startY: worldPoint.y,
        ctx: noteBoard.ctx,
        shapeStyle: {
          strokeStyle: noteBoard.noteBoardOpts.strokeStyle,
          lineWidth: noteBoard.noteBoardOpts.lineWidth,
        },
      })

      noteBoard.drawStart = {
        x: worldPoint.x,
        y: worldPoint.y,
      }
      return
    }

    /** 图形模式由 DrawShape 处理 */
    if (noteBoard.interaction.isShapeMode()) {
      const transformedEvent = this.transformMouseEventForDrawShape(e)
      noteBoard.drawShape.handleMouseDown(transformedEvent)
      return
    }
  }

  onMousemove = (e: MouseEvent) => {
    const { noteBoard } = this
    noteBoard.emit('mouseMove', e)

    if (noteBoard.isDragging) {
      const dx = e.offsetX - noteBoard.dragStart.x
      const dy = e.offsetY - noteBoard.dragStart.y

      const currentZoom = noteBoard.viewport.getState().zoom
      /** 注意：拖拽方向与平移方向相反 */
      noteBoard.viewport.panBy(-dx / currentZoom, -dy / currentZoom)
      noteBoard.dragStart = { x: e.offsetX, y: e.offsetY }

      const state = noteBoard.viewport.getState()
      noteBoard.emit('dragging', {
        translateX: state.pan.x,
        translateY: state.pan.y,
        transformOriginX: noteBoard.mousePoint.x,
        transformOriginY: noteBoard.mousePoint.y,
        e,
      })
      return
    }

    if (noteBoard.isDrawing && noteBoard.interaction.isBrushMode()) {
      if (!noteBoard.currentBrush)
        return

      const worldPoint = noteBoard.screenToWorld({ x: e.offsetX, y: e.offsetY })
      const points = noteBoard.currentBrush.getPoints()
      const lastPoint = points[points.length - 1]

      noteBoard.currentBrush.addPoint(worldPoint.x, worldPoint.y)
      noteBoard.renderer.drawCurrentSegment(
        lastPoint?.x || worldPoint.x,
        lastPoint?.y || worldPoint.y,
        worldPoint.x,
        worldPoint.y,
      )
      return
    }

    /** 图形模式的鼠标移动处理 */
    if (noteBoard.interaction.isShapeMode()) {
      const transformedEvent = this.transformMouseEventForDrawShape(e)
      noteBoard.drawShape.handleMouseMove(transformedEvent)
      return
    }
  }

  onMouseup = (e: MouseEvent) => {
    const { noteBoard } = this
    noteBoard.emit('mouseUp', e)

    /** 结束拖拽 */
    if (noteBoard.isDragging) {
      noteBoard.isDragging = false
      noteBoard.rightMouseDragging = false
      noteBoard.renderer.setCursorForCurrentMode()
      return
    }

    /** 结束笔刷绘制 */
    if (noteBoard.isDrawing && noteBoard.interaction.isBrushMode()) {
      noteBoard.isDrawing = false

      if (noteBoard.currentBrush) {
        noteBoard.interaction.addShapesToHistory([noteBoard.currentBrush])
        noteBoard.currentBrush = null
      }
      return
    }

    /** 图形模式的鼠标抬起处理 */
    if (noteBoard.interaction.isShapeMode()) {
      noteBoard.drawShape.handleMouseUp()
      return
    }
  }

  onMouseLeave = (e: MouseEvent) => {
    const { noteBoard } = this
    noteBoard.emit('mouseLeave', e)

    /** 结束拖拽 */
    if (noteBoard.isDragging) {
      noteBoard.isDragging = false
      noteBoard.rightMouseDragging = false
      noteBoard.renderer.setCursorForCurrentMode()
    }

    /** 结束笔刷绘制 */
    if (noteBoard.isDrawing && noteBoard.interaction.isBrushMode()) {
      noteBoard.isDrawing = false
      if (noteBoard.currentBrush) {
        noteBoard.interaction.addShapesToHistory([noteBoard.currentBrush])
        noteBoard.currentBrush = null
      }
    }

    /** 图形模式的鼠标离开处理 */
    if (noteBoard.interaction.isShapeMode()) {
      noteBoard.drawShape.handleMouseLeave()
    }
  }

  onWheel = (e: WheelEvent) => {
    const { noteBoard } = this
    e.preventDefault()
    if (!noteBoard.isEnableZoom) {
      return
    }

    const zoomDelta = e.deltaY > 0
      ? 0.9
      : 1.1
    const currentZoom = noteBoard.viewport.getState().zoom
    const newZoom = currentZoom * zoomDelta

    const anchorScreenPoint = { x: e.offsetX, y: e.offsetY }
    noteBoard.setZoom(newZoom, anchorScreenPoint)

    noteBoard.emit('wheel', {
      zoom: newZoom,
      e,
    })
  }

  onContextMenu = (e: MouseEvent) => {
    const { noteBoard } = this
    if (noteBoard.noteBoardOpts.enableRightDrag) {
      e.preventDefault()
      noteBoard.emit('contextMenu', e)
    }
  }

  /**
   * 为 DrawShape 转换鼠标事件坐标
   * 将屏幕坐标转换为世界坐标，让 DrawShape 以为在普通画布上工作
   */
  private transformMouseEventForDrawShape(e: MouseEvent): MouseEvent {
    const { noteBoard } = this
    /** 将屏幕坐标转换为世界坐标 */
    const worldPoint = noteBoard.screenToWorld({ x: e.offsetX, y: e.offsetY })

    /** 创建一个新的事件对象，修改 offsetX 和 offsetY 为世界坐标 */
    const transformedEvent = new MouseEvent(e.type, {
      bubbles: e.bubbles,
      cancelable: e.cancelable,
      view: e.view,
      detail: e.detail,
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey,
      button: e.button,
      buttons: e.buttons,
      relatedTarget: e.relatedTarget,
    })

    /** 设置 offsetX 为世界坐标 */
    Object.defineProperty(transformedEvent, 'offsetX', {
      value: worldPoint.x,
      writable: false,
      enumerable: true,
      configurable: true,
    })

    /** 设置 offsetY 为世界坐标 */
    Object.defineProperty(transformedEvent, 'offsetY', {
      value: worldPoint.y,
      writable: false,
      enumerable: true,
      configurable: true,
    })

    return transformedEvent
  }
}
