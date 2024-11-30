import { Pixel } from '@/types'


/**
 * 根据半径和角度获取坐标
 * @param r 半径
 * @param deg 角度
 */
export function calcCoord(r: number, deg: number) {
  /** 弧度 */
  const RADIAN = Math.PI / 180

  const x = Math.sin(deg * RADIAN) * r,
    // 数学坐标系和图像坐标系相反
    y = -Math.cos(deg * RADIAN) * r
  return [x, y]
}

/**
 * 创建一个指定宽高的画布
 * @param width 画布的宽度
 * @param height 画布的高度
 * @param options 上下文配置
 * @returns 包含画布和上下文的对象
 */
export function createCvs(width?: number, height?: number, options?: CanvasRenderingContext2DSettings) {
  const cvs = document.createElement('canvas'),
    ctx = cvs.getContext('2d', options)!
  width && (cvs.width = width)
  height && (cvs.height = height)

  return { cvs, ctx }
}

/**
 * 取出`canvas`用一维数组描述的颜色中，某个坐标的`RGBA`数组  
 * 注意坐标从 0 开始
 * @param x 宽度中的第几列
 * @param y 高度中的第几行
 * @param imgData ctx.getImageData 方法获取的 ImageData 对象的 data 属性
 * @param width 图像区域宽度
 * @returns `RGBA`数组
 */
export function getPixel(x: number, y: number, imgData: ImageData['data'], width: number) {
  const arr: Pixel = [0, 0, 0, 0]
  /**
   * canvas 的像素点是一维数组，需要通过计算获取对应坐标的像素点
   * 一个像素点占 4 个位置，分别是 `R` `G` `B` `A`
   * width * 4 * y 是第 `y` 行的起始位置
   * x * 4 是第 `x` 列的起始位置
   * 然后加上 `i` 就是 `R` `G` `B` `A` 的位置
   */
  const index = (width * 4 * y) + (x * 4)

  for (let i = 0; i < 4; i++) {
    arr[i] = imgData[index + i]
  }

  return arr
}

/**
 * 美化 ctx.getImageData.data 属性  
 * 每一行为一个大数组，每个像素点为一个小数组
 * @param imgData ctx.getImageData 方法获取的 ImageData 对象的 data 属性
 * @param width 图像区域宽度
 */
export function parseImgData(imgData: ImageData['data'], width: number, height: number) {
  const arr: number[][][] = []

  for (let x = 0; x < width; x++) {
    const row: number[][] = []

    for (let y = 0; y < height; y++) {
      row.push(getPixel(x, y, imgData, width))
    }

    arr.push(row)
  }

  return arr as Pixel[][]
}

/** 给 canvas 某个像素点填充颜色的函数 */
export function fillPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, 1, 1)
}

/**
 * 设置字体，默认居中
 */
export function setFont(ctx: CanvasRenderingContext2D, {
  size = 16,
  family = 'sans-serif',
  weight = 'normal',
  textAlign = 'center',
  textBaseline = 'middle',
  color = '#000'
}: CtxFontOpt) {
  ctx.font = `${weight} ${size}px ${family}`
  ctx.textAlign = textAlign
  ctx.textBaseline = textBaseline
  ctx.fillStyle = color
}

/** 清除 canvas 整个画布的内容 */
export function clearAllCvs(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}


/** ======================================= DOM 工具 ======================================= */

/**
 * 判断图片的 src 是否可用，可用则返回图片
 * @param src 图片
 * @param setImg 图片加载前执行的回调函数
 */
export const getImg = (
  src: string,
  setImg?: (img: HTMLImageElement) => void
) => {
  const img = new Image()
  img.src = src
  setImg?.(img)

  return new Promise<false | HTMLImageElement>((resolve) => {
    img.onload = () => resolve(img)
    img.onerror = () => resolve(false)
  })
}

/** 获取浏览器内容宽度 */
export function getWinWidth() {
  return window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth
}
/** 获取浏览器内容高度 */
export function getWinHeight() {
  return window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
}

/**
 * 获取设备像素比，最大值为 2
 */
export const getDPR = (max = 2) => 1
//  Math.min(window.devicePixelRatio, max)

export type CtxFontOpt = {
  /** 字体大小，默认 16 */
  size?: number
  /** 字体，默认 sans-serif */
  family?: string
  /** 字重，默认 normal */
  weight?: string
  /** 水平位置，默认 center */
  textAlign?: CanvasTextAlign
  /** 基线，默认 middle */
  textBaseline?: CanvasTextBaseline
  /** 颜色，默认 #000 */
  color?: string
}
