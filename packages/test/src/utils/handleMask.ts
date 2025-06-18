import { createCvs, getColorInfo, getImg } from '@jl-org/tool'
import { BRUSH_COLOR } from '@/config'

const { r, g, b, a } = getColorInfo(BRUSH_COLOR)

export async function getImgCanvas(url: string) {
  const img = await getImg(url)
  if (!img) {
    throw new Error('Image load failed')
  }

  const { width, height } = img
  const { cvs, ctx } = createCvs(width, height)
  ctx.drawImage(img, 0, 0)

  return {
    cvs,
    ctx,
    width,
    height,
  }
}

export async function getAlphaMask(mask: string) {
  const { cvs, ctx, width, height } = await getImgCanvas(mask)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    /** 白转半透明 */
    if (
      data[i] === 255
      && data[i + 1] === 255
      && data[i + 2] === 255
      && data[i + 3] === 255
    ) {
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = a * 255
    }
    /** 其他转透明 */
    else {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 0
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return cvs.toDataURL()
}

/**
 * 获取图片数据矩阵，1 表示有数据，0 表示无数据
 */
export async function getImgDataMatrix(imgUrl: string) {
  const { ctx, width, height } = await getImgCanvas(imgUrl)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const matrix: Binary[][] = []

  for (let x = 0; x < width; x++) {
    const column: Binary[] = []
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4
      const alpha = data[index + 3]
      column.push(alpha > 0
        ? 1
        : 0)
    }
    matrix.push(column)
  }

  return matrix
}

export type Binary = 0 | 1
