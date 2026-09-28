import { BRUSH_COLOR, DEFAULT_STROKE_WIDTH } from '@/config'
import { onMounted, useGetState, useLatestCallback } from '@/hooks'
import type { NoteBoardMode } from '@jl-org/cvs'
import { NoteBoard } from '@jl-org/cvs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CANVAS_CONFIG, DEFAULT_IMAGE_URL, NOTE_BOARD_INIT_CONFIG } from '../constants'

export interface NoteBoardConfig {
  strokeStyle: string
  lineWidth: number
  lineCap: CanvasLineCap
}

export function useNoteBoard() {
  const noteBoardRef = useRef<NoteBoard | undefined>(undefined)
  const [currentMode, setCurrentMode] = useState<NoteBoardMode>('brush')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

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
    if (!board) return
    setCanUndo(board.canUndo())
    setCanRedo(board.canRedo())
  }, [])

  /** 同步画笔大小函数 */
  const syncBrushSize = useCallback((zoom?: number, size?: number) => {
    const noteBoard = noteBoardRef.current
    if (!noteBoard) return

    if (zoom !== undefined && zoom > 1) {
      const lineWidth = setConfig.getLatest().lineWidth / zoom
      noteBoard.updateOptions({ lineWidth })
      noteBoard.setCursor()
      return
    }

    if (size !== undefined && size > 0) {
      noteBoard.updateOptions({ lineWidth: size })
      noteBoard.setCursor()
      return
    }
  }, [setConfig])

  /** 切换模式 */
  const handleModeChange = useLatestCallback((mode: NoteBoardMode) => {
    const noteBoard = noteBoardRef.current
    if (!noteBoard) return
    setCurrentMode(mode)
    noteBoard.setMode(mode)
  })

  /** 更新配置 */
  const updateConfig = useLatestCallback((key: keyof NoteBoardConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  })

  /** 基础操作方法 */
  const actions = {
    undo: useLatestCallback(() => {
      noteBoardRef.current?.undo()
      updateUndoRedoState()
    }),
    redo: useLatestCallback(() => {
      noteBoardRef.current?.redo()
      updateUndoRedoState()
    }),
    clear: useLatestCallback(() => {
      noteBoardRef.current?.clear()
      noteBoardRef.current?.history.cleanAll() // 清除历史记录
      updateUndoRedoState()
    }),
    resetSize: useLatestCallback(() => noteBoardRef.current?.resetSize()),
    exportImg: useLatestCallback((options?: any) => noteBoardRef.current?.exportImg(options)),
    exportMask: useLatestCallback((options?: any) => noteBoardRef.current?.exportMask(options)),
    exportAllLayer: useLatestCallback((options?: any) => noteBoardRef.current?.exportAllLayer(options)),
    drawImg: useLatestCallback((src: string, options?: any) => {
      if (noteBoardRef.current) {
        noteBoardRef.current.clear(true)
        noteBoardRef.current.drawImg(src, {
          center: true,
          autoFit: true,
          needRecordImgInfo: true,
          ...options,
        })
      }
    }),

    setZoom: useLatestCallback((zoom: number, anchorPoint?: { x: number; y: number }) => {
      noteBoardRef.current?.setZoom(zoom, anchorPoint)
    }),
    setPan: useLatestCallback((pan: { x: number; y: number }) => {
      noteBoardRef.current?.setPan(pan)
    }),
    getViewportState: useLatestCallback(() => {
      return noteBoardRef.current?.getViewportState()
    }),
    getVisibleWorldRect: useLatestCallback(() => {
      return noteBoardRef.current?.getVisibleWorldRect()
    }),
    screenToWorld: useLatestCallback((point: { x: number; y: number }) => {
      return noteBoardRef.current?.screenToWorld(point)
    }),
    worldToScreen: useLatestCallback((point: { x: number; y: number }) => {
      return noteBoardRef.current?.worldToScreen(point)
    }),
  }

  /** 初始化画板 */
  onMounted(() => {
    if (!canvasContainerRef.current) return

    const board = new NoteBoard({
      el: canvasContainerRef.current,
      width: CANVAS_CONFIG.width,
      height: CANVAS_CONFIG.height,
      strokeStyle: config.strokeStyle,
      lineWidth: config.lineWidth,
      lineCap: config.lineCap,
      ...NOTE_BOARD_INIT_CONFIG,
    })

    board.on('wheel', (e) => {
      syncBrushSize(e.zoom)
    })

    board.on('undo', () => {
      updateUndoRedoState()
    })
    board.on('redo', () => {
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
    if (!noteBoard) return

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
    canvasContainerRef,
    handleModeChange,
    updateConfig,
    syncBrushSize,
    actions,
  }
}
