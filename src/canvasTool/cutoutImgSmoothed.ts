import { createCvs, getImgData } from '@jl-org/tool'

/**
 * 传入一张原始图片和一张遮罩图片，返回另一张图片，其中遮罩图的非透明区域将被裁剪掉，并应用边缘平滑
 * @param rawImg 原图
 * @param maskImg 遮罩图
 */
export async function cutoutImgSmoothed(
  rawImg: string,
  maskImg: string,
  {
    blurRadius = 3,
    featherAmount = 3,
  }: CutoutImgOpts = {},
) {
  const rawImgDataObj = await getImgData(rawImg)
  const maskImgDataObj = await getImgData(maskImg)

  return edgeSmooth(
    rawImgDataObj.imgData,
    maskImgDataObj.imgData,
    {
      blurRadius,
      featherAmount,
    },
  )
}

function edgeSmooth(
  imgData: ImageData,
  maskData: ImageData,
  {
    blurRadius = 3,
    featherAmount = 3,
  }: CutoutImgOpts = {},
) {
  /** 创建临时遮罩数组用于边缘检测和平滑处理 */
  const tempMask = new Uint8Array(maskData.data.length / 4)

  for (let i = 0; i < maskData.data.length; i += 4) {
    /** 提取遮罩的alpha通道或颜色信息 */
    tempMask[i / 4] = maskData.data[i] > 0 || maskData.data[i + 1] > 0 || maskData.data[i + 2] > 0
      ? 255
      : 0
  }

  const { width, height } = maskData
  const { ctx } = createCvs(width, height)
  const resultData = ctx.createImageData(width, height)

  /** 应用边缘平滑 */
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4

      /** 检查当前像素是否在遮罩边缘 */
      let isEdge = false
      let edgeIntensity = 0

      if (tempMask[i / 4] > 0) {
        /** 检查周围像素，判断是否为边缘 */
        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          for (let dx = -blurRadius; dx <= blurRadius; dx++) {
            const nx = x + dx
            const ny = y + dy

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const ni = (ny * width + nx) * 4

              if (tempMask[ni / 4] === 0) {
                isEdge = true
                /** 计算到边缘的距离影响 */
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance <= blurRadius) {
                  edgeIntensity = Math.max(edgeIntensity, 1 - distance / blurRadius)
                }
              }
            }
          }
        }
      }

      /** 应用原始遮罩 */
      if (tempMask[i / 4] > 0) {
        resultData.data[i] = imgData.data[i]
        resultData.data[i + 1] = imgData.data[i + 1]
        resultData.data[i + 2] = imgData.data[i + 2]

        /** 边缘处理 - 应用半透明过渡 */
        if (isEdge) {
          /** 边缘羽化 - 降低alpha值实现平滑过渡 */
          resultData.data[i + 3] = Math.max(0, 255 - edgeIntensity * featherAmount * 255)
        }
        else {
          resultData.data[i + 3] = 255 /** 非边缘区域保持完全不透明 */
        }
      }
      else {
        /** 遮罩外区域设为透明 */
        resultData.data[i] = 0
        resultData.data[i + 1] = 0
        resultData.data[i + 2] = 0
        resultData.data[i + 3] = 0
      }
    }
  }

  return resultData
}


export type CutoutImgOpts = {
  /**
   * 模糊半径，默认 3
   */
  blurRadius?: number
  /**
   * 羽化程度，默认 3
   */
  featherAmount?: number
}
