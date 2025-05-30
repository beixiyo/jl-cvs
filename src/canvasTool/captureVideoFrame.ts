import { blobToBase64, isFn, splitWorkerTask, type TransferType } from '@jl-org/tool'
import { getCvsImg, type HandleImgReturn } from './handleImg'
import { createCvs } from './'
import type { CaptureVideoFrameData } from '@/worker/captureVideoFrame'
import type { PartRequired } from '@jl-org/ts-tool'


/**
 * 截取视频某一帧图片，大于总时长则用最后一秒。
 * 如果传入 workerPath 并且支持 ImageCapture，则使用 Worker 截取帧，否则降级为截取 Canvas。
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
  options: Options = {}
): Promise<N extends number
  ? HandleImgReturn<T>
  : HandleImgReturn<T>[]
> {
  type ReturnRes = Promise<N extends number
    ? HandleImgReturn<T>
    : HandleImgReturn<T>[]
  >

  const src = getUrl()
  const times = (Array.isArray(time)
    ? time
    : [time])

  const opts: PartRequired<Options, 'mimeType' | 'quality'> = {
    mimeType: 'image/webp',
    quality: 0.5,
    ...options,
  }

  const data = await runWithMutWorker()
  if (data !== false) {
    return data
  }

  const { ctx, cvs } = createCvs()
  const resPromises = times.map((time) => onVideoSeeked(
    time,
    videoEl => videoToCanvas(videoEl)
  ))

  return Promise.all(resPromises) as unknown as ReturnRes


  /***************************************************
   *                    Function
   ***************************************************/
  function getUrl() {
    return typeof fileOrUrl === 'string'
      ? fileOrUrl
      : URL.createObjectURL(fileOrUrl)
  }

  async function runWithMutWorker(): Promise<ReturnRes | false> {
    if (!options.workerPath) {
      return false
    }

    const isSupport = checkImageCaptureSupport()
    if (!isSupport) {
      console.error('不支持 ImageCapture，已降级为截取 canvas')
      return false
    }

    const videoData: CaptureVideoFrameData[] = await Promise.all(
      times.map((time) => onVideoSeeked(time, genWorkerData))
    )

    const data = await splitWorkerTask<
      CaptureVideoFrameData[],
      ArrayBuffer[],
      ArrayBuffer
    >({
      WorkerScript: options.workerPath,
      totalItems: times.length,
      async genSendMsg(st, et) {
        const data = videoData.slice(st, et)
        return Object.assign(data, {
          structuredSerializeOptions: {
            transfer: data.map((item) => item.imageBitmap)
          } satisfies StructuredSerializeOptions
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

  async function genWorkerData(video: HTMLVideoElement): Promise<CaptureVideoFrameData> {
    const stream = video.captureStream() as MediaStream
    const track = stream.getVideoTracks()[0]

    const imageCapture = new ImageCapture(track)
    const imageBitmap = await imageCapture.grabFrame()
    const timestamp = video.currentTime

    return {
      imageBitmap,
      timestamp,
      mimeType: opts.mimeType,
      quality: opts.quality,
    }
  }

  async function videoToCanvas(video: HTMLVideoElement) {
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
      opts.quality
    )
  }

  /**
   * 生成指定秒画面
   */
  async function onVideoSeeked<R = any>(
    time: number,
    cb: (video: HTMLVideoElement) => Promise<R>
  ): Promise<R> {
    const video = document.createElement('video')

    video.currentTime = time
    video.muted = true
    video.src = src
    video.autoplay = true
    video.crossOrigin = 'anonymous'

    Object.assign(video.style, {
      position: 'absolute',
      top: '-9999px',
      transform: 'translate(-9999px)',
    })
    document.body.appendChild(video)

    return new Promise<R>((resolve, reject) => {
      video.oncanplay = async () => {
        const res = await cb(video)
        resolve(res)
        document.body.removeChild(video)
      }

      video.onerror = (err) => {
        reject(err)
        document.body.removeChild(video)
      }
    })
  }

}

function checkImageCaptureSupport() {
  const video = document.createElement('video')
  if (
    typeof ImageCapture === 'undefined' ||
    !isFn(video.captureStream)
  ) {
    return false
  }

  return true
}

type Options = {
  /**
   * 传入视频文件给你，你可以指定尺寸大小
   */
  setSize?: (video: HTMLVideoElement) => { width: number, height: number }
  mimeType?: string
  quality?: number
  /**
   * 指定 worker 路径，可以是路径，也可以是返回 worker 的函数
   */
  workerPath?: string | (new () => Worker)
}
