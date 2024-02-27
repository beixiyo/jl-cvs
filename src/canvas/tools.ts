/** 弧度 */
const RADIAN = Math.PI / 180
/**
 * 根据半径和角度获取坐标
 * @param r 半径
 * @param deg 角度
 */
export function calcCoord(r: number, deg: number) {
    const x = Math.sin(deg * RADIAN) * r,
        // 数学坐标系和图像坐标系相反
        y = -Math.cos(deg * RADIAN) * r
    return [x, y]
}


/**
 * 创建一个指定宽高的画布
 * @param width 画布的宽度
 * @param height 画布的高度
 * @returns 包含画布和上下文的对象
 */
export function createCvs(width: number, height: number) {
    const cvs = document.createElement('canvas'),
        ctx = cvs.getContext('2d')
    cvs.width = width
    cvs.height = height

    return { cvs, ctx }
}

/**
 * 取出`canvas`用一维数组描述的颜色中 某个坐标的`RGBA`数组  
 * 注意坐标从 0 开始
 * @param x 宽度中的第几列
 * @param y 高度中的第几行
 * @param imgData ctx.getImageData 方法获取的 ImageData 对象的 data 属性
 * @param width 图像区域宽度
 * @returns `RGBA`数组
 */
export function getPixel(x: number, y: number, imgData: ImageData['data'], width: number) {
    const arr: number[] = []
    for (let i = 0; i < 4; i++) {
        /**
         * 一个像素点的`RGBA`数据在`imgData`中是连续的
         * 每个像素点占用`4`个位置
         * 所以`y * width + x`是 第`y`行第`x`列的像素点在`imgData`中的起始位置
         * `* 4`是因为每个像素点占用`4`个位置
         * `+ i`是因为`RGBA`数据是连续的
         * 所以`imgData[(y * width + x) * 4 + i]`就是第`y`行第`x`列的像素点的第`i`个数据
         */
        arr.push(imgData[(y * width + x) * 4 + i])
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

    return arr
}

/** 给 canvas 某个像素点填充颜色的函数 */
export function fillPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
}

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
): CutImgReturn<T> {
    img.setAttribute('crossOrigin', 'anonymous')
    const { cvs, ctx } = createCvs(width, height)
    const { type, quality } = opts
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

    if (resType === 'base64' || resType === undefined) {
        return Promise.resolve(cvs.toDataURL(type, quality)) as CutImgReturn<T>
    }

    return new Promise<Blob>((resolve) => {
        cvs.toBlob(
            blob => {
                resolve(blob)
            },
            type,
            quality
        )
    }) as CutImgReturn<T>
}



type TransferType = 'base64' | 'blob'
type CutImgReturn<T extends TransferType> = 
    T extends 'blob' 
    ? Promise<Blob>
    : Promise<string>
