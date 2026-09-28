/* eslint-disable no-restricted-globals */

self.onmessage = async function({ data }: MessageEvent<CaptureVideoFrameData[]>) {
  const res: ArrayBuffer[] = []

  for (const item of data) {
    const data = await getCaptureFrame(item)
    res.push(data)
  }

  self.postMessage(res, {
    transfer: res,
  })

  async function getCaptureFrame(videoData: CaptureVideoFrameData) {
    const { imageBitmap, mimeType, quality } = videoData

    try {
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(imageBitmap, 0, 0)
      const blob = await canvas.convertToBlob({ type: mimeType, quality })
      return await blob.arrayBuffer()
    }
    finally {
      imageBitmap.close()
    }
  }
}

export type CaptureVideoFrameData = {
  mimeType: string
  quality: number
  imageBitmap: ImageBitmap
  timestamp: number
}
