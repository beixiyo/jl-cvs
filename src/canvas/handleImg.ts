import { createCvs } from './tools'


/**
 * 截取图片的一部分，返回 base64 | blob
 */
export function cutImg<T extends TransferType>(
    img: HTMLImageElement,
    resType: T,
    x = 0,
    y = 0,
    width = img.width,
    height = img.height,
    opts: {
        type?: 'image/png' | 'image/jpeg' | 'image/webp',
        quality?: number,
    } = {},
): HandleImgReturn<T> {
    img.setAttribute('crossOrigin', 'anonymous')
    const { cvs, ctx } = createCvs(width, height)
    const { type, quality } = opts
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

    if (resType === 'base64') {
        return Promise.resolve(cvs.toDataURL(type, quality)) as HandleImgReturn<T>
    }

    return new Promise<Blob>((resolve) => {
        cvs.toBlob(
            blob => {
                resolve(blob)
            },
            type,
            quality
        )
    }) as HandleImgReturn<T>
}


/**
 * 压缩图片，`image/jpeg | image/webp` 才能压缩
 * @param img 图片
 * @param quality 压缩质量
 * @param resType 需要返回的文件格式
 * @returns base64 | blob
 */
export function compressImg<T extends TransferType>(
    img: HTMLImageElement,
    resType: T,
    quality = .5
): HandleImgReturn<T> {
    const { cvs, ctx } = createCvs(img.width, img.height)
    ctx.drawImage(img, 0, 0)

    if (resType === 'base64') {
        return Promise.resolve(cvs.toDataURL('image/webp', quality)) as HandleImgReturn<T>
    }

    return new Promise((resolve) => {
        cvs.toBlob(
            (blob) => {
                resolve(blob)
            },
            'image/webp',
            quality
        )
    }) as HandleImgReturn<T>
}


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



export type TransferType = 'base64' | 'blob'
export type HandleImgReturn<T extends TransferType> =
    T extends 'blob'
    ? Promise<Blob>
    : Promise<string>
    