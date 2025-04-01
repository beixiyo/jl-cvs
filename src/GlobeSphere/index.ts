import { colorAddOpacity, debounce } from '@jl-org/tool'

/**
 * 用小点绘制一个旋转的球体
 * @example
 * const canvas = document.createElement('canvas')
 * document.body.appendChild(canvas)
 * Object.assign(document.body.style, {
 *   overflow: 'hidden',
 *   margin: 0,
 *   padding: 0,
 *   background: '#181818',
 * })
 *
 * new GlobeSphere(canvas)
 */
export class GlobeSphere {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private points: [number, number, number][] = []
  private animationFrame: number = 0
  private rotation: number = 0
  private width: number
  private height: number
  private dpr: number
  private onResizeDebounce: (width: number, height: number) => void

  private options: Required<GlobeSphereOpts>

  constructor(canvas: HTMLCanvasElement, opts?: GlobeSphereOpts) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')!
    this.ctx = ctx

    const defaultOpts: Required<GlobeSphereOpts> = {
      width: window.innerWidth,
      height: window.innerHeight,
      pointCount: 1000,
      radius: 180,
      rotationSpeed: 0.001,
      pointSize: 1,
      pointColor: 'rgb(100, 150, 255)',
      pointOpacity: 0.8,
      perspectiveDistance: 400,
      resizeDebounceTime: 80,
    }

    this.options = {
      ...defaultOpts,
      ...opts
    }

    this.width = this.options.width
    this.height = this.options.height
    this.dpr = window.devicePixelRatio || 1
    this.onResizeDebounce = debounce(this._onResize.bind(this), this.options.resizeDebounceTime)

    this.initCanvas()
    this.generatePoints()
    this.startAnimation()
  }

  private initCanvas() {
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.ctx.scale(this.dpr, this.dpr)
  }

  private generatePoints() {
    const { pointCount, radius } = this.options
    this.points = []

    for (let i = 0; i < pointCount; i++) {
      const phi = Math.acos(1 - 2 * (i / pointCount))
      const theta = Math.PI * 2 * i * (1 / 1.618033988749895)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      this.points.push([x, y, z])
    }
  }

  private animate = () => {
    const { radius, rotationSpeed, pointSize, pointColor, pointOpacity, perspectiveDistance } = this.options

    this.ctx.clearRect(0, 0, this.width, this.height)
    this.rotation += rotationSpeed

    const centerX = this.width / 2
    const centerY = this.height / 2

    const sortedPoints = [...this.points].sort((a, b) => {
      const aZ = a[2] * Math.cos(this.rotation) - a[0] * Math.sin(this.rotation)
      const bZ = b[2] * Math.cos(this.rotation) - b[0] * Math.sin(this.rotation)
      return aZ - bZ
    })

    sortedPoints.forEach(([x, y, z]) => {
      const rotatedX = x * Math.cos(this.rotation) + z * Math.sin(this.rotation)
      const rotatedZ = z * Math.cos(this.rotation) - x * Math.sin(this.rotation)

      const scale = perspectiveDistance / (perspectiveDistance + rotatedZ)
      const projectedX = centerX + rotatedX * scale
      const projectedY = centerY + y * scale

      const opacity = (rotatedZ + radius) / (radius * 2)

      this.ctx.beginPath()
      this.ctx.arc(projectedX, projectedY, pointSize, 0, Math.PI * 2)
      const color = colorAddOpacity(pointColor, opacity * pointOpacity)
      this.ctx.fillStyle = color
      this.ctx.fill()
    })

    this.animationFrame = requestAnimationFrame(this.animate)
  }

  /** 开始动画 */
  public startAnimation() {
    this.animate()
  }

  /** 停止动画 */
  public stopAnimation() {
    cancelAnimationFrame(this.animationFrame)
  }

  /** 调整大小 */
  public onResize(width: number, height: number): void {
    this.onResizeDebounce(width, height)
  }

  private _onResize(newWidth: number, newHeight: number) {
    this.width = newWidth
    this.height = newHeight

    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.ctx.scale(this.dpr, this.dpr)
  }

  /** 更新配置 */
  public updateOptions(opts: Partial<GlobeSphereOpts>) {
    this.options = { ...this.options, ...opts }
    if (opts.pointCount || opts.radius) {
      this.generatePoints()
    }
  }
}


export type GlobeSphereOpts = {
  /** Canvas 宽度 */
  width?: number
  /** Canvas 高度 */
  height?: number
  /** 球体上的点数量 */
  pointCount?: number
  /** 球体半径 */
  radius?: number
  /** 旋转速度 */
  rotationSpeed?: number
  /** 点的大小 */
  pointSize?: number
  /** 点的颜色 */
  pointColor?: string
  /** 点的不透明度 */
  pointOpacity?: number
  /** 透视距离 */
  perspectiveDistance?: number
  /** resize 防抖时间 */
  resizeDebounceTime?: number
}
