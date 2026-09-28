import type { PartRequired } from '@/types'
import type { CaptureVideoFrameData } from '@/worker/captureVideoFrame'
import { blobToBase64, isFn, splitWorkerTask, type TransferType } from '@jl-org/tool'
import { createCvs } from './'
import { getCvsImg, type HandleImgReturn } from './handleImg'

/**
 * 截取视频某一帧图片，大于总时长则用最后一秒。
 * 如果浏览器支持 ImageCapture，则使用 Worker 截取帧，否则降级为截取 Canvas。
 * @param fileOrUrl 文件或者链接
 * @param time 时间，可以是数组
 * @param resType 返回类型
 */
export async function captureVideoFrame<
  N extends number | number[],
  T extends TransferType = 'base64',
>(
  fileOrUrl: File | string,
  time: N,
  resType: T = 'base64' as T,
  options: Options = {},
): Promise<
  N extends number ? HandleImgReturn<T>
    : HandleImgReturn<T>[]
> {
  type ReturnRes = Promise<
    N extends number ? HandleImgReturn<T>
      : HandleImgReturn<T>[]
  >

  const localObjectUrl = typeof fileOrUrl === 'string'
    ? undefined
    : URL.createObjectURL(fileOrUrl)
  const src = typeof fileOrUrl === 'string'
    ? fileOrUrl
    : localObjectUrl!
  const times = Array.isArray(time)
    ? time
    : [time]

  const opts: PartRequired<Options, 'mimeType' | 'quality'> = {
    mimeType: 'image/webp',
    quality: 0.5,
    ...options,
  }
  try {
    const data = await runWithMutWorker()
    if (data !== false) {
      return data
    }

    const resPromises = times.map((time) =>
      onVideoSeeked(
        time,
        (videoEl) => videoToCanvas(videoEl),
      )
    )

    return Promise.all(resPromises) as unknown as ReturnRes
  }
  finally {
    if (localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl)
    }
  }

  /***************************************************
   *                    Function
   ***************************************************/
  async function runWithMutWorker(): Promise<ReturnRes | false> {
    const workerJS =
      `self.onmessage=async function({data:n}){const e=[];for(const a of n)e.push(await c(a));self.postMessage(e,{transfer:e});async function c(a){const{imageBitmap:t,mimeType:o,quality:r}=a;try{const s=new OffscreenCanvas(t.width,t.height);s.getContext("2d").drawImage(t,0,0);const m=await s.convertToBlob({type:o,quality:r});return await m.arrayBuffer()}finally{t.close()}}};
`

    const isSupport = checkImageCaptureSupport()
    if (!isSupport) {
      console.error('不支持 ImageCapture，已降级为截取 canvas')
      return false
    }

    const workerURL = options.workerPath
      ? undefined
      : URL.createObjectURL(new Blob([workerJS], { type: 'text/javascript' }))
    let videoData: CaptureVideoFrameData[] = []

    try {
      const frameResults = await Promise.allSettled(
        times.map((time) => onVideoSeeked(time, genWorkerData)),
      )
      videoData = frameResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
      const rejectedFrame = frameResults.find(
        (result) => result.status === 'rejected',
      )
      if (rejectedFrame?.status === 'rejected') {
        throw rejectedFrame.reason
      }

      const data = await splitWorkerTask<
        CaptureVideoFrameData[],
        ArrayBuffer[],
        ArrayBuffer
      >({
        WorkerScript: options.workerPath || workerURL!,
        totalItems: times.length,
        async genSendMsg(st, et) {
          const data = videoData.slice(st, et)
          return Object.assign(data, {
            structuredSerializeOptions: {
              transfer: data.map((item) => item.imageBitmap),
            } satisfies StructuredSerializeOptions,
          })
        },
        onMessage(message, _workerInfo, callbacks) {
          callbacks.resolveBatch(message)
        },
      })

      const blobData = data.map((item: ArrayBuffer) => new Blob([item], { type: opts.mimeType }))
      if (resType === 'blob') {
        return blobData as unknown as ReturnRes
      }

      const base64s = await Promise.all(blobData.map((item) => blobToBase64(item)))
      return base64s as unknown as ReturnRes
    }
    finally {
      workerURL && URL.revokeObjectURL(workerURL)
      videoData.forEach((item) => {
        try {
          item.imageBitmap.close()
        }
        catch {
          /** 传输后的 ImageBitmap 已由 Worker 接管 */
        }
      })
    }
  }

  async function genWorkerData(video: HTMLVideoElement): Promise<CaptureVideoFrameData> {
    const stream = video.captureStream() as MediaStream
    const track = stream.getVideoTracks()[0]
    if (!track) {
      throw new Error('Video stream does not contain a video track')
    }

    try {
      const imageCapture = new ImageCapture(track)
      const imageBitmap = await imageCapture.grabFrame()

      return {
        imageBitmap,
        timestamp: video.currentTime,
        mimeType: opts.mimeType,
        quality: opts.quality,
      }
    }
    finally {
      track.stop()
    }
  }

  async function videoToCanvas(video: HTMLVideoElement) {
    const { ctx, cvs } = createCvs()
    let w: number,
      h: number

    if (options?.setSize) {
      const { width, height } = options.setSize(video)
      w = width
      h = height
    }
    else {
      w = video.videoWidth
      h = video.videoHeight
    }

    cvs.width = w
    cvs.height = h
    ctx.drawImage(video, 0, 0, cvs.width, cvs.height)

    return getCvsImg(
      cvs,
      resType,
      opts.mimeType,
      opts.quality,
    )
  }

  /**
   * 生成指定秒画面
   */
  async function onVideoSeeked<R = any>(
    time: number,
    cb: (video: HTMLVideoElement) => Promise<R>,
  ): Promise<R> {
    const video = document.createElement('video')
    video.muted = true
    video.crossOrigin = 'anonymous'
    video.preload = 'auto'

    Object.assign(video.style, {
      position: 'absolute',
      top: '-9999px',
      transform: 'translate(-9999px)',
    })
    return new Promise<R>((resolve, reject) => {
      let settled = false

      const cleanup = () => {
        video.pause()
        video.onloadedmetadata = null
        video.onloadeddata = null
        video.onseeked = null
        video.onerror = null
        video.removeAttribute('src')
        video.load()
        video.remove()
      }

      const capture = async () => {
        if (settled) return

        settled = true
        try {
          resolve(await cb(video))
        }
        catch (error) {
          reject(error)
        }
        finally {
          cleanup()
        }
      }

      video.onerror = () => {
        if (settled) return

        settled = true
        const error = video.error
          ? new Error(video.error.message)
          : new Error('Video load failed')
        cleanup()
        reject(error)
      }
      video.onloadedmetadata = () => {
        const maxTime = Number.isFinite(video.duration)
          ? Math.max(0, video.duration - 1)
          : Math.max(0, time)
        const targetTime = Math.min(Math.max(0, time), maxTime)

        if (targetTime === 0) {
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            void capture()
          }
          else {
            video.onloadeddata = () => void capture()
          }
          return
        }

        video.onseeked = () => void capture()
        video.currentTime = targetTime
      }

      document.body.appendChild(video)
      video.src = src
      video.load()
    })
  }
}

function checkImageCaptureSupport() {
  const video = document.createElement('video')
  if (
    typeof ImageCapture === 'undefined'
    || !isFn(video.captureStream)
  ) {
    return false
  }

  return true
}

type Options = {
  /**
   * 传入视频文件给你，你可以指定尺寸大小
   */
  setSize?: (video: HTMLVideoElement) => { width: number; height: number }
  mimeType?: string
  quality?: number
  /**
   * 指定 worker 路径，可以是路径，也可以是返回 worker 的函数
   */
  workerPath?: string | (new() => Worker)
}
