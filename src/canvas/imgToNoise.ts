import { createCvs } from './tools'

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
        data[i] = Math.min(Math.max(Math.round(red), 0), 255)
        data[i + 1] = Math.min(Math.max(Math.round(green), 0), 255)
        data[i + 2] = Math.min(Math.max(Math.round(blue), 0), 255)
    }

    ctx.putImageData(imgData, 0, 0)
    return cvs
}
