import type { FileItem, UploaderProps } from '.'
import { blobToBase64, getImg } from '@jl-org/tool'
import { useRef, useState } from 'react'
import { isValidFileType } from '@/utils'

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
    accept = '',
    autoClear = false,
    maxPixels,
  }: UploaderProps,
) {
  const [dragActive, setDragActive] = useState(false)
  const [dragInvalid, setDragInvalid] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * @param fileList 文件列表
   */
  const handleFiles = async (fileList: File[], e: any) => {
    const newImages: FileItem[] = []
    const existingFiles = new Set<string>()

    for (const file of fileList) {
      /** 检查拖拽的文件类型 */
      if (!isValidFileType(file, accept)) {
        continue
      }

      /** 检查是否超出数量限制 */
      if (maxCount && newImages.length >= maxCount) {
        onExceedCount?.()
        break
      }

      /** 检查文件大小 */
      if (maxSize && file.size > maxSize) {
        onExceedSize?.(file.size)
        continue
      }

      /** 检测像素大小 */
      if (maxPixels && file.type.startsWith('image/')) {
        const src = URL.createObjectURL(file)
        const img = await getImg(src)
        URL.revokeObjectURL(src)
        if (!img)
          continue

        const { naturalWidth, naturalHeight } = img
        if (naturalWidth > maxPixels.width || naturalHeight > maxPixels.height) {
          onExceedPixels?.(naturalWidth, naturalHeight)
          continue
        }
      }

      /** 去重检查 */
      if (distinct) {
        const fileKey = `${file.name}-${file.size}-${file.type}`
        if (existingFiles.has(fileKey)) {
          continue
        }
        existingFiles.add(fileKey)
      }

      try {
        const base64 = await blobToBase64(file)
        newImages.push({ file, base64 })
      }
      catch (error) {
        console.error('Failed to convert file to base64:', error)
        continue
      }
    }

    if (newImages.length > 0) {
      onChange?.(newImages)
    }

    e.target.value = ''
    if (autoClear) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      })
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled)
      return
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)

      /** 检查拖拽的文件类型 */
      if (accept && e.dataTransfer.items.length > 0) {
        const files = Array.from(e.dataTransfer.items)
        const hasInvalidFile = files.some((item) => {
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
      /** 只有当鼠标真正离开容器时才重置状态 */
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY

      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setDragActive(false)
        setDragInvalid(false)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled)
      return
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragInvalid(false)

    if (e.dataTransfer.files?.[0]) {
      handleFiles(Array.from(e.dataTransfer.files), e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled)
      return
    e.preventDefault()

    if (e.target.files?.[0]) {
      handleFiles(Array.from(e.target.files), e)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled)
      return

    const items = e.clipboardData.items
    if (!items) {
      return
    }

    const fileList: File[] = []
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        file && fileList.push(file)
      }
    }

    fileList.length > 0 && handleFiles(fileList, e)
  }

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
