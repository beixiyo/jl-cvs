import type { NoteBoardOptions } from './type'
import type { Point } from '@/Canvas/types'
import { Brush, ImageShape } from '@/Shapes'
import { NoteBoard } from './NoteBoard'
import { NoteBoard2Viewport } from './NoteBoard2Viewport'

/**
 * NoteBoard2 - 无限画布版本
 *
 * 基于 NoteBoard 的优秀架构，升级为使用 Canvas API 实现的真正无限画布。
 * 主要改进：
 * 1. 使用世界坐标系统替代 CSS transform
 * 2. 实现鼠标中心缩放
 * 3. 支持真正的无限平移和缩放
 * 4. 保持所有现有功能和 API 兼容性
 */
export class NoteBoard2 extends NoteBoard {
  /** 视口管理器 */
  private viewport: NoteBoard2Viewport

  /** 是否启用无限画布模式 */
  private infiniteCanvasEnabled = true

  constructor(opts: NoteBoardOptions) {
    super(opts)

    /** 初始化视口管理器 */
    this.viewport = new NoteBoard2Viewport({
      pan: { x: 0, y: 0 },
      zoom: 1,
      minZoom: opts.minScale || 0.1,
      maxZoom: opts.maxScale || 10,
      onViewportChange: (state) => {
        /** 视口变化时触发重绘和光标更新 */
        if (this.infiniteCanvasEnabled) {
          this.requestRender()
          this.updateCursorForZoom()
        }
      },
    })

    /** 重新绑定事件以支持无限画布 */
    this.setupInfiniteCanvasEvents()
  }

  /**
   * 重写撤销方法以支持无限画布
   */
  undo() {
    const recordPath = this.history.undo()
    if (!recordPath?.value) {
      this.clear(false)
      this.emit('undo', {
        mode: this.mode,
        shapes: [],
      })
      return
    }

    /** 重绘所有内容 */
    if (this.infiniteCanvasEnabled) {
      this.redrawAllWithWorldTransform()
    }
    else {
      this.renderer.redrawAll()
    }

    this.emit('undo', {
      mode: this.mode,
      shapes: this.interaction.getAllShapes(),
    })
  }

  /**
   * 重写重做方法以支持无限画布
   */
  redo() {
    const recordPath = this.history.redo()
    if (!recordPath?.value) {
      return
    }

    /** 重绘所有内容 */
    if (this.infiniteCanvasEnabled) {
      this.redrawAllWithWorldTransform()
    }
    else {
      this.renderer.redrawAll()
    }

    this.emit('redo', {
      mode: this.mode,
      shapes: this.interaction.getAllShapes(),
    })
  }

  /**
   * 重写 setTransform 方法
   * 使用 Canvas API 的世界坐标变换替代 CSS transform
   */
  async setTransform(callback?: (styles: {
    transform: string
    transformOrigin: string
  }) => void): Promise<void> {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，回退到原始实现 */
      return super.setTransform(callback)
    }

    /** 在无限画布模式下，变换已经在渲染时应用，这里只需要触发重绘 */
    this.requestRender()

    /** 为了兼容性，仍然调用回调（但实际不使用 CSS transform） */
    if (callback) {
      const state = this.viewport.getState()
      callback({
        transform: `scale(${state.zoom}) translate(${state.pan.x}px, ${state.pan.y}px)`,
        transformOrigin: '0 0',
      })
    }
  }

  /**
   * 重写 resetSize 方法
   * 重置画布变换状态
   */
  async resetSize(): Promise<void> {
    if (!this.infiniteCanvasEnabled) {
      return super.resetSize()
    }

    /** 重置所有画布的变换矩阵 */
    this.canvasList.forEach((item) => {
      this.viewport.resetTransform(item.ctx, NoteBoard2.dpr)
    })
  }

  /**
   * 屏幕坐标转世界坐标
   * @param screenPoint 屏幕坐标点
   * @returns 世界坐标点
   */
  screenToWorld(screenPoint: Point): Point {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，返回原始坐标 */
      return screenPoint
    }
    return this.viewport.screenToWorld(screenPoint)
  }

  /**
   * 世界坐标转屏幕坐标
   * @param worldPoint 世界坐标点
   * @returns 屏幕坐标点
   */
  worldToScreen(worldPoint: Point): Point {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，返回原始坐标 */
      return worldPoint
    }
    return this.viewport.worldToScreen(worldPoint)
  }

  /**
   * 获取视口状态
   */
  getViewportState() {
    return this.viewport.getState()
  }

  /**
   * 设置视口状态
   * @param state 新的视口状态
   */
  setViewportState(state: Partial<{ pan: Point, zoom: number }>) {
    this.viewport.setState(state)
  }

  /**
   * 设置缩放级别（支持锚点缩放）
   * @param zoom 新的缩放级别
   * @param anchorScreenPoint 可选的屏幕坐标锚点
   */
  setZoom(zoom: number, anchorScreenPoint?: Point) {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，回退到原始缩放逻辑 */
      this.scale = Math.min(Math.max(zoom, this.noteBoardOpts.minScale), this.noteBoardOpts.maxScale)
      return this.setTransform()
    }

    let anchorWorldPoint: Point | undefined
    if (anchorScreenPoint) {
      /** 将屏幕坐标锚点转换为世界坐标 */
      anchorWorldPoint = this.viewport.screenToWorld(anchorScreenPoint)
    }

    this.viewport.setZoom(zoom, anchorWorldPoint)
  }

  /**
   * 设置平移偏移
   * @param pan 新的平移偏移
   */
  setPan(pan: Point) {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，回退到原始平移逻辑 */
      this.translateX = pan.x
      this.translateY = pan.y
      return this.setTransform()
    }

    this.viewport.setPan(pan)
  }

  /**
   * 增量平移
   * @param delta 平移增量
   */
  addPan(delta: Point) {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，回退到原始平移逻辑 */
      this.translateX += delta.x
      this.translateY += delta.y
      return this.setTransform()
    }

    this.viewport.addPan(delta)
  }

  /**
   * 启用/禁用无限画布模式
   * @param enabled 是否启用
   */
  setInfiniteCanvasEnabled(enabled: boolean) {
    this.infiniteCanvasEnabled = enabled

    if (enabled) {
      /** 启用时，将当前的 CSS transform 状态同步到视口 */
      this.viewport.setState({
        pan: { x: this.translateX, y: this.translateY },
        zoom: this.scale,
      })
    }
    else {
      /** 禁用时，将视口状态同步到 CSS transform */
      const state = this.viewport.getState()
      this.translateX = state.pan.x
      this.translateY = state.pan.y
      this.scale = state.zoom
    }

    this.setTransform()
  }

  /**
   * 请求重新渲染
   * 在视口变化时触发重绘
   */
  private requestRender() {
    /** 使用 requestAnimationFrame 优化渲染性能 */
    requestAnimationFrame(() => {
      if (this.infiniteCanvasEnabled) {
        this.redrawAllWithWorldTransform()
      }
      else {
        this.renderer.redrawAll()
      }
    })
  }

  /**
   * 使用世界坐标变换重绘所有内容
   */
  private redrawAllWithWorldTransform() {
    /** 先重置变换矩阵，然后清屏 */
    this.canvasList.forEach((item) => {
      this.viewport.resetTransform(item.ctx, NoteBoard2.dpr)
    })
    this.clear(false)

    /** 应用世界坐标变换 */
    this.canvasList.forEach((item) => {
      this.viewport.applyTransform(item.ctx, NoteBoard2.dpr)
    })

    const lastRecord = this.history.curValue
    if (!lastRecord) {
      return
    }

    /** 按记录顺序绘制所有内容 */
    for (const record of lastRecord) {
      /** 设置绘制样式 */
      this.setStyle(record.canvasAttrs, this.ctx)

      /** 设置混合模式 */
      if (record.mode === 'erase') {
        this.ctx.globalCompositeOperation = 'destination-out'
      }
      else if (this.interaction.isShapeMode(record.mode)) {
        this.ctx.globalCompositeOperation = this.noteBoardOpts.shapeGlobalCompositeOperation
      }
      else {
        this.ctx.globalCompositeOperation = this.noteBoardOpts.drawGlobalCompositeOperation
      }

      /** 绘制所有图形 */
      for (const shape of record.shapes) {
        /** 如果是 ImageShape 且还没加载，设置加载完成后的重绘回调 */
        if (shape.name === 'imageShape' && shape instanceof ImageShape) {
          if (shape.loadState === 'loading' && !shape.onLoadCallback) {
            shape.onLoadCallback = () => {
              this.requestRender()
            }
          }
        }
        shape.draw(this.ctx)
      }
    }

    /** 恢复当前模式的样式 */
    this.setMode(this.mode)
  }

  /**
   * 设置无限画布的事件处理
   */
  private setupInfiniteCanvasEvents() {
    /** 先移除原有事件绑定 */
    this.events.rmEvent()

    /** 重新绑定事件，但使用我们自定义的处理器 */
    this.bindInfiniteCanvasEvents()
  }

  /**
   * 绑定无限画布专用的事件处理器
   */
  private bindInfiniteCanvasEvents() {
    const { canvas } = this

    canvas.addEventListener('mousedown', this.onInfiniteCanvasMousedown)
    canvas.addEventListener('mousemove', this.onInfiniteCanvasMousemove)
    canvas.addEventListener('mouseup', this.onInfiniteCanvasMouseup)
    canvas.addEventListener('mouseleave', this.onInfiniteCanvasMouseLeave)
    canvas.addEventListener('wheel', this.onInfiniteCanvasWheel)
    canvas.addEventListener('contextmenu', this.onInfiniteCanvasContextMenu)
  }

  /**
   * 移除无限画布事件绑定
   */
  private rmInfiniteCanvasEvents() {
    const { canvas } = this

    canvas.removeEventListener('mousedown', this.onInfiniteCanvasMousedown)
    canvas.removeEventListener('mousemove', this.onInfiniteCanvasMousemove)
    canvas.removeEventListener('mouseup', this.onInfiniteCanvasMouseup)
    canvas.removeEventListener('mouseleave', this.onInfiniteCanvasMouseLeave)
    canvas.removeEventListener('wheel', this.onInfiniteCanvasWheel)
    canvas.removeEventListener('contextmenu', this.onInfiniteCanvasContextMenu)
  }

  /**
   * 无限画布鼠标按下事件处理
   */
  private onInfiniteCanvasMousedown = (e: MouseEvent) => {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，使用原始处理 */
      return this.events.onMousedown(e)
    }

    this.emit('mouseDown', e)
    this.renderer.setCursorForCurrentMode()

    /** 拖拽模式 */
    if (this.mode === 'drag') {
      this.isDragging = true
      this.dragStart = { x: e.offsetX, y: e.offsetY }
      return
    }

    /** 右键拖拽判断 */
    if (e.button === 2 && this.noteBoardOpts.enableRightDrag !== false) {
      e.preventDefault()
      this.isDragging = true
      this.rightMouseDragging = true
      this.dragStart = { x: e.offsetX, y: e.offsetY }
      this.canvas.style.cursor = 'grabbing'
      return
    }

    /** 笔刷模式 */
    if (this.interaction.isBrushMode()) {
      this.isDrawing = true

      /** 在无限画布模式下，使用世界坐标创建笔刷 */
      const worldPoint = this.screenToWorld({ x: e.offsetX, y: e.offsetY })
      this.currentBrush = new Brush({
        startX: worldPoint.x,
        startY: worldPoint.y,
        ctx: this.ctx,
        shapeStyle: {
          strokeStyle: this.noteBoardOpts.strokeStyle,
          lineWidth: this.noteBoardOpts.lineWidth,
        },
      })

      this.drawStart = {
        x: worldPoint.x,
        y: worldPoint.y,
      }
      return
    }

    /** 图形模式由 DrawShape 处理 */
    if (this.interaction.isShapeMode()) {
      /** 在无限画布模式下，需要转换坐标后再传递给 DrawShape */
      const transformedEvent = this.transformMouseEventForDrawShape(e)
      this.drawShape.handleMouseDown(transformedEvent)
      return
    }
  }

  /**
   * 无限画布鼠标移动事件处理
   */
  private onInfiniteCanvasMousemove = (e: MouseEvent) => {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，使用原始处理 */
      return this.events.onMousemove(e)
    }

    this.emit('mouseMove', e)

    /** 拖拽处理 */
    if (this.isDragging) {
      const dx = e.offsetX - this.dragStart.x
      const dy = e.offsetY - this.dragStart.y

      /**
       * 在无限画布模式下，使用视口的增量平移
       * 注意：拖拽方向与平移方向相反，与 Canvas InteractionManager 保持一致
       */
      const currentZoom = this.viewport.getState().zoom
      this.viewport.panBy(-dx / currentZoom, -dy / currentZoom)

      /** 更新拖拽起点 */
      this.dragStart = { x: e.offsetX, y: e.offsetY }

      const state = this.viewport.getState()
      this.emit('dragging', {
        translateX: state.pan.x,
        translateY: state.pan.y,
        transformOriginX: this.mousePoint.x,
        transformOriginY: this.mousePoint.y,
        e,
      })
      return
    }

    /** 其他鼠标移动处理保持原样 */
    if (this.isDrawing && this.interaction.isBrushMode()) {
      if (!this.currentBrush)
        return

      /** 在无限画布模式下，需要转换坐标 */
      const worldPoint = this.screenToWorld({ x: e.offsetX, y: e.offsetY })
      const points = this.currentBrush.getPoints()
      const lastPoint = points[points.length - 1]

      this.currentBrush.addPoint(worldPoint.x, worldPoint.y)
      this.renderer.drawCurrentSegment(
        lastPoint?.x || worldPoint.x,
        lastPoint?.y || worldPoint.y,
        worldPoint.x,
        worldPoint.y,
      )
      return
    }

    /** 图形模式的鼠标移动处理 */
    if (this.interaction.isShapeMode()) {
      /** 在无限画布模式下，需要转换坐标后再传递给 DrawShape */
      const transformedEvent = this.transformMouseEventForDrawShape(e)
      this.drawShape.handleMouseMove(transformedEvent)
      return
    }
  }

  /**
   * 无限画布鼠标抬起事件处理
   */
  private onInfiniteCanvasMouseup = (e: MouseEvent) => {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，使用原始处理 */
      return this.events.onMouseup(e)
    }

    this.emit('mouseUp', e)

    /** 结束拖拽 */
    if (this.isDragging) {
      this.isDragging = false
      this.rightMouseDragging = false
      this.renderer.setCursorForCurrentMode()
      return
    }

    /** 结束笔刷绘制 */
    if (this.isDrawing && this.interaction.isBrushMode()) {
      this.isDrawing = false

      if (this.currentBrush) {
        /** 将笔刷添加到历史记录 */
        this.interaction.addShapesToHistory([this.currentBrush])
        this.currentBrush = null
      }
      return
    }

    /** 图形模式的鼠标抬起处理 */
    if (this.interaction.isShapeMode()) {
      /** 在无限画布模式下，需要转换坐标后再传递给 DrawShape */
      // const transformedEvent = this.transformMouseEventForDrawShape(e)
      this.drawShape.handleMouseUp()
      return
    }
  }

  /**
   * 无限画布鼠标离开事件处理
   */
  private onInfiniteCanvasMouseLeave = (e: MouseEvent) => {
    if (!this.infiniteCanvasEnabled) {
      return this.events.onMouseLeave(e)
    }

    /** 鼠标离开时结束拖拽 */
    if (this.isDragging) {
      this.isDragging = false
      this.rightMouseDragging = false
      this.renderer.setCursorForCurrentMode()
    }

    /** 结束绘制 */
    if (this.isDrawing && this.interaction.isBrushMode()) {
      this.isDrawing = false
      if (this.currentBrush) {
        this.interaction.addShapesToHistory([this.currentBrush])
        this.currentBrush = null
      }
    }

    /** 处理图形模式的鼠标离开 */
    if (this.interaction.isShapeMode()) {
      this.drawShape.handleMouseLeave()
    }
  }

  /**
   * 无限画布滚轮事件处理
   */
  private onInfiniteCanvasWheel = (e: WheelEvent) => {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，使用原始滚轮处理 */
      return this.events.onWheel(e)
    }

    e.preventDefault()
    if (!this.isEnableZoom)
      return

    /** 计算缩放增量 */
    const zoomDelta = e.deltaY > 0
      ? 0.9
      : 1.1
    const currentZoom = this.viewport.getState().zoom
    const newZoom = currentZoom * zoomDelta

    /** 以鼠标位置为锚点进行缩放 */
    const anchorScreenPoint = { x: e.offsetX, y: e.offsetY }
    this.setZoom(newZoom, anchorScreenPoint)

    /** 触发原始的滚轮事件（用于兼容性） */
    this.emit('wheel', {
      scale: newZoom,
      e,
    })
  }

  /**
   * 无限画布右键菜单事件处理
   */
  private onInfiniteCanvasContextMenu = (e: MouseEvent) => {
    if (!this.infiniteCanvasEnabled) {
      return this.events.onContextMenu(e)
    }

    /** 如果启用了右键拖拽，阻止默认右键菜单 */
    if (this.noteBoardOpts.enableRightDrag !== false) {
      e.preventDefault()
    }
  }

  /**
   * 获取可见的世界坐标区域
   */
  getVisibleWorldRect() {
    if (!this.infiniteCanvasEnabled) {
      return {
        x: 0,
        y: 0,
        width: this.canvas.width / NoteBoard2.dpr,
        height: this.canvas.height / NoteBoard2.dpr,
      }
    }

    return this.viewport.getVisibleWorldRect({
      width: this.canvas.width / NoteBoard2.dpr,
      height: this.canvas.height / NoteBoard2.dpr,
    })
  }

  /**
   * 获取缩放范围
   */
  getZoomRange() {
    return this.viewport.getZoomRange()
  }

  /**
   * 重写事件绑定方法
   */
  rmEvent(): void {
    if (this.infiniteCanvasEnabled) {
      this.rmInfiniteCanvasEvents()
    }
    else {
      super.rmEvent()
    }
  }

  bindEvent(): void {
    if (this.infiniteCanvasEnabled) {
      this.bindInfiniteCanvasEvents()
    }
    else {
      super.bindEvent()
    }
  }

  /**
   * 为 DrawShape 转换鼠标事件坐标
   * 将屏幕坐标转换为世界坐标，让 DrawShape 以为在普通画布上工作
   */
  private transformMouseEventForDrawShape(e: MouseEvent): MouseEvent {
    if (!this.infiniteCanvasEnabled) {
      return e
    }

    /** 将屏幕坐标转换为世界坐标 */
    const worldPoint = this.screenToWorld({ x: e.offsetX, y: e.offsetY })

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

    /**
     * 手动设置 offsetX 和 offsetY 为世界坐标
     * 注意：这些属性是只读的，我们需要使用 Object.defineProperty
     */
    Object.defineProperty(transformedEvent, 'offsetX', {
      value: worldPoint.x,
      writable: false,
      enumerable: true,
      configurable: true,
    })

    Object.defineProperty(transformedEvent, 'offsetY', {
      value: worldPoint.y,
      writable: false,
      enumerable: true,
      configurable: true,
    })

    return transformedEvent
  }

  /**
   * 重写 setCursor 方法以支持缩放同步
   * 在无限画布模式下，笔刷光标大小会根据当前缩放级别自动调整
   */
  setCursor(lineWidth?: number, strokeStyle?: string) {
    if (!this.infiniteCanvasEnabled) {
      /** 如果禁用无限画布，使用原始实现 */
      return super.setCursor(lineWidth, strokeStyle)
    }

    /** 在无限画布模式下，根据缩放级别调整光标大小 */
    const currentZoom = this.viewport.getState().zoom
    const actualLineWidth = lineWidth || this.noteBoardOpts.lineWidth
    const actualStrokeStyle = strokeStyle || this.noteBoardOpts.strokeStyle

    /** 将世界坐标的线宽转换为屏幕坐标的光标大小 */
    let scaledCursorSize = actualLineWidth * currentZoom

    /** 设置最小和最大光标大小，确保光标始终可见且不会过大 */
    const minCursorSize = 4 // 最小 4px
    const maxCursorSize = 100 // 最大 100px
    scaledCursorSize = Math.max(minCursorSize, Math.min(maxCursorSize, scaledCursorSize))

    /** 调用父类方法，但使用缩放后的大小 */
    return super.setCursor(scaledCursorSize, actualStrokeStyle)
  }

  /**
   * 重写 setMode 方法以支持缩放同步光标
   */
  setMode(mode: any) {
    /** 调用父类的 setMode 方法 */
    super.setMode(mode)

    /** 在无限画布模式下，模式切换后更新光标 */
    if (this.infiniteCanvasEnabled) {
      this.updateCursorForZoom()
    }
  }

  /**
   * 当视口状态改变时，更新光标大小
   * 这个方法会在缩放时自动调用
   */
  private updateCursorForZoom() {
    /** 只在笔刷或擦除模式下更新光标 */
    if (this.interaction.isBrushMode()) {
      this.setCursor()
    }
  }

  /**
   * 清理资源
   */
  dispose(opts?: any) {
    /** 先清理无限画布事件 */
    if (this.infiniteCanvasEnabled) {
      this.rmInfiniteCanvasEvents()
    }

    super.dispose(opts)
    /** 清理视口相关资源 */
  }
}
