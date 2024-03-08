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
         * canvas 的像素点是一维数组，需要通过计算获取对应坐标的像素点
         * 一个像素点占 4 个位置，分别是 `R` `G` `B` `A`
         * width * 4 * y 是第 `y` 行的起始位置
         * x * 4 是第 `x` 列的起始位置
         * 然后加上 `i` 就是 `R` `G` `B` `A` 的位置
         */
        const index = (width * 4 * y) + (x * 4)
        arr.push(imgData[index + i])
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
 * 获取随机范围整型数值 不包含最大值
 */
export function getRandomNum(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}
