self.onmessage = async function ({ data }: MessageEvent<CaptureVideoFrameData[]>) {
  const res: ArrayBuffer[] = []

  for (const item of data) {
    const data = await getCaptureFrame(item)
    res.push(data)
  }

  self.postMessage(res, {
    transfer: res
  })

  async function getCaptureFrame(videoData: CaptureVideoFrameData) {
    const { imageBitmap, timestamp, mimeType, quality } = videoData
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
    const ctx = canvas.getContext('2d')!

    ctx.drawImage(imageBitmap, 0, 0)
    return new Promise<ArrayBuffer>((resolve, reject) => {
      canvas.convertToBlob({ type: mimeType, quality })
        .then(async (blob) => {
          const buffer = await blob.arrayBuffer()
          imageBitmap.close()
          resolve(buffer)
        })
        .catch(reject)
    })
  }
}

export type CaptureVideoFrameData = {
  mimeType: string
  quality: number
  imageBitmap: ImageBitmap
  timestamp: number
}
