import { useLatestCallback } from '@/hooks'
import { isValidFileType } from '@/utils'
import { getImg } from '@jl-org/tool'
import { useRef, useState } from 'react'
import type { UploaderProps } from '../types'

export function useGenState(
  {
    maxCount,
    maxSize,
    distinct,
    disabled,
    onChange,
    onExceedCount,
    onExceedSize,
    onExceedPixels,
    shouldFilterOut,
    onFiltered,
    accept = '',
    autoClear = true,
    maxPixels,
    previewImgs,
  }: UploaderProps,
) {
  const [dragActive, setDragActive] = useState(false)
  const [dragInvalid, setDragInvalid] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * 校验并处理文件
   * 用 useLatestCallback 保持引用稳定，始终读取最新 props
   */
  const handleFiles = useLatestCallback(async (fileList: File[]) => {
    const newImages: File[] = []
    const filteredOut: File[] = []
    const existingFiles = new Set<string>()
    const currentCount = previewImgs?.length || 0

    /**
     * 像素校验：提前对所有图片文件并行加载尺寸，避免在循环里串行 await 阻塞
     * 加载失败（img 为空）时不写入 map，后续按「放行」处理
     */
    const dimensionMap = new Map<File, { width: number; height: number }>()
    if (maxPixels) {
      const imageFiles = fileList.filter((file) => file.type.startsWith('image/'))
      await Promise.all(imageFiles.map(async (file) => {
        const src = URL.createObjectURL(file)
        try {
          const img = await getImg(src)
          if (img) {
            dimensionMap.set(file, { width: img.naturalWidth, height: img.naturalHeight })
          }
        }
        finally {
          URL.revokeObjectURL(src)
        }
      }))
    }

    for (const file of fileList) {
      if (!isValidFileType(file, accept)) continue

      if (maxCount && currentCount + newImages.length >= maxCount) {
        onExceedCount?.()
        break
      }

      if (maxSize && file.size > maxSize) {
        onExceedSize?.(file.size)
        continue
      }

      if (maxPixels && file.type.startsWith('image/')) {
        const dimension = dimensionMap.get(file)

        /** 加载失败（未写入 map）时不拦截，放行该文件 */
        if (dimension) {
          const { width: naturalWidth, height: naturalHeight } = dimension
          if (naturalWidth > maxPixels.width || naturalHeight > maxPixels.height) {
            onExceedPixels?.(naturalWidth, naturalHeight)
            continue
          }
        }
      }

      if (distinct) {
        const fileKey = `${file.name}-${file.size}-${file.type}`
        if (existingFiles.has(fileKey)) continue
        existingFiles.add(fileKey)
      }

      /** 自定义过滤：返回 true 表示该文件被过滤掉，不进入结果 */
      if (shouldFilterOut?.(file)) {
        filteredOut.push(file)
        continue
      }
      newImages.push(file)
    }

    if (newImages.length > 0) {
      onChange?.(newImages)
    }

    if (filteredOut.length > 0) {
      onFiltered?.(filteredOut)
    }

    /**
     * 选择后清空 input，使再次选择相同文件仍能触发 change
     * setTimeout 推到宏任务，避免在全部文件非法（无 await）时于 change 事件分发期间修改 value
     */
    if (autoClear) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      })
    }
  })

  const handleDrag = useLatestCallback((e: React.DragEvent<HTMLElement>) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)

      if (accept && e.dataTransfer.items.length > 0) {
        const items = Array.from(e.dataTransfer.items)
        const hasInvalidFile = items.some((item) => {
          if (item.kind === 'file') {
            const file = item.getAsFile()
            return file && !isValidFileType(file, accept)
          }
          return false
        })
        setDragInvalid(hasInvalidFile)
      }
      else {
        setDragInvalid(false)
      }
    }
    else if (e.type === 'dragleave') {
      const rect = e.currentTarget.getBoundingClientRect()
      const { clientX: x, clientY: y } = e

      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setDragActive(false)
        setDragInvalid(false)
      }
    }
  })

  const handleDrop = useLatestCallback((e: React.DragEvent<HTMLElement>) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragInvalid(false)

    if (e.dataTransfer.files?.length) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  })

  const handleChange = useLatestCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    if (e.target.files?.length) {
      handleFiles(Array.from(e.target.files))
    }
  })

  const handlePaste = useLatestCallback((e: React.ClipboardEvent<HTMLElement>) => {
    if (disabled) return

    const items = e.clipboardData.items
    if (!items) return

    const fileList: File[] = []
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        // oxlint-disable-next-line no-unused-expressions
        file && fileList.push(file)
      }
    }

    if (fileList.length > 0) {
      handleFiles(fileList)
    }
  })

  return {
    dragActive,
    dragInvalid,
    inputRef,
    handleDrag,
    handleDrop,
    handleChange,
    handlePaste,
  }
}
