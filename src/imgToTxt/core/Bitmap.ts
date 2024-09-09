import { getPixel } from '@/canvasTool/tools'
import { Pixel } from '@/types'


export class Bitmap {
    width: number
    height: number
    imgData: Uint8ClampedArray

    constructor(width: number, height: number, pixels: Uint8ClampedArray) {
        this.width = width
        this.height = height
        this.imgData = pixels
    }

    /**
     * 获取某个坐标的像素点信息
     */
    getPixelAt(x: number, y: number): Pixel {
        const rgba = getPixel(x, y, this.imgData, this.width)
        rgba[3] = +(rgba[3] / 255).toFixed(2)

        return rgba
    }
}
