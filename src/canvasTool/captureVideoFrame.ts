import type { TransferType } from '@/types'
import { getCvsImg, type HandleImgReturn } from './handleImg'
import { createCvs } from './tools'


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
  options?: Options
): Promise<N extends number
  ? HandleImgReturn<T>
  : HandleImgReturn<T>[]
> {

  if (typeof time === 'number') {
    return await genFrame(time) as unknown as Promise<N extends number
      ? HandleImgReturn<T>
      : HandleImgReturn<T>[]
    >
  }
  else {
    const arr = []
    time.forEach((t) => {
      arr.push(genFrame(t))
    })
    return Promise.all(arr) as unknown as Promise<N extends number
      ? HandleImgReturn<T>
      : HandleImgReturn<T>[]
    >
  }


  function videoToCanvas(
    video: HTMLVideoElement,
  ) {
    let w: number,
      h: number

    if (options?.setSize) {
      const { width, height } = options.setSize(video)
      w = width
      h = height
    }
    else {
      w = video.videoWidth / window.devicePixelRatio
      h = video.videoHeight / window.devicePixelRatio
    }

    const { ctx, cvs } = createCvs(w, h)

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
  async function genFrame(time: number): Promise<HandleImgReturn<T>> {
    const video = document.createElement('video'),
      src = typeof fileOrUrl === 'string'
        ? fileOrUrl
        : URL.createObjectURL(fileOrUrl)

    video.currentTime = time
    video.muted = true
    video.autoplay = true
    video.src = src

    return new Promise<HandleImgReturn<T>>((resolve, reject) => {
      video.oncanplay = () => {
        resolve(videoToCanvas(video))
      }
      video.onerror = (err) => {
        reject(err)
      }
    })
  }

}


type Options = {
  /**
   * 传入视频文件给你，你需要指定尺寸大小
   */
  setSize(video: HTMLVideoElement): { width: number, height: number }
  mimeType?: string
  quality?: number
}