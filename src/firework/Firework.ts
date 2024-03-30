import { Ball } from '@/canvasTool/Ball'
import { BombBall } from './BombBall'
import { getColor } from '@/canvasTool/color'


export class Firework {
    public opacity = 1
    private startTime: number

    private bombArr = []
    private ballArr = []

    constructor(
        public ctx: CanvasRenderingContext2D,
        public x: number,
        public y: number,
        private bombCount: number,
        private getFireworkColor: (opacity: number) => string,
        private getBoomColor = getColor,
        public r = 6,
        public speed = 2.5,
    ) {
        this.startTime = Date.now()
    }

    draw() {
        if (this.ballArr.length) {
            return this.ballArr.forEach((ball, i) => {
                ball.y += this.speed
                ball.color = this.getFireworkColor(this.opacity - i / 100)
                ball.draw(this.ctx)
            })
        }

        /**
         * 自上而下绘制
         * 通过 80 个小球，偏移 y 轴，绘制出一条烟花
         * 每次绘制的小球半径减小，透明度减小
         */
        for (let i = 0; i < 80; i++) {
            const r = this.r - i / 20
            const ball = new Ball(
                this.x,
                this.y - i,
                r < .1 ? .1 : r,
                this.getFireworkColor(this.opacity - i / 100)
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
                    dirY,
                    this.getBoomColor()
                )
                bombBall.draw()
                this.bombArr.push(bombBall)
            }
        }
    }

    /** 获取创建到现在的间隔时间 */
    getDiffTime() {
        return Date.now() - this.startTime
    }
}
