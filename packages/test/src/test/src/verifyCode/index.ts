/**
 * @link https://juejin.cn/post/7306062725213044774
 */

import { adaptiveBinarize, adaptiveGrayscale, enhanceContrast, getImgData, scaleImgData } from '@/canvasTool'
import { blobToBase64, createCvs } from '@jl-org/tool'
import type { BinaryRow } from './type'
import { convolution } from './convolution'


const SCALE = 4
const THRESHOLD = 165
const url = new URL('./assets/9.png', import.meta.url).href

main()

async function main() {

  const { imgData, } = await getCodeImgData()
  const { imgData: data, binData } = binarization(imgData)

  const data4x = scaleImgData(data, SCALE)
  const { ctx, cvs } = createCvs(data4x.width, data4x.height)

  ctx.putImageData(data4x, 0, 0)
  document.body.appendChild(cvs)

  cutWhiteEdge(binData)
  const rawSizeData = restoreDataScale(binData, SCALE)
  const rawSizeDataStr = rawSizeData.map(row => row.join('')).join(' ')

  console.log(rawSizeDataStr)
  console.log(convolution(rawSizeData))
}


/**
 * 还原二值化数据的缩放
 * @returns 
 */
function restoreDataScale(data: BinaryRow[], scale: number) {
  const scaleData = []
  const w = data[0].length
  const h = data.length

  for (let y = 0; y < h; y += scale) {
    const row = []
    for (let x = 0; x < w; x += scale) {
      row.push(data[y][x])
    }
    scaleData.push(row)
  }
  return scaleData
}

/**
 * 切除白边
 */
function cutWhiteEdge(data: BinaryRow[]): void {
  let edge: BinaryRow

  const isWhiteEdge = () =>
    edge.every(binary => binary == '0')

  // 连续切边
  const cutEdgeContinuous = (getEdge: () => BinaryRow, cutEdge: VoidFunction) => {
    const _resetEdge = () => (edge = getEdge())
    for (
      _resetEdge();
      isWhiteEdge();
      cutEdge(), _resetEdge()
    );
  }

  // 切边顺序：上下左右

  // 上
  cutEdgeContinuous(
    () => data[0],
    () => data.shift()
  )

  // 下
  cutEdgeContinuous(
    () => data[data.length - 1],
    () => data.pop()
  )

  // 左
  cutEdgeContinuous(
    () => data.map(row => row[0]),
    () => data.forEach(row => row.shift())
  )

  // 右
  cutEdgeContinuous(
    () => data.map(row => row[row.length - 1]),
    () => data.forEach(row => row.pop())
  )
}

/**
 * ### 去除噪点
 * - 如果一个有效点 (为 1 的点) 的周围 (上下左右)
 * - 不存在另一个有效点，那么就认为这个有效点是一个噪点
 */
function deNoising(binData: BinaryRow[]) {
  const h = binData.length
  const w = binData[0].length

  const isEffectivePoint = (x: number, y: number) => binData[y][x] == '1'
  const checkAround = (x: number, y: number) => {
    // 边界控制
    const checkTop = y > 0
    const checkBottom = y < h - 1
    const checkLeft = x > 0
    const checkRight = x < w - 1

    return (
      (checkTop && isEffectivePoint(x, y - 1)) ||
      (checkBottom && isEffectivePoint(x, y + 1)) ||
      (checkLeft && isEffectivePoint(x - 1, y)) ||
      (checkRight && isEffectivePoint(x + 1, y))
    )
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (
        isEffectivePoint(x, y) &&
        !checkAround(x, y)
      ) {
        // 将噪点置为无效点
        binData[y][x] = '0'
      }
    }
  }
}


/**
 * 二值化处理
 */
function binarization(imgData: ImageData, threshold = THRESHOLD) {
  // imgData = adaptiveGrayscale(imgData)
  // imgData = enhanceContrast(imgData)
  imgData = adaptiveBinarize(imgData, threshold)

  const { width, height } = imgData
  const binData: BinaryRow[] = []

  const pixelToBin = (pixel: number[]) =>
    pixel.every((val) => val > threshold)
      ? '0'
      : '1'

  for (let y = 0; y < height; y++) {
    const row: BinaryRow = []

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4
      const pixel = [
        imgData.data[index],
        imgData.data[index + 1],
        imgData.data[index + 2]
      ]
      row.push(pixelToBin(pixel))
    }

    binData.push(row)
  }

  return {
    imgData,
    /** 
     * 0 | 1 的二维数组
     * 一个数组为一行
     * 一个元素为一个像素点，0 为无效点，1 为有效点
     */
    binData
  }
}

async function getCodeImgData() {
  const _img = new Image()
  _img.src = url
  document.body.appendChild(_img)

  const src = await fetch(url)
    .then(res => res.blob())
    .then(res => blobToBase64(res))

  return getImgData(src)
}


