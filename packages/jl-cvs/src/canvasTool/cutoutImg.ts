/**
 * 抠图处理相关函数
 */

import { createCvs, eachPixel, getColorInfo, getImg, getImgData } from '@jl-org/tool'

/**
 * 抠图转遮罩（把图片的非透明区域，换成指定颜色）
 * @param imgUrl 图片
 * @param replaceColor 替换的颜色
 */
export async function cutoutImgToMask(
  imgUrl: string,
  replaceColor: string,
  opts: CutImgToMaskOpts = {},
) {
  const {
    smoothEdge = true,
    smoothRadius = 1,
    alphaThreshold = 0,
    ignoreAlpha = true,
  } = opts

  const imgData = await getImgData(imgUrl)
  const { r, g, b, a } = getColorInfo(replaceColor)
  const { width, height } = imgData.imgData

  /** 创建一个临时的 alpha 通道数组，保存原始 alpha 值 */
  const originalAlpha = new Uint8ClampedArray(width * height)

  eachPixel(imgData.imgData, ([R, G, B, A], x, y, index) => {
    originalAlpha[y * width + x] = A
    const data = imgData.imgData.data

    if (A > alphaThreshold) {
      if (opts.handleAlpha) {
        data[index + 3] = opts.handleAlpha(
          { r: R, g: G, b: B, a: A },
          { x, y, index },
        )
      }
      else {
        data[index] = r // Set Red
        data[index + 1] = g // Set Green
        data[index + 2] = b // Set Blue
        /**
         * 保留原始 alpha 值以实现平滑边缘
         * 如果 alpha 值大于 alphaThreshold，则保留原始 alpha 值
         */

        if (!ignoreAlpha) {
          data[index + 3] = A > 0
            ? a * A
            : 0
        }
      }
    }
    else {
      /**
       * 否则像素被视为背景（透明）
       * 在遮罩中使其完全透明
       */
      data[index + 3] = 0
    }
  })

  /** 如果需要平滑边缘 */
  if (smoothEdge) {
    /** 检测边缘像素 */
    const isEdge = new Uint8ClampedArray(width * height)

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const center = originalAlpha[idx]

        /** 检查周围8个像素，如果有任何一个与中心像素的透明度差异较大，则认为是边缘 */
        const neighbors = [
          originalAlpha[(y - 1) * width + (x - 1)],
          originalAlpha[(y - 1) * width + x],
          originalAlpha[(y - 1) * width + (x + 1)],
          originalAlpha[y * width + (x - 1)],
          originalAlpha[y * width + (x + 1)],
          originalAlpha[(y + 1) * width + (x - 1)],
          originalAlpha[(y + 1) * width + x],
          originalAlpha[(y + 1) * width + (x + 1)],
        ]

        /** 如果中心像素与任何相邻像素的透明度差异超过阈值，则标记为边缘 */
        isEdge[idx] = neighbors.some((n) => Math.abs(center - n) > 20)
          ? 1
          : 0
      }
    }

    /** 对边缘像素应用平滑处理 */
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const dataIdx = idx * 4 + 3 // alpha 通道的索引

        if (isEdge[idx] === 1) {
          let sum = 0
          let count = 0

          /** 在半径范围内采样 */
          for (let dy = -smoothRadius; dy <= smoothRadius; dy++) {
            for (let dx = -smoothRadius; dx <= smoothRadius; dx++) {
              const nx = x + dx
              const ny = y + dy

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance <= smoothRadius) {
                  /** 高斯权重 */
                  const weight = Math.exp(-(distance * distance) / (2 * smoothRadius * smoothRadius))
                  sum += imgData.imgData.data[(ny * width + nx) * 4 + 3] * weight
                  count += weight
                }
              }
            }
          }

          /** 应用平滑后的 alpha 值 */
          if (count > 0) {
            imgData.imgData.data[dataIdx] = Math.round(sum / count)
          }
        }
      }
    }
  }

  /**
   * 不要计算 DPR，这里应该让调用者决定
   */
  const { cvs, ctx } = createCvs(width, height)
  ctx.putImageData(imgData.imgData, 0, 0)
  const base64 = cvs.toDataURL('image/png')

  return {
    base64,
    imgData: imgData.imgData,
  }
}

/**
 * 传入一张原始图片和一张遮罩图片，将遮罩图不透明的区域提取出来。
 * 使用 **globalCompositeOperation** 实现
 *
 * @param originalImageSource 原图
 * @param maskImageSource 遮罩图
 */
export async function cutoutImg(
  originalImageSource: string | HTMLImageElement,
  maskImageSource: string | HTMLImageElement,
): Promise<string> {
  const [originalImage, maskImage] = await Promise.all([
    getImg(originalImageSource),
    getImg(maskImageSource),
  ])

  if (!originalImage || !maskImage) {
    throw new Error('Could not load image.')
  }

  const width = originalImage.naturalWidth || originalImage.width
  const height = originalImage.naturalHeight || originalImage.height
  const maskWidth = maskImage.naturalWidth || maskImage.width
  const maskHeight = maskImage.naturalHeight || maskImage.height

  if (!width || !height) {
    throw new Error('Could not determine original image dimensions.')
  }
  if (!maskWidth || !maskHeight) {
    throw new Error('Could not determine mask image dimensions.')
  }
  if (width !== maskWidth || height !== maskHeight) {
    throw new Error(`Image dimension mismatch: Original (${width}x${height}), Mask (${maskWidth}x${maskHeight}). They must be identical.`)
  }

  /**
   * 不要计算 DPR，这里应该让调用者决定
   */
  const { cvs, ctx } = createCvs(width, height)

  ctx.drawImage(originalImage, 0, 0, width, height)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(maskImage, 0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'

  return cvs.toDataURL('image/png')
}

/**
 * 传入一张原始图片和一张遮罩图片，将遮罩图不透明的区域提取出来，并对提取出的区域进行平滑处理。
 * 遍历处理每个像素实现
 *
 * @param originalImg 原图
 * @param maskImg 遮罩图
 */
export async function cutoutImgSmoothed(
  originalImg: string,
  maskImg: string,
  {
    blurRadius = 3,
    featherAmount = 3,
  }: CutoutImgOpts = {},
) {
  const [originalImgDataObj, maskImgDataObj] = await Promise.all([
    getImgData(originalImg),
    getImgData(maskImg),
  ])

  return edgeSmooth(
    originalImgDataObj.imgData,
    maskImgDataObj.imgData,
    {
      blurRadius,
      featherAmount,
    },
  )
}

function edgeSmooth(
  originalImgData: ImageData,
  maskData: ImageData,
  {
    blurRadius = 3,
    featherAmount = 3,
  }: CutoutImgOpts = {},
) {
  if (
    originalImgData.width !== maskData.width
    || originalImgData.height !== maskData.height
  ) {
    throw new Error(
      `Image dimension mismatch: Original (${originalImgData.width}x${originalImgData.height}), Mask (${maskData.width}x${maskData.height}). They must be identical.`,
    )
  }

  const searchRadius = Math.max(
    0,
    Math.floor(blurRadius),
    Math.ceil(featherAmount),
  )
  const normalizedFeatherAmount = Math.max(0, featherAmount)

  /** 创建临时遮罩数组用于边缘检测和平滑处理 */
  const tempMask = new Uint8Array(maskData.data.length / 4)

  for (let i = 0; i < maskData.data.length; i += 4) {
    /** 遮罩语义由 alpha 通道决定，RGB 颜色不影响透明度 */
    tempMask[i / 4] = maskData.data[i + 3]
  }

  const { width, height } = maskData
  /**
   * 不要计算 DPR，这里应该让调用者决定
   */
  const { ctx } = createCvs(width, height)
  const resultData = ctx.createImageData(width, height)

  /** 应用边缘平滑 */
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const maskAlpha = tempMask[i / 4]

      if (maskAlpha > 0) {
        let minTransparentDistance = Number.POSITIVE_INFINITY
        if (normalizedFeatherAmount > 0) {
          for (let dy = -searchRadius; dy <= searchRadius; dy++) {
            for (let dx = -searchRadius; dx <= searchRadius; dx++) {
              if (dx === 0 && dy === 0) continue

              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > searchRadius) continue

              const nx = x + dx
              const ny = y + dy
              if (
                nx >= 0
                && nx < width
                && ny >= 0
                && ny < height
                && tempMask[ny * width + nx] === 0
              ) {
                minTransparentDistance = Math.min(
                  minTransparentDistance,
                  distance,
                )
              }
            }
          }
        }

        resultData.data[i] = originalImgData.data[i]
        resultData.data[i + 1] = originalImgData.data[i + 1]
        resultData.data[i + 2] = originalImgData.data[i + 2]

        const featherFactor = Number.isFinite(minTransparentDistance)
          ? Math.min(1, minTransparentDistance / normalizedFeatherAmount)
          : 1
        resultData.data[i + 3] = Math.round(
          originalImgData.data[i + 3]
            * (maskAlpha / 255)
            * featherFactor,
        )
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

export type CutImgToMaskOpts = {
  /**
   * 是否平滑边缘
   * @default true
   */
  smoothEdge?: boolean
  /**
   * 平滑半径
   * @default 1
   */
  smoothRadius?: number
  /**
   * alpha 阈值，当目标像素的 alpha 小于此值时，将被视为透明
   * @default 0
   */
  alphaThreshold?: number
  /**
   * 忽略透明度
   * @default true
   */
  ignoreAlpha?: boolean
  /**
   * 当 alpha 值大于 alphaThreshold 时，如果传递了 handleAlpha 函数，则调用此函数处理 alpha 值
   * @returns 返回值作为此像素的透明度
   */
  handleAlpha?: (rgba: RGBAObj, pixelPosition: PixelPostion) => number
}

export type RGBAObj = {
  r: number
  g: number
  b: number
  a: number
}

type PixelPostion = {
  x: number
  y: number
  index: number
}
