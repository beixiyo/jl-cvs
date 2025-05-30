self.onmessage = async function (e: MessageEvent<CaptureVideoFrameData>) {
  const res: CaptureFrameResult[] = []
  const {
    videoData,
    mimeType,
    quality
  } = e.data

  for (const item of videoData) {
    const data = await getCaptureFrame(item)
    res.push(data)
  }

  self.postMessage(res)

  async function getCaptureFrame(videoData: VideoData) {
    const { imageBitmap, timestamp } = videoData
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

export type VideoData = {
  imageBitmap: ImageBitmap
  timestamp: number
}

export type CaptureFrameResult = {
  blob: Blob
  width: number
  height: number
  timestamp: number
}

export type CaptureVideoFrameData = {
  videoData: VideoData[]
  mimeType: string
  quality: number
}
