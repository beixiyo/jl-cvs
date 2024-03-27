import { Ball } from '@/canvasTool/Ball'
import { getColor } from '@/canvasTool/color'


/* config */
const SPEED = 3,
    WIDTH = innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    HEIGHT = innerHeight || document.documentElement.clientHeight || document.body.clientHeight


class Firework {
    private opacity = 1

    private bombCount = 300
    private bombArr = []
    private ballArr = []

    constructor(
        public ctx: CanvasRenderingContext2D,
        public x: number,
        public y: number,
        public r = 6
    ) { }

    draw() {
        if (this.ballArr.length) {
            return this.ballArr.forEach((ball, i) => {
                ball.y += SPEED
                ball.color = getFireworkColor(this.opacity - i / 100)
                ball.draw(this.ctx)
            })
        }

        /* 自上而下绘制 */
        for (let i = 0; i < 100; i++) {
            const r = this.r - i / 20
            const ball = new Ball(
                this.x,
                this.y - i,
                r < .1 ? .1 : r,
                getFireworkColor(this.opacity - i / 100)
            )

            ball.draw(this.ctx)
            this.ballArr.push(ball)
        }
    }

    bomb() {
        if (this.bombArr.length) {
            this.bombArr.forEach((bomb) => bomb.update())
        }
        else {
            // 每个球的弧度
            const radian = Math.PI * 2 / this.bombCount

            for (let i = 0; i < this.bombCount; i++) {
                const dirX = Math.cos(radian * i) * Math.random() * 3,
                    dirY = Math.sin(radian * i) * Math.random() * 3

                const bombBall = new BombBall(
                    this.ctx,
                    this.x,
                    this.y,
                    dirX,
                    dirY
                )
                bombBall.draw()
                this.bombArr.push(bombBall)
            }
        }
    }
}

class BombBall {

    /**
     * 绘制一个爆炸开的球
     * @param ctx 上下文
     * @param x x 坐标
     * @param y y 坐标
     * @param dirX x 移动方向
     * @param dirY y 移动方向
     * @param color 颜色，默认随机
     * @param r 小球半径
     */
    constructor(
        public ctx: CanvasRenderingContext2D,
        public x: number,
        public y: number,
        public dirX: number,
        public dirY: number,
        public color: string = getColor(),
        public r: number = 3,
    ) { }

    draw() {
        this.ctx.beginPath()
        this.ctx.fillStyle = this.color
        this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        this.ctx.fill()
    }

    update() {
        this.x += this.dirX
        this.y += this.dirY
        this.dirX *= 0.99
        this.dirY *= 0.99

        this.draw()
    }
}


/** 工具 -------------------------------------------------------------------------------------------- */
function getPos(): [number, number] {
    return [Math.random() * innerWidth, Math.random() * 120]
}

function getFireworkColor(opacity: number) {
    return `rgba(200, 200, 50, ${opacity})`
}

function clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, innerWidth, innerHeight)
}


/** 初始化 -------------------------------------------------------------------------------------------- */
const fireworkArr = [],
    bombArr = []
let timer = 0,
    play = true

function move(ctx: CanvasRenderingContext2D) {
    clear(ctx)
    if (!play) return

    if (timer++ % 50 === 0) {
        const fw = new Firework(ctx, ...getPos())
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
        fw.y += SPEED
        fw.opacity -= .01
    })
    bombArr.forEach((bombBall) => bombBall.bomb())

    requestAnimationFrame(() => {
        move(ctx)
    })
}

/**
 * 放烟花
 * @param cvs
 */
export function initFirework(cvs: HTMLCanvasElement) {
    const ctx = cvs.getContext('2d')

    cvs.width = WIDTH
    cvs.height = HEIGHT
    play = true

    /* 坐标系改为从下往上 */
    ctx.translate(0, cvs.height)
    ctx.scale(1, -1)
    document.body.appendChild(cvs)

    move(ctx)

    return () => {
        play = false
    }
}