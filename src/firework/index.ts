import { clearAllCvs, getWinHeight, getWinWidth } from '@/canvasTool/tools'
import { Firework } from './Firework'


/**
 * 放烟花，返回一个取消函数
 */
export function initFirework(
    cvs: HTMLCanvasElement
) {
    const
        /** 烟花对象数组 */
        fireworkArr = [],
        /** 即将爆炸的烟花数组 */
        bombArr = [],
        ctx = cvs.getContext('2d'),
        _opts = normalizeOpts({})

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

        const { r, speed, ballCount, gapTime, maxCount } = opts
        const curTime = Date.now()
        const [x, y] = getPos()

        /** 烟花间隔时间 */
        if (curTime - time > gapTime) {
            time = curTime
            const fw = new Firework(ctx, x, y, ballCount, r, speed)
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
function getPos(): [number, number] {
    return [Math.random() * innerWidth, Math.random() * 120]
}

function normalizeOpts(opts: FireworkOpts) {
    return Object.assign(
        {},
        {
            width: getWinWidth(),
            height: getWinHeight(),
            speed: 3,
            r: 6,
            ballCount: 150,
            gapTime: 1000,
            maxCount: 3,
        },
        opts
    )
}


export type FireworkOpts = {
    width?: number
    height?: number
    /** 运动速度 */
    speed?: number
    /** 烟花小球半径 */
    r?: number
    /** 烟花数量，默认 150 */
    ballCount?: number
    /** 烟花间隔时间，默认 1000 ms */
    gapTime?: number
    /** 同时存在最大的烟花数量，默认 3*/
    maxCount?: number
}
