self.onmessage = async function ({ data }: MessageEvent<CaptureVideoFrameData[]>) {
  const res: CaptureFrameResult[] = []

  for (const item of data) {
    const data = await getCaptureFrame(item)
    res.push(data)
  }

  self.postMessage(res)

  async function getCaptureFrame(videoData: CaptureVideoFrameData) {
    const { imageBitmap, timestamp, mimeType, quality } = videoData
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
    const ctx = canvas.getContext('2d')!

    ctx.drawImage(imageBitmap, 0, 0)
    return new Promise<CaptureFrameResult>((resolve, reject) => {
      canvas.convertToBlob({ type: mimeType, quality })
        .then(blob => {
          const res: CaptureFrameResult = {
            blob,
            width: imageBitmap.width,
            height: imageBitmap.height,
            timestamp
          }
          imageBitmap.close()
          resolve(res)
        })
        .catch(reject)
    })
  }
}


export type CaptureFrameResult = {
  blob: Blob
  width: number
  height: number
  timestamp: number
}

export type CaptureVideoFrameData = {
  mimeType: string
  quality: number
  imageBitmap: ImageBitmap
  timestamp: number
}
