import { eachPixel, getImgData } from '@jl-org/tool'

/**
 * 灰度化算法：加权灰度化
 */
export const adaptiveGrayscale = (imageData: ImageData): ImageData => {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    // 灰度公式: Y = 0.299*R + 0.587*G + 0.114*B
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    data[i] = data[i + 1] = data[i + 2] = gray
  }
  return imageData
}

/**
 * 对比度增强
 * @param factor 因数，默认 1.2
 */
export const enhanceContrast = (imageData: ImageData, factor: number = 1.2): ImageData => {
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
 * @param threshold 阈值边界，默认 128
 */
export const adaptiveBinarize = (imageData: ImageData, threshold = 128): ImageData => {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] // 因为之前已经灰度化了，所以 R=G=B
    const value = gray >= threshold ? 255 : 0 // 根据阈值进行二值化
    data[i] = data[i + 1] = data[i + 2] = value
  }
  return imageData
}
