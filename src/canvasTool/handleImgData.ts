import { createCvs, getImg } from '@jl-org/tool'

/**
 * 灰度化算法：加权灰度化
 * @returns 
 */
export const adaptiveGrayscale = (imageData: ImageData): ImageData => {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    // 使用加权公式，更符合人眼感知的亮度
    const gray = 0.3 * data[i] + 0.5 * data[i + 1] + 0.2 * data[i + 2]
    data[i] = data[i + 1] = data[i + 2] = gray
  }
  return imageData
}

/**
 * 对比度增强
 * @param factor 因数，默认 1.2
 * @returns 
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
 * @returns 
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

/**
 * 放大 ImageData 到指定倍数
 * @returns 返回一个新的 ImageData
 */
export function scaleImgData(imgData: ImageData, scale: number) {
  scale = Math.max(1, Math.floor(scale))
  
  const { width, height, data } = imgData
  const newWidth = width * scale
  const newHeight = height * scale
  const pixelData = new Uint8ClampedArray(newWidth * newHeight * 4)

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      // 获取原始图像中像素的索引
      const srcIndex = (y * width + x) * 4

      // 将该像素放大 scale 倍
      for (let sy = 0; sy < scale; ++sy) {
        for (let sx = 0; sx < scale; ++sx) {
          // 计算新图像中的目标位置
          const dstX = x * scale + sx
          const dstY = y * scale + sy
          const dstIndex = (dstY * newWidth + dstX) * 4

          // 设置放大的图像中对应位置的颜色
          pixelData[dstIndex] = data[srcIndex]
          pixelData[dstIndex + 1] = data[srcIndex + 1]
          pixelData[dstIndex + 2] = data[srcIndex + 2]
          pixelData[dstIndex + 3] = data[srcIndex + 3]
        }
      }
    }
  }

  return new ImageData(pixelData, newWidth, newHeight)
}

/**
 * 传入图片地址，返回 ImageData
 */
export async function getImgData(
  src: string,
  setImg = (img: HTMLImageElement) => img.crossOrigin = 'anonymous'
) {
  const img = await getImg(src, setImg)
  if (!img) {
    throw new Error('图片加载失败')
  }

  const { ctx, cvs } = createCvs(img.naturalWidth, img.naturalHeight)
  ctx.drawImage(img, 0, 0)

  return {
    ctx,
    cvs,
    imgData: ctx.getImageData(0, 0, cvs.width, cvs.height),

    width: img.width,
    height: img.height,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
  }
}