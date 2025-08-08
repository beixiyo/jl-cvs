import type { ShapeMeta } from '../BaseShape'
import type { ShapeStyle } from '../type'
import { BaseShape } from '../BaseShape'

/**
 * 箭头图形类，实现BaseShape接口
 */
export class Arrow extends BaseShape {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

  startX: number
  startY: number
  endX: number
  endY: number

  shapeStyle: ShapeStyle = {}

  /**
   * 箭头头部长度（可调整）
   * @default 10
   */
  private headLength: number = 10

  /**
   * 箭头头部与主线的夹角（弧度制）
   * @default Math.PI / 6 (30度)
   */
  private headAngle: number = Math.PI / 6

  /**
   * 构造函数
   * @param opts 箭头配置选项
   */
  constructor(opts: ArrowOpts) {
    super(opts)
    this.ctx = opts.ctx
    /** 默认线条端点为圆形，可根据需要改为'butt'或'square' */
    this.ctx.lineCap = 'round'

    this.startX = opts.startX
    this.startY = opts.startY
    this.endX = opts.startX // 初始时终点与起点相同
    this.endY = opts.startY

    /** 使用提供的样式初始化，必要时应用默认值 */
    this.setShapeStyle(opts.shapeStyle)
  }

  /**
   * 绘制箭头图形
   * @param ctx - 可选的 Canvas 渲染上下文
   */
  draw(ctx = this.ctx): void {
    const { startX, startY, endX, endY } = this

    /** 直接使用逻辑坐标 - ctx已经被DPR缩放 */
    const angle = Math.atan2(endY - startY, endX - startX)

    /** 应用shapeStyle中的样式（确保这些是逻辑值） */
    ctx.lineWidth = this.shapeStyle.lineWidth || 1
    ctx.strokeStyle = this.shapeStyle.strokeStyle || '#000000'
    ctx.fillStyle = this.shapeStyle.fillStyle || ctx.strokeStyle // 箭头填充色默认为描边颜色

    /**
     * 计算主线缩短后的终点
     * 防止主线与箭头头部重叠
     */
    const shortenBy = this.headLength * 1 // 根据需要调整此系数
    const shortenedEndX = endX - shortenBy * Math.cos(angle)
    const shortenedEndY = endY - shortenBy * Math.sin(angle)

    /** 绘制主线（缩短以避免与箭头头部重叠） */
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(shortenedEndX, shortenedEndY)
    ctx.stroke()

    /** 绘制箭头头部（填充三角形） */
    ctx.beginPath()
    ctx.moveTo(endX, endY) // 箭头尖端

    /** 使用逻辑headLength计算箭头头部基点的坐标 */
    const point1X = endX - this.headLength * Math.cos(angle - this.headAngle)
    const point1Y = endY - this.headLength * Math.sin(angle - this.headAngle)
    const point2X = endX - this.headLength * Math.cos(angle + this.headAngle)
    const point2Y = endY - this.headLength * Math.sin(angle + this.headAngle)

    ctx.lineTo(point1X, point1Y)
    ctx.lineTo(point2X, point2Y)
    ctx.closePath() // 闭合三角形路径
    ctx.fill() // 填充箭头头部
  }

  /**
   * 判断点是否在箭头路径内
   * @param x 点的x坐标
   * @param y 点的y坐标
   * @returns 如果点在路径内返回true，否则返回false
   */
  isInPath(x: number, y: number): boolean {
    const { startX, startY, endX, endY } = this
    const lineWidth = (this.shapeStyle.lineWidth || 1) + 5 // 添加缓冲区域便于点击

    /** 边界框检查（快速排除）- 使用逻辑坐标 */
    const minX = Math.min(startX, endX) - lineWidth / 2
    const minY = Math.min(startY, endY) - lineWidth / 2
    const maxX = Math.max(startX, endX) + lineWidth / 2
    const maxY = Math.max(startY, endY) + lineWidth / 2

    if (x < minX || x > maxX || y < minY || y > maxY) {
      return false // 点在粗略边界框外
    }

    /**
     * 检查点(x,y)到线段(startX,startY)->(endX,endY)的距离
     * 使用垂直距离公式+线段检查
     */
    const dx = endX - startX
    const dy = endY - startY
    const lenSq = dx * dx + dy * dy // 线段长度的平方

    if (lenSq === 0) { // 起点和终点相同
      return Math.sqrt((x - startX) ** 2 + (y - startY) ** 2) < lineWidth / 2
    }

    /** 将点(x,y)投影到包含线段的直线上 */
    const t = ((x - startX) * dx + (y - startY) * dy) / lenSq

    let closestX, closestY
    if (t < 0) { // 最近点是startX, startY
      closestX = startX
      closestY = startY
    }
    else if (t > 1) { // 最近点是endX, endY
      closestX = endX
      closestY = endY
    }
    else { // 最近点在线段上
      closestX = startX + t * dx
      closestY = startY + t * dy
    }

    /** 计算点(x,y)到线段上最近点的距离平方 */
    const distSq = (x - closestX) ** 2 + (y - closestY) ** 2

    /** 检查距离是否在线宽缓冲区内 */
    return distSq < (lineWidth / 2) ** 2
  }

  /**
   * 设置图形样式
   * @param shapeStyle 样式对象
   */
  setShapeStyle(shapeStyle: ShapeStyle = {}): void {
    /** 可以在这里设置默认箭头样式 */
    const defaultArrowStyle: ShapeStyle = {
      lineWidth: 2,
      strokeStyle: '#000000',
      fillStyle: '#000000', // 默认箭头填充色
    }
    Object.assign(this.shapeStyle, defaultArrowStyle, shapeStyle)

    /** 根据线宽可选调整箭头头部大小 */
    this.headLength = Math.max(8, (this.shapeStyle.lineWidth || 2) * 4)
  }
}

/**
 * 箭头配置选项接口
 */
export type ArrowOpts = {
  /** 起点x坐标 */
  startX: number
  /** 起点y坐标 */
  startY: number
  /** 画布上下文 */
  ctx: CanvasRenderingContext2D
  /** 图形样式（可选） */
  shapeStyle?: ShapeStyle
  /** Canvas系统元数据（可选） */
  meta?: ShapeMeta
}
