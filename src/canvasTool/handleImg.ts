import { createCvs, getDPR } from './'
import { blobToBase64, eachPixel, getColorInfo, getCvsImg, getImg, getImgData, isStr, TransferType } from '@jl-org/tool'

export {
  cutImg,
  compressImg,
  getCvsImg,
  blobToBase64,
  base64ToBlob,
  urlToBlob,
  blobToStream,
  getImg,
  downloadByUrl,
  downloadByData
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

  const imgData = ctx.getImageData(0, 0, width, height),
    data = imgData.data

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
  rotate = 35
}: WaterMarkOpts) {
  const { cvs, ctx } = createCvs(0, 0),
    _fontSize = fontSize * getDPR(),
    font = _fontSize + 'px serif'

  // 获取文字宽度
  ctx.font = font
  const { width } = ctx.measureText(text)
  const canvasSize = Math.max(100, width) + gap * getDPR()

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
    size: canvasSize / getDPR(),
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
  height: number
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

/**
 * 把图片的非透明区域，换成指定颜色
 * @param imgUrl 图片
 * @param replaceColor 替换的颜色
 */
export async function cutoutImgToMask(
  imgUrl: string,
  replaceColor: string,
  {
    smoothEdge = true,
    smoothRadius = 1,
  }: CutImgToMaskOpts = {}
) {
  const imgData = await getImgData(imgUrl)
  const { r, g, b, a } = getColorInfo(replaceColor)
  const { width, height } = imgData

  // 创建一个临时的 alpha 通道数组，保存原始 alpha 值
  const originalAlpha = new Uint8ClampedArray(width * height)

  eachPixel(imgData.imgData, ([R, G, B, A], x, y, index) => {
    originalAlpha[index] = A

    const data = imgData.imgData.data
    if (A !== 0) {
      data[index] = r
      data[index + 1] = g
      data[index + 2] = b
      // 保留原始的 alpha 过渡信息，使边缘更平滑
      data[index + 3] = A > 0 ? a * A : 0
    }
  })

  // 如果需要平滑边缘
  if (smoothEdge) {
    // 检测边缘像素
    const isEdge = new Uint8ClampedArray(width * height)

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const center = originalAlpha[idx]

        // 检查周围8个像素，如果有任何一个与中心像素的透明度差异较大，则认为是边缘
        const neighbors = [
          originalAlpha[(y - 1) * width + (x - 1)], originalAlpha[(y - 1) * width + x], originalAlpha[(y - 1) * width + (x + 1)],
          originalAlpha[y * width + (x - 1)], originalAlpha[y * width + (x + 1)],
          originalAlpha[(y + 1) * width + (x - 1)], originalAlpha[(y + 1) * width + x], originalAlpha[(y + 1) * width + (x + 1)]
        ]

        // 如果中心像素与任何相邻像素的透明度差异超过阈值，则标记为边缘
        isEdge[idx] = neighbors.some(n => Math.abs(center - n) > 20) ? 1 : 0
      }
    }

    // 对边缘像素应用平滑处理
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const dataIdx = idx * 4 + 3  // alpha 通道的索引

        if (isEdge[idx] === 1) {
          let sum = 0
          let count = 0

          // 在半径范围内采样
          for (let dy = -smoothRadius; dy <= smoothRadius; dy++) {
            for (let dx = -smoothRadius; dx <= smoothRadius; dx++) {
              const nx = x + dx
              const ny = y + dy

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance <= smoothRadius) {
                  // 高斯权重
                  const weight = Math.exp(-(distance * distance) / (2 * smoothRadius * smoothRadius))
                  sum += imgData.imgData.data[(ny * width + nx) * 4 + 3] * weight
                  count += weight
                }
              }
            }
          }

          // 应用平滑后的 alpha 值
          if (count > 0) {
            imgData.imgData.data[dataIdx] = Math.round(sum / count)
          }
        }
      }
    }
  }

  const { cvs, ctx } = createCvs(imgData.width, imgData.height)
  ctx.putImageData(imgData.imgData, 0, 0)
  const base64 = await getCvsImg(cvs, 'base64')

  return {
    base64,
    imgData: imgData.imgData
  }
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
}

export type HandleImgReturn<T extends TransferType> =
  T extends 'blob'
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
