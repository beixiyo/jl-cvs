export {
  calcCoord,
  createCvs,
  eachPixel,
  fillPixel,
  getImgData,
  getImgDataIndex,
  getPixel,
  getWinHeight,
  getWinWidth,
  parseImgData,
  scaleImgData,
} from '@jl-org/tool'

/**
 * 设置字体，默认居中
 */
export function setFont(
  ctx: CanvasRenderingContext2D,
  options: CtxFontOpt,
) {
  const {
    size = 16,
    family = 'sans-serif',
    weight = 'normal',
    textAlign = 'center',
    textBaseline = 'middle',
    color = '#000',
  } = options

  ctx.font = `${weight} ${size}px ${family}`
  ctx.textAlign = textAlign
  ctx.textBaseline = textBaseline
  ctx.fillStyle = color
}

/** 清除 canvas 整个画布的内容 */
export function clearAllCvs(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

/**
 * 获取设备像素比，最大值默认为 2
 */
export const getDPR = (max = 2) => Math.min(window.devicePixelRatio, max)

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
