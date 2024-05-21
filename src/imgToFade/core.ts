import { getImg, getRandomNum, createCvs, parseImgData } from '@/canvasTool/tools'
import type { ImgToFadeOpts } from './types'
import type { Pixel } from '@/types'
import { Ball } from '@/canvasTool/Ball'


const DEL_NUM = 10

export async function imgToFade(cvs: HTMLCanvasElement, opts: ImgToFadeOpts) {
    const {
        src,
        speed = 1.05,
        width,
        height,
        r = () => Math.random()
    } = opts

    const img = await getImg(src)
    if (!img) {
        return console.log('图片不可用（img.src is null）')
    }

    width && (img.width = width)
    height && (img.height = height)
    const w = img.width
    const h = img.height

    const destroyBalls: Ball[] = []
    const ctx = cvs.getContext('2d', { willReadFrequently: true })!
    cvs.width = w
    cvs.height = h

    ctx.drawImage(img, 0, 0, w, h)
    const imgData = ctx.getImageData(0, 0, w, h)
    const pixels = parseImgData(imgData.data, w, h)

    drawPoint()


    function drawPoint() {
        createAndDelParticle(20)
        drawDestroyBalls()
        requestAnimationFrame(drawPoint)
    }

    /**
     * 创建小球，并删除图片像素
     * @param num 
     */
    function createAndDelParticle(num: number) {
        for (let i = 0; i < num; i++) {
            const [x, y, [R, G, B, A]] = getXY()

            const c = `rgba(${R}, ${G}, ${B}, ${A})`

            const point = new Ball(
                x,
                y,
                r(),
                c,
                ctx
            )
            // 记录当前消失的某个像素点
            destroyBalls.push(point)

            clearPixel(x, y)
            // 偷偷多删除一些像素点 不然消失的太慢了
            for (let i = 0; i < DEL_NUM; i++) {
                const [x, y] = getXY()
                clearPixel(x, y)
            }
        }
    }

    /**
     * 批量绘制消失的像素点
     */
    function drawDestroyBalls() {
        for (let i = 0; i < destroyBalls.length; i++) {
            const ball = destroyBalls[i]
            ball.draw()

            ball.x += Math.random()
            ball.y -= Math.random()
            ball.count++

            // 大于这个距离，才删除此像素点，达到像素移动的效果
            if (ball.count > 50) {
                destroyBalls.splice(i, 1)
            }
        }
    }

    /**
     * 清除某个像素点 并删除像素点数组
     */
    function clearPixel(x: number, y: number) {
        ctx.clearRect(x, y, 1, 1)
        pixels[x].splice(y, 1)
    }

    /** 获取随机像素点坐标 */
    function getXY(): [x: number, y: number, pixel: Pixel] {
        const x = getRandomNum(0, w),
            y = getRandomNum(0, h)
        return [x, y, pixels[x][y]]
    }
}