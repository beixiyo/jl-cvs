import { createCvs } from './tools'
import { TransferType } from '@/types'


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
    opts: CvsToDataOpts = {},
): HandleImgReturn<T> {
    img.setAttribute('crossOrigin', 'anonymous')
    const { cvs, ctx } = createCvs(width, height)
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

    return cvsToBlobOrBase64(cvs, resType, opts)
}


/**
 * 压缩图片
 * @param img 图片
 * @param resType 需要返回的文件格式
 * @param quality 压缩质量，默认 0.5
 * @param mimeType 图片类型，默认 `image/webp`。`image/jpeg | image/webp` 才能压缩，
 * @returns base64 | blob
 */
export function compressImg<T extends TransferType>(
    img: HTMLImageElement,
    resType: T,
    quality = .5,
    mimeType: 'image/jpeg' | 'image/webp' = 'image/webp'
): HandleImgReturn<T> {
    const { cvs, ctx } = createCvs(img.width, img.height)
    ctx.drawImage(img, 0, 0)

    return cvsToBlobOrBase64(cvs, resType, {
        type: mimeType,
        quality
    })
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
        _fontSize = fontSize * devicePixelRatio,
        font = _fontSize + 'px serif'

    // 获取文字宽度
    ctx.font = font
    const { width } = ctx.measureText(text)
    const canvasSize = Math.max(100, width) + gap * devicePixelRatio

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
        size: canvasSize / devicePixelRatio,
    }
}


/**
 * 根据类型，自动推导转换类型，提供完整的 TS 类型推断
 * @param cvs 画板
 * @param type 转换类型
 * @param opts 转换配置，同 Canvas.toDataURL
 * @returns 
 */
export function cvsToBlobOrBase64<T extends TransferType>(
    cvs: HTMLCanvasElement,
    type: T,
    opts?: CvsToDataOpts
): HandleImgReturn<T> {
    if (type === 'base64') {
        return Promise.resolve(cvs.toDataURL(
            opts?.type,
            opts?.quality
        )) as HandleImgReturn<T>
    }

    return new Promise<Blob>((resolve) => {
        cvs.toBlob(
            blob => {
                resolve(blob)
            },
            opts.type,
            opts.quality
        )
    }) as HandleImgReturn<T>
}


/** Blob 转 Base64 */
export function blobToBase64(blob: Blob) {
    const fr = new FileReader()
    fr.readAsDataURL(blob)

    return new Promise<string>((resolve) => {
        fr.onload = function () {
            resolve(this.result as string)
        }
    })
}


/** ======================= Type ========================= */

export type HandleImgReturn<T extends TransferType> =
    T extends 'blob'
    ? Promise<Blob>
    : Promise<string>

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

