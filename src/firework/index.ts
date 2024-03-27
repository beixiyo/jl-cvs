import { getWinHeight, getWinWidth } from '@/canvasTool/tools'
import { Firework } from './Firework'


/**
 * 放烟花，返回一个取消函数
 */
export function initFirework(
    cvs: HTMLCanvasElement,
    opts?: FireworkOpts
) {
    const
        fireworkArr = [],
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
    }


    function update(ctx: CanvasRenderingContext2D, opts: Required<FireworkOpts>) {
        clear(ctx)

        const { x, y, r, speed } = opts
        const curTime = Date.now()

        if (curTime - time > 100) {
            time = curTime
            const fw = new Firework(ctx, x, y, r, speed)
            fireworkArr.push(fw)
        }
        if (fireworkArr.length > 3) {
            bombArr.push(fireworkArr.shift())
        }
        if (bombArr.length > 3) {
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

function clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, innerWidth, innerHeight)
}

function normalizeOpts(opts: FireworkOpts) {
    const [x, y] = getPos()
    return Object.assign(
        {},
        {
            x,
            y,
            width: getWinWidth(),
            height: getWinHeight(),
            speed: 3,
            r: 6
        },
        opts
    )
}


type FireworkOpts = {
    x?: number
    y?: number
    width?: number
    height?: number
    /** 运动速度 */
    speed?: number
    /** 烟花小球半径 */
    r?: number
}
