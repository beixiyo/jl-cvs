import { createCvs, getImg, getPixel } from '@/canvasTool/tools'
import type { ImgToFadeOpts } from './types'
import { Ball } from '@/canvasTool/Ball'


/**
 * 让图片灰飞烟灭效果
 * @param bgCanvas 
 * @param opts 
 */
export async function imgToFade(bgCanvas: HTMLCanvasElement, opts: ImgToFadeOpts) {
    const {
        width,
        height,
        imgWidth,
        imgHeight,
        speed,
        img,
        extraDelCount,
        ballCount,
        bgc,
    } = await checkAndInit(opts)

    const bgCtx = bgCanvas.getContext('2d')!
    bgCanvas.width = width
    bgCanvas.height = height

    const { cvs: imgCvs, ctx: imgCtx } = createCvs(
        imgWidth, imgHeight,
    )

    imgCtx.drawImage(img, 0, 0, imgWidth, imgHeight)

    const destroyBalls: Ball[] = [],
        { data } = imgCtx.getImageData(0, 0, imgWidth, imgHeight),
        pixelIndexs: number[] = []

    for (let i = 0; i < data.length / 4; i++) {
        pixelIndexs.push(i)
    }

    drawPoint()


    function drawPoint() {
        /** 覆盖上背景先，再用图片画布填充指定像素点，形成灰飞烟灭效果 */
        bgCtx.fillStyle = bgc
        bgCtx.fillRect(0, 0, width, height)

        /** 居中绘制 */
        bgCtx.drawImage(
            imgCvs,
            ...getCenterPos(),
            imgWidth,
            imgHeight
        )

        createAndDelParticle(ballCount)
        drawDestroyBalls()
        requestAnimationFrame(drawPoint)
    }

    function getCenterPos(): [x: number, y: number] {
        return [
            (width - imgWidth) / 2,
            (height - imgHeight) / 2,
        ]
    }

    /**
     * 创建小球，并删除图片像素
     */
    function createAndDelParticle(size: number) {
        for (let i = 0; i < size; i++) {
            const [x, y, index] = getXY()
            const [R, G, B, A] = getPixel(x, y, data, imgWidth)
            const color = `rgba(${R}, ${G}, ${B}, ${A})`

            const [centerX, centerY] = getCenterPos()
            const point = new Ball(
                x + centerX,
                y + centerY,
                Math.random() * 2.2,
                color,
                bgCtx
            )
            // 记录当前消失的某个像素点
            destroyBalls.push(point)

            clearPixel(x, y, index)
            // 偷偷多删除一些像素点 不然消失的太慢了
            for (let i = 0; i < extraDelCount; i++) {
                const [x, y, index] = getXY()
                clearPixel(x, y, index)
            }
        }
    }

    /**
     * 批量绘制消失的像素点
     */
    function drawDestroyBalls() {
        for (let i = 0; i < destroyBalls.length; i++) {
            const ball = destroyBalls[i]

            ball.x += Math.random() * speed
            ball.y -= Math.random() * speed
            ball.count++
            ball.draw()

            // 大于这个距离，才删除此像素点，达到像素移动的效果
            if (ball.count > 100) {
                destroyBalls.splice(i, 1)
            }
        }
    }

    /**
     * 清除某个像素点 并删除像素点数组
     */
    function clearPixel(x: number, y: number, index: number) {
        imgCtx.clearRect(x, y, 1, 1)
        pixelIndexs.splice(index, 1)
    }

    /** 获取随机像素点坐标 */
    function getXY(): [x: number, y: number, index: number] {
        const
            /** 随机像素点索引 */
            index = Math.floor(Math.random() * pixelIndexs.length),
            /** 获取随机像素点 */
            pixelIndex = pixelIndexs[index],
            /** 数组位置对宽度取余，获取行 */
            x = pixelIndex % imgWidth,
            /** 数组位置整除宽度，获取列 */
            y = Math.floor(pixelIndex / imgWidth)

        return [x, y, index]
    }
}


async function checkAndInit(opts: ImgToFadeOpts) {
    const {
        src,
        speed = 1.25,
        width,
        height,
        imgWidth,
        imgHeight,
        extraDelCount = 20,
        ballCount = 15,
        bgc = '#000',
    } = opts

    if (
        imgWidth && imgWidth > width
        || imgHeight && imgHeight > height
    ) {
        throw new Error('图片大小不能大于容器')
    }

    const img = await getImg(src)
    if (!img) {
        throw new Error('图片不可用')
    }

    imgWidth && (img.width = imgWidth)
    imgHeight && (img.height = imgHeight)

    return {
        width,
        height,
        imgWidth: img.width,
        imgHeight: img.height,
        speed,
        img,
        bgc,
        extraDelCount,
        ballCount,
    }
}