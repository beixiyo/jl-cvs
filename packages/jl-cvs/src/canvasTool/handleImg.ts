import type { TransferType } from '@jl-org/tool'
import { blobToBase64, getImg, isStr } from '@jl-org/tool'
import { createCvs } from './'

export {
  base64ToBlob,
  blobToBase64,
  compressImg,
  cutImg,
  downloadByData,
  downloadByUrl,
  getCvsImg,
  getImg,
  urlToBlob,
} from '@jl-org/tool'

/**
 * 图片噪点化
 * @param img 图片
 * @param level 噪点等级，默认 100
 */
export function imgToNoise(img: HTMLImageElement, level = 100) {
  const { width, height } = img
  const { ctx, cvs } = createCvs(width, height)
  ctx.drawImage(img, 0, 0)

  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data

  for (let i = 0; i < data.length; i += 4) {
    /** 对每个颜色通道添加噪声 */
    const red = data[i] + level * (Math.random() * 2 - 1)
    const green = data[i + 1] + level * (Math.random() * 2 - 1)
    const blue = data[i + 2] + level * (Math.random() * 2 - 1)

    /** 确保颜色值在 0 到 255 之间 */
    data[i] = clamp(red)
    data[i + 1] = clamp(green)
    data[i + 2] = clamp(blue)
  }

  function clamp(val: number, max = 255) {
    return Math.min(Math.max(Math.round(val), 0), max)
  }

  ctx.putImageData(imgData, 0, 0)
  return cvs
}

/**
 * 添加水印
 * 返回 base64 和图片大小，你可以用 CSS 设置上
 * @example
 * background-image: url(${base64});
 * background-size: ${size}px ${size}px;
 */
export function waterMark({
  fontSize = 40,
  gap = 20,
  text = '水印',
  color = '#fff5',
  rotate = 35,
}: WaterMarkOpts) {
  const { cvs, ctx } = createCvs(0, 0)
  const _fontSize = fontSize
  const font = `${_fontSize}px serif`

  /** 获取文字宽度 */
  ctx.font = font
  const { width } = ctx.measureText(text)
  const canvasSize = Math.max(100, width) + gap

  cvs.width = canvasSize
  cvs.height = canvasSize

  ctx.translate(cvs.width / 2, cvs.height / 2)
  ctx.rotate((Math.PI / 180) * rotate)
  ctx.fillStyle = color
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillText(text, 0, 0)

  return {
    base64: cvs.toDataURL(),
    size: canvasSize,
  }
}

/**
 * 用 Canvas 层层叠加图片，支持 base64 | blob
 */
export async function composeImg(
  srcs: Array<{
    src: string | Blob
    left?: number
    top?: number
    setImg?: (img: HTMLImageElement) => void
  }>,
  width: number,
  height: number,
) {
  const { cvs, ctx } = createCvs(width, height)
  for (const item of srcs) {
    const url = isStr(item.src)
      ? item.src
      : await blobToBase64(item.src)

    const img = await getImg(url, item.setImg)
    if (!img) {
      throw new Error('图片不可用')
    }

    ctx.drawImage(img, item.left ?? 0, item.top ?? 0)
  }

  return cvs.toDataURL()
}

export type HandleImgReturn<T extends TransferType>
  = T extends 'blob'
    ? Blob
    : string

export type WaterMarkOpts = {
  text?: string
  fontSize?: number
  gap?: number
  color?: string
  rotate?: number
}

export type CvsToDataOpts = {
  type?: string
  quality?: number
}

export type CutImgOpts = {
  x?: number
  y?: number
  width?: number
  height?: number
  scaleX?: number
  scaleY?: number

  /** 图片的 MIME 格式 */
  mimeType?: string
  /** 图像质量，取值范围 0 ~ 1 */
  quality?: number
}
