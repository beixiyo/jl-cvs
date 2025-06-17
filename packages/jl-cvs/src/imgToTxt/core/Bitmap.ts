import type { Pixel } from '@jl-org/tool'
import { getPixel } from '@/canvasTool'

export class Bitmap {
  width: number
  height: number
  imgData: ImageData

  constructor(imgData: ImageData) {
    this.width = imgData.width
    this.height = imgData.height
    this.imgData = imgData
  }

  /**
   * 获取某个坐标的像素点信息
   */
  getPixelAt(x: number, y: number): Pixel {
    const rgba = getPixel(x, y, this.imgData)
    rgba[3] = +(rgba[3] / 255).toFixed(2)

    return rgba
  }
}
