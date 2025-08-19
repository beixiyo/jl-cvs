import type { NoteBoard2, NoteBoardMode } from '@jl-org/cvs'
import { NoteBoard2 as NoteBoard2Class } from '@jl-org/cvs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BRUSH_COLOR, DEFAULT_STROKE_WIDTH } from '@/config'
import { onMounted, useGetState } from '@/hooks'
import { CANVAS_CONFIG, DEFAULT_IMAGE_URL, NOTE_BOARD_INIT_CONFIG } from '../constants'

export interface NoteBoardConfig {
  strokeStyle: string
  lineWidth: number
  lineCap: CanvasLineCap
}

export interface UseNoteBoard2Options {
  onMouseDown?: (e: MouseEvent) => void
  onMouseMove?: (e: MouseEvent) => void
  onMouseUp?: (e: MouseEvent) => void
  onWheel?: ({ scale, e }: { scale: number, e: WheelEvent }) => void
  onDrag?: ({ translateX, translateY }: { translateX: number, translateY: number }) => void
  onUndo?: (params: any) => void
  onRedo?: (params: any) => void
  onViewportChange?: (state: { pan: { x: number, y: number }, zoom: number }) => void
}

export function useNoteBoard2(options: UseNoteBoard2Options = {}) {
  const noteBoardRef = useRef<NoteBoard2>()
  const [currentMode, setCurrentMode] = useState<NoteBoardMode>('brush')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [viewportState, setViewportState] = useState({ pan: { x: 0, y: 0 }, zoom: 1 })

  const [config, setConfig] = useGetState<NoteBoardConfig, true>(
    {
      strokeStyle: BRUSH_COLOR,
      lineWidth: DEFAULT_STROKE_WIDTH,
      lineCap: 'round',
    },
    true,
  )

  const isFirstRender = useRef(true)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // ======================
  // * Functions
  // ======================

  const updateUndoRedoState = useCallback(() => {
    const board = noteBoardRef.current
    if (!board)
      return
    setCanUndo(board.canUndo())
    setCanRedo(board.canRedo())
  }, [])

  /** 同步画笔大小函数 */
  const syncBrushSize = useCallback((scale?: number, size?: number) => {
    const noteBoard = noteBoardRef.current
    if (!noteBoard)
      return

    if (scale !== undefined && scale > 1) {
      const lineWidth = setConfig.getLatest().lineWidth / scale
      noteBoard.setStyle({ lineWidth })
      noteBoard.setCursor()
      return
    }

    if (size !== undefined && size > 0) {
      noteBoard.setStyle({ lineWidth: size })
      noteBoard.setCursor()
      return
    }
  }, [setConfig])

  /** 切换模式 */
  const handleModeChange = (mode: NoteBoardMode) => {
    const noteBoard = noteBoardRef.current
    if (!noteBoard)
      return
    setCurrentMode(mode)
    noteBoard.setMode(mode)
  }

  /** 更新配置 */
  const updateConfig = (key: keyof NoteBoardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  /** 基础操作方法 */
  const actions = {
    undo: () => {
      noteBoardRef.current?.undo()
      updateUndoRedoState()
    },
    redo: () => {
      noteBoardRef.current?.redo()
      updateUndoRedoState()
    },
    clear: () => {
      noteBoardRef.current?.clear()
      noteBoardRef.current?.history.cleanAll() // 清除历史记录
      updateUndoRedoState()
    },
    resetSize: () => noteBoardRef.current?.resetSize(),
    exportImg: (options?: any) => noteBoardRef.current?.exportImg(options),
    exportMask: (options?: any) => noteBoardRef.current?.exportMask(options),
    exportAllLayer: (options?: any) => noteBoardRef.current?.exportAllLayer(options),
    drawImg: (src: string, options?: any) => {
      if (noteBoardRef.current) {
        noteBoardRef.current.clear(true)
        noteBoardRef.current.drawImg(src, {
          center: true,
          autoFit: true,
          needRecordImgInfo: true,
          ...options,
        })
      }
    },
    // NoteBoard2 特有的方法
    setZoom: (zoom: number, anchorPoint?: { x: number, y: number }) => {
      noteBoardRef.current?.setZoom(zoom, anchorPoint)
    },
    setPan: (pan: { x: number, y: number }) => {
      noteBoardRef.current?.setPan(pan)
    },
    getViewportState: () => {
      return noteBoardRef.current?.getViewportState()
    },
    setInfiniteCanvasEnabled: (enabled: boolean) => {
      noteBoardRef.current?.setInfiniteCanvasEnabled(enabled)
    },
    getVisibleWorldRect: () => {
      return noteBoardRef.current?.getVisibleWorldRect()
    },
    screenToWorld: (point: { x: number, y: number }) => {
      return noteBoardRef.current?.screenToWorld(point)
    },
    worldToScreen: (point: { x: number, y: number }) => {
      return noteBoardRef.current?.worldToScreen(point)
    },
  }

  /** 初始化画板 */
  onMounted(() => {
    if (!canvasContainerRef.current)
      return

    const board = new NoteBoard2Class({
      el: canvasContainerRef.current,
      width: CANVAS_CONFIG.width,
      height: CANVAS_CONFIG.height,
      strokeStyle: config.strokeStyle,
      lineWidth: config.lineWidth,
      lineCap: config.lineCap,
      ...NOTE_BOARD_INIT_CONFIG,
    })

    board.on('mouseDown', (e) => {
      options.onMouseDown?.(e)
    })
    board.on('mouseMove', (e) => {
      options.onMouseMove?.(e)
    })
    board.on('mouseUp', (e) => {
      options.onMouseUp?.(e)
      updateUndoRedoState()
    })
    board.on('wheel', (e) => {
      syncBrushSize(e.scale)
      setViewportState(board.getViewportState())
      options.onWheel?.(e)
      options.onViewportChange?.(board.getViewportState())
    })

    board.on('dragging', (e) => {
      setViewportState(board.getViewportState())
      options.onDrag?.(e)
      options.onViewportChange?.(board.getViewportState())
    })

    board.on('undo', (e) => {
      options.onUndo?.(e)
      updateUndoRedoState()
    })
    board.on('redo', (e) => {
      options.onRedo?.(e)
      updateUndoRedoState()
    })

    /** 首次渲染时加载默认图片 */
    if (isFirstRender.current) {
      board.drawImg(DEFAULT_IMAGE_URL, {
        center: true,
        autoFit: true,
      })
      isFirstRender.current = false
    }

    noteBoardRef.current = board

    return () => {
      board.dispose()
    }
  })

  /** 更新画板配置 */
  useEffect(() => {
    const noteBoard = noteBoardRef.current
    if (!noteBoard)
      return

    noteBoard.setStyle({
      strokeStyle: config.strokeStyle,
      lineWidth: config.lineWidth,
      lineCap: config.lineCap,
    })
  }, [config.lineCap, config.lineWidth, config.strokeStyle])

  /** 同步画笔大小 */
  useEffect(() => {
    syncBrushSize(undefined, config.lineWidth)
  }, [config.lineWidth, syncBrushSize])

  return {
    noteBoardRef,
    currentMode,
    canUndo,
    canRedo,
    config,
    viewportState,
    canvasContainerRef,
    handleModeChange,
    updateConfig,
    syncBrushSize,
    actions,
  }
}
