import { clearAllCvs, getWinHeight, getWinWidth } from '@/canvasTool/tools'
import { Firework } from './Firework'
import { getColor } from '@/canvasTool/color'


/**
 * 放烟花，返回一个取消函数
 */
export function createFirework(
    cvs: HTMLCanvasElement,
    opts?: FireworkOpts
) {
    const
        /** 烟花对象数组 */
        fireworkArr = [],
        /** 即将爆炸的烟花数组 */
        bombArr = [],
        ctx = cvs.getContext('2d'),
        _opts = normalizeOpts(opts)

    let time = Date.now(),
        id = null

    cvs.width = _opts.width
    cvs.height = _opts.height

    /* 坐标系改为从下往上 */
    ctx.translate(0, cvs.height)
    ctx.scale(1, -1)

    update(ctx, _opts)

    return () => {
        fireworkArr.splice(0)
        bombArr.splice(0)
        cancelAnimationFrame(id)
        clearAllCvs(ctx, cvs)
    }


    function update(ctx: CanvasRenderingContext2D, opts: Required<FireworkOpts>) {
        clearAllCvs(ctx, cvs)

        const {
            r,
            speed,
            ballCount,
            gapTime,
            maxCount,
            width,
            yRange,
            getFireworkColor,
            getBoomColor
        } = opts
        const curTime = Date.now()
        const [x, y] = getPos(width, yRange)

        /** 烟花间隔时间 */
        if (curTime - time > gapTime) {
            time = curTime
            const fw = new Firework(
                ctx,
                x, y,
                ballCount,
                getFireworkColor,
                getBoomColor,
                r, speed
            )
            fireworkArr.push(fw)
        }
        if (fireworkArr.length > maxCount) {
            bombArr.push(fireworkArr.shift())
        }
        if (bombArr.length > maxCount) {
            bombArr.shift()
        }

        fireworkArr.forEach(fw => {
            fw.draw()
            fw.y += speed
            fw.opacity -= .01
        })
        bombArr.forEach((bombBall) => bombBall.bomb())

        id = requestAnimationFrame(() => {
            update(ctx, opts)
        })
    }
}


/** 工具 -------------------------------------------------------------------------------------------- */
function getPos(width: number, yRange: number): [number, number] {
    return [Math.random() * width, Math.random() * yRange]
}

function normalizeOpts(opts: FireworkOpts): Required<FireworkOpts> {
    return Object.assign(
        {},
        {
            width: getWinWidth(),
            height: getWinHeight(),
            yRange: 50,
            speed: 2.5,
            r: 6,
            ballCount: 150,
            gapTime: 500,
            maxCount: 2,
            getFireworkColor: (opacity: number) => `rgba(210, 250, 90, ${opacity})`,
            getBoomColor: getColor
        },
        opts
    )
}


export type FireworkOpts = {
    width?: number
    height?: number
    /** 
     * 烟花出现的范围，默认 50  
     * **这个 y 轴和 DOM 的 y 轴相反**  
     * 即高度以外 50 到可见范围内随机  
     */
    yRange?: number,
    /** 运动速度，默认 2.5 */
    speed?: number
    /** 烟花小球半径，默认 6 */
    r?: number
    /** 烟花小球数量，默认 150 */
    ballCount?: number
    /** 烟花间隔时间，默认 500 ms */
    gapTime?: number
    /** 同时存在最大的烟花数量（超过则爆炸）默认 2 */
    maxCount?: number
    /** 
     * 烟花的颜色，注意不是爆炸后小球的颜色  
     * 需要接收一个透明度，返回一个 rgba 颜色
     */
    getFireworkColor?: (opacity: number) => string
    /** 烟花爆炸小球的颜色，默认随机 */
    getBoomColor?: () => string
}
