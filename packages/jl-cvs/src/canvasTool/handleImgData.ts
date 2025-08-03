import { createCvs, eachPixel, getColorInfo, getImgData, type Pixel } from '@jl-org/tool'
import { getDPR } from './tools'

/**
 * 灰度化算法：加权灰度化
 * @param imageData 图片数据
 */
export function adaptiveGrayscale(imageData: ImageData): ImageData {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    /** 灰度公式: Y = 0.299*R + 0.587*G + 0.114*B */
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    data[i] = data[i + 1] = data[i + 2] = gray
  }
  return imageData
}

/**
 * 对比度增强
 * @param imageData 图片数据
 * @param factor 因数，默认 1.2
 */
export function enhanceContrast(imageData: ImageData, factor: number = 1.2): ImageData {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor) // 对R通道增强对比度
    data[i + 1] = Math.min(255, data[i + 1] * factor) // 对G通道增强对比度
    data[i + 2] = Math.min(255, data[i + 2] * factor) // 对B通道增强对比度
  }
  return imageData
}

/**
 * 二值化处理，请先调用
 * - adaptiveGrayscale
 * - enhanceContrast
 *
 * 最后再调用此函数，以获得最好的图像效果
 *
 * @param imageData 图片数据
 * @param threshold 阈值边界，默认 128
 */
export function adaptiveBinarize(imageData: ImageData, threshold = 128): ImageData {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] // 因为之前已经灰度化了，所以 R=G=B
    const value = gray >= threshold
      ? 255
      : 0 // 根据阈值进行二值化
    data[i] = data[i + 1] = data[i + 2] = value
  }
  return imageData
}

/**
 * 将图片中的指定颜色替换为另一种颜色
 * @param imgOrUrl 图片或图片地址
 * @param fromColor 需要替换的颜色
 * @param toColor 替换后的颜色
 * @returns 替换后的图片
 */
export async function changeImgColor(
  imgOrUrl: HTMLImageElement | string,
  fromColor: string,
  toColor: string,
  opts: ChangeImgColorOpts = {},
) {
  const fromC = getColorInfo(fromColor)
  const toC = getColorInfo(toColor)
  const imgData = await getImgData(imgOrUrl)
  const cpImgData = (await getImgData(imgOrUrl)).imgData

  const formatFromColorAlpha = Math.round(fromC.a * 255)
  const formatToColorAlpha = Math.round(toC.a * 255)

  eachPixel(imgData.imgData, ([r, g, b, a], x, y, index) => {
    const isSame = opts.isSameColor
      ? opts.isSameColor([r, g, b, a], x, y, index)
      : r === fromC.r
        && g === fromC.g
        && b === fromC.b
        && a === formatFromColorAlpha

    if (isSame) {
      cpImgData.data[index] = toC.r
      cpImgData.data[index + 1] = toC.g
      cpImgData.data[index + 2] = toC.b
      cpImgData.data[index + 3] = formatToColorAlpha
    }
  })

  const dpr = getDPR()
  const { cvs, ctx } = createCvs(imgData.width, imgData.height, { dpr })
  ctx.putImageData(cpImgData, 0, 0)
  const base64 = cvs.toDataURL()

  return {
    base64,
    imgData: cpImgData,
  }
}

export type ChangeImgColorOpts = {
  /**
   * 用户自定义判断是否为需要替换的颜色
   * @param pixel 像素
   * @param x 像素x坐标
   * @param y 像素y坐标
   * @param index 像素索引
   * @returns 是否为需要替换的颜色
   */
  isSameColor?: (pixel: Pixel, x: number, y: number, index: number) => boolean
}
