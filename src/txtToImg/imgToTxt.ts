import { BaseSource, createSource } from './core/source'
import { Painter, PainterOptions } from './core/Painter'


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
        painterOption.source = createSource({
            fontFamily: opts.fontFamily || 'Microsoft YaHei',
            txt: opts.txt,
            fontSize: opts.fontSize || 200,
        })
    }
    else if (opts.img) {
        const img = await createImage(opts.img)
        let width = opts.width || img.width,
            height = opts.height || img.height
        if (opts.width && !opts.height) {
            height = (width / img.width) * img.height
        } else if (opts.height && !opts.width) {
            width = (height / img.height) * img.width
        }
        painterOption.source = createSource({
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
        } else if (opts.height && !opts.width) {
            width = (height / video.videoHeight) * video.videoWidth
        }
        painterOption.source = createSource({
            video,
            width,
            height,
        })
        painterOption.isDynamic = true
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

    options.replaceText = options.replaceText ?? '6'
    options.raduis = options.raduis ?? 10
    options.isDynamic = !!options.isDynamic
    options.isGray = !!options.isGray
    if (!options.opts) {
        throw new Error('require "opts" option')
    }
}

function createImage(src: string | HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        if (src instanceof HTMLImageElement) {
            resolve(src)
            return
        }

        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
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
    replaceText?: string
    raduis?: number
    opts: {
        img?: HTMLImageElement | string
        video?: HTMLVideoElement | string
        fontFamily?: string
        fontSize?: number
        txt?: string
        width?: number
        height?: number
    }
    /** 是否动态，视频默认动态 */
    isDynamic?: boolean
    /** 开启灰度 */
    isGray?: boolean
}
