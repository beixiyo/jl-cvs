import { BaseSource, createSource } from './core/source'
import { Painter, PainterOptions } from './core/Painter'
import { getImg } from '..'


/**
 * 用文本来绘制图片或视频
 */
export async function imgToTxt(options: TxtImgOpt) {
    normalizeOptions(options)

    const { opts } = options
    let painterOption: TxtImgOpt & {
        /** BaseSource 类，里面对 canvas 进行了初始化 */
        source: BaseSource
    } = { ...options } as any

    if (opts.txt) {
        const txtStyle = opts.txtStyle as Required<TxtImgOpt['opts']['txtStyle']>
        painterOption.source = createSource(painterOption.isDynamic, {
            ...txtStyle,
            txt: opts.txt,
        })
    }
    else if (opts.img) {
        const img = await createImage(opts.img)
        if (!img) return console.error('img not found')

        let width = opts.width || img.width,
            height = opts.height || img.height

        if (opts.width && !opts.height) {
            height = (width / img.width) * img.height
        } else if (opts.height && !opts.width) {
            width = (height / img.height) * img.width
        }

        painterOption.source = createSource(painterOption.isDynamic, {
            img,
            width,
            height,
        })
    }
    else if (opts.video) {
        const video = await createVideo(opts.video)
        let width = opts.width || video.videoWidth,
            height = opts.height || video.videoHeight

        if (opts.width && !opts.height) {
            height = (width / video.videoWidth) * video.videoHeight
        }
        else if (opts.height && !opts.width) {
            width = (height / video.videoHeight) * video.videoWidth
        }

        painterOption.isDynamic = true
        painterOption.source = createSource(painterOption.isDynamic, {
            video,
            width,
            height,
        })
    }

    const painter = new Painter(painterOption as PainterOptions)
    painter.fps()

    return {
        start() {
            painter.fps()
        },
        stop() {
            painter.stop()
        },
    }
}


function normalizeOptions(options: TxtImgOpt) {
    if (!options) {
        throw new Error('require options')
    }
    if (!options.canvas) {
        throw new Error('require "canvas" option')
    }

    const { txtStyle = {} } = options.opts
    txtStyle.color = txtStyle.color ?? '#000'
    txtStyle.size = txtStyle.size ?? 200
    txtStyle.family = txtStyle.family ?? 'Microsoft YaHei'

    options.replaceText = options.replaceText ?? '6'
    options.gap = options.gap ?? 10
    options.isDynamic = !!options.isDynamic
    options.isGray = !!options.isGray
    if (!options.opts) {
        throw new Error('require "opts" option')
    }
}

function createImage(src: string | HTMLImageElement): Promise<HTMLImageElement | false> {
    if (src instanceof HTMLImageElement) {
        return Promise.resolve(src)
    }

    return getImg(src)
}

function createVideo(src: string | HTMLVideoElement): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
        if (src instanceof HTMLVideoElement) {
            resolve(src)
            return
        }

        const video = document.createElement('video')
        video.oncanplay = () => resolve(video)
        video.onerror = reject
        video.src = src
    })
}


export type TxtImgOpt = {
    canvas: HTMLCanvasElement
    /** 用什么文本填充绘制区域 */
    replaceText?: string
    /** 间隙，如果设置的太小，将耗费大量性能 */
    gap?: number
    opts: {
        img?: HTMLImageElement | string
        video?: HTMLVideoElement | string
        txtStyle?: {
            family?: string
            size?: number
            color?: string
        }
        /** 绘制的文本内容 */
        txt?: string
        width?: number
        height?: number
    }
    /** 是否动态，视频默认动态 */
    isDynamic?: boolean
    /** 开启灰度 */
    isGray?: boolean
}
