import { getColor } from '@/canvasTool/color'

export class BombBall {
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
