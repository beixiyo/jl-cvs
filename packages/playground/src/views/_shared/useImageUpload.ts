import { useCallback, useMemo, useState } from 'react'

/**
 * 图像工具页共用的单图上传状态
 *
 * 新版 Uploader 只回传 `File[]`，由调用方生成预览地址；
 * 这里统一转成 dataURL，便于直接传给 @jl-org/cvs 的图像 API
 */
export function useImageUpload() {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  /** Uploader onChange：取新批次第一张 */
  const onUpload = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setImgSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const clear = useCallback(() => {
    setImgSrc(null)
    setFileName(null)
  }, [])

  const previewImgs = useMemo(() => (imgSrc
    ? [imgSrc]
    : []), [imgSrc])

  return {
    imgSrc,
    fileName,
    /** 传给 Uploader 的预览列表 */
    previewImgs,
    onUpload,
    onRemove: clear,
    clear,
  }
}

/** 将 dataURL / objectURL 读为 Image 元素 */
export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
