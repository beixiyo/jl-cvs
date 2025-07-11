import { getImgData } from '@jl-org/tool'

/**
 * 提取图片边缘
 * @param source 图片URL或ImageData对象
 * @param options 配置项
 */
export async function getImgEdge(
  source: string | ImageData,
  options: {
    threshold?: number // 边缘检测阈值 (0-255)
  } = {},
): Promise<ImageData> {
  /** 参数默认值 */
  const { threshold = 128 } = options

  /** 加载图片并转换为ImageData */
  const imageData = await (typeof source === 'string'
    ? getImgData(source).then(res => res.imgData)
    : Promise.resolve(source))

  /** 转换为灰度图 */
  const grayscaleData = rgbToGrayscale(imageData)

  // Sobel边缘检测
  const edgeData = sobelEdgeDetection(grayscaleData, imageData.width, imageData.height, threshold)

  return edgeData
}

// ---------------------- 工具函数 ----------------------

/** RGB转灰度图 (返回Uint8Array) */
function rgbToGrayscale(imageData: ImageData): Uint8Array {
  const grayData = new Uint8Array(imageData.width * imageData.height)
  for (let i = 0; i < imageData.data.length; i += 4) {
    /** 灰度公式: Y = 0.299*R + 0.587*G + 0.114*B */
    const gray = Math.round(
      0.299 * imageData.data[i]
      + 0.587 * imageData.data[i + 1]
      + 0.114 * imageData.data[i + 2],
    )
    grayData[i / 4] = gray
  }
  return grayData
}

/** Sobel 边缘检测 */
function sobelEdgeDetection(
  grayData: Uint8Array,
  width: number,
  height: number,
  threshold: number,
): ImageData {
  const edgeData = new ImageData(width, height)
  const sobelXKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelYKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0; let gy = 0

      // 3x3卷积
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelValue = grayData[(y + ky) * width + (x + kx)]
          const kernelIndex = (ky + 1) * 3 + (kx + 1)
          gx += pixelValue * sobelXKernel[kernelIndex]
          gy += pixelValue * sobelYKernel[kernelIndex]
        }
      }

      /** 计算梯度强度 */
      const gradient = Math.sqrt(gx * gx + gy * gy)
      const edgeStrength = gradient > threshold
        ? 255
        : 0

      /** 写入结果 (RGBA全设为相同值，alpha=255) */
      const index = (y * width + x) * 4
      edgeData.data[index] = edgeStrength // R
      edgeData.data[index + 1] = edgeStrength // G
      edgeData.data[index + 2] = edgeStrength // B
      edgeData.data[index + 3] = 255 // A
    }
  }
  return edgeData
}
