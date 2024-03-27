import { getColor } from './color'


export class Ball {
    /**
     * 在 canvas 上下文绘制一个球
     * @param x x 坐标
     * @param y y 坐标
     * @param r 半径
     * @param color 默认随机颜色
     * @param ctx 可选参数，传递上下文
     */
    constructor(
        public x: number,
        public y: number,
        public r: number,
        public color = getColor(),
        public ctx?: CanvasRenderingContext2D
    ) {

    }

    /**
     * @param ctx 指定绘制上下文
     */
    draw(ctx?: CanvasRenderingContext2D) {
        const _ctx = ctx || this.ctx
        if (!ctx) {
            throw new Error('必须传递上下文（Context must be passed）')
        }

        _ctx.beginPath()
        _ctx.fillStyle = this.color
        _ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        _ctx.fill()
    }
}
