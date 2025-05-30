import { blobToBase64, isFn, type TransferType } from '@jl-org/tool'
import { getCvsImg, type HandleImgReturn } from './handleImg'
import { createCvs } from './'
import type { CaptureFrameResult, CaptureVideoFrameData, VideoData } from '@/worker/captureVideoFrame'


/**
 * 截取视频某一帧图片，大于总时长则用最后一秒
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
  const times = Array.isArray(time)
    ? time
    : [time]

  const data = await runWithWorker()
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

  async function runWithWorker(): Promise<false | ReturnRes> {
    if (options.workerPath) {
      const isSupport = checkImageCaptureSupport()
      if (!isSupport) {
        console.error('不支持 ImageCapture，已降级为截取 canvas')
        return false
      }

      const worker = isFn(options.workerPath)
        ? options.workerPath()
        : new Worker(options.workerPath)

      const p = new Promise<ReturnRes>((resolve, reject) => {
        worker.onmessage = async (e: MessageEvent<CaptureFrameResult[]>) => {
          if (resType === 'base64') {
            const res: string[] = []
            for (const item of e.data) {
              const base64 = await blobToBase64(item.blob)
              res.push(base64)
            }

            resolve(res as unknown as ReturnRes)
          }

          resolve(e.data.map((item) => item.blob) as unknown as ReturnRes)
        }

        worker.onerror = (err) => {
          reject(err)
        }
      })

      sendWorkerData(worker)
      return p
    }

    return false
  }

  async function sendWorkerData(worker: Worker) {
    const videoData: VideoData[] = []

    for (let i = 0; i < times.length; i++) {
      const time = times[i]
      await onVideoSeeked(time, async (video) => {
        const workerData = await genWorkerData(video)
        videoData.push(workerData)
      })
    }

    const workerEventData: CaptureVideoFrameData = {
      videoData,
      mimeType: options.mimeType || 'image/webp',
      quality: options.quality || 0.5,
    }
    worker.postMessage(workerEventData)
  }

  async function genWorkerData(video: HTMLVideoElement): Promise<VideoData> {
    const stream = video.captureStream() as MediaStream
    const track = stream.getVideoTracks()[0]

    const imageCapture = new ImageCapture(track)
    const imageBitmap = await imageCapture.grabFrame()
    const timestamp = video.currentTime

    return {
      imageBitmap,
      timestamp,
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
      options.mimeType,
      options.quality
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
      video.onseeked = async () => {
        const res = await cb(video)
        resolve(res)
        document.body.removeChild(video)
      }
      video.onerror = (err) => {
        reject(err)
      }
    })
  }

}

function checkImageCaptureSupport() {
  const video = document.createElement('video')
  if (
    typeof ImageCapture === 'undefined' ||
    !video.captureStream
  ) {
    return false
  }
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
  workerPath?: string | (() => Worker)
}
