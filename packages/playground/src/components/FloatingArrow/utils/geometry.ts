import type { FloatingArrowGeometry, FloatingArrowGeometryOptions } from '../types'

/**
 * 浮层角标的形状几何
 *
 * 轮廓由三段构成：根部平滑段（从浮层边缘切出）、45° 斜边、尖端平滑段
 * 两处平滑段都是三次贝塞尔，手柄分别沿浮层边缘和斜边方向伸出，
 * 因此曲线与边缘、斜边切线连续，曲率从接近零逐渐收紧，比圆弧衔接得更柔和
 *
 * 形状在默认宽高（24 × 7）上定义，实际尺寸按比例缩放；
 * 仿射缩放不破坏切线连续，根部仍与浮层边缘相切
 */

/** 箭头默认宽度，单位 px；按「根部与浮层边缘相切的两点」计量 */
export const DEFAULT_FLOATING_ARROW_SIZE = 24
/** 箭头尖端凸出浮层边缘的默认高度，单位 px */
export const DEFAULT_FLOATING_ARROW_HEIGHT = 7

/**
 * 默认宽高下左半边的控制量，单位 px；右半边镜像
 *
 * - 根部：从浮层边缘 (0, 0) 出发，水平手柄 baseHandle，
 *   平滑过渡到斜边起点 slopeStart，斜边方向手柄 slopeStartHandle
 * - 斜边：slopeStart 到 slopeEnd 的直线
 * - 尖端：从 slopeEnd 沿斜边方向伸出手柄 slopeEndHandle，
 *   水平手柄 tipHandle 收到尖端中点 (宽 / 2, 高)
 */
const BASE_SHAPE = {
  baseHandle: 3,
  slopeStart: { x: 5.5, y: 2 },
  slopeStartHandle: 2,
  slopeEnd: { x: 9.5, y: 6 },
  slopeEndHandle: 1,
  tipHandle: 1.5,
}

/**
 * 解析角标的实际尺寸与绘制路径
 *
 * 局部坐标以浮层边缘为 y = 0、尖端朝 y 正方向，宽度铺满 `[0, width]`；
 * 尺寸为 0 或非法时退化为空形状，不会抛错
 */
export function resolveFloatingArrowGeometry(
  options: FloatingArrowGeometryOptions = {},
): FloatingArrowGeometry {
  const { width, height } = resolveFloatingArrowBox(options)
  const scaleX = width / DEFAULT_FLOATING_ARROW_SIZE
  const scaleY = height / DEFAULT_FLOATING_ARROW_HEIGHT

  const {
    baseHandle,
    slopeStart,
    slopeStartHandle,
    slopeEnd,
    slopeEndHandle,
    tipHandle,
  } = BASE_SHAPE
  const halfWidth = DEFAULT_FLOATING_ARROW_SIZE / 2

  /** 斜边方向的单位向量，两处斜边侧手柄都沿它伸出 */
  const slopeLength = Math.hypot(slopeEnd.x - slopeStart.x, slopeEnd.y - slopeStart.y)
  const slopeX = (slopeEnd.x - slopeStart.x) / slopeLength
  const slopeY = (slopeEnd.y - slopeStart.y) / slopeLength

  /** 左半边依次为：根部起点、根部两手柄、斜边起点、斜边终点、尖端两手柄、尖端中点 */
  const [p0, p1, p2, p3, p4, p5, p6, p7]: Point[] = [
    [0, 0],
    [baseHandle, 0],
    [slopeStart.x - slopeStartHandle * slopeX, slopeStart.y - slopeStartHandle * slopeY],
    [slopeStart.x, slopeStart.y],
    [slopeEnd.x, slopeEnd.y],
    [slopeEnd.x + slopeEndHandle * slopeX, slopeEnd.y + slopeEndHandle * slopeY],
    [halfWidth - tipHandle, DEFAULT_FLOATING_ARROW_HEIGHT],
    [halfWidth, DEFAULT_FLOATING_ARROW_HEIGHT],
  ]

  const point = ([x, y]: Point) => `${round(x * scaleX)},${round(y * scaleY)}`
  const mirror = ([x, y]: Point): Point => [DEFAULT_FLOATING_ARROW_SIZE - x, y]

  /** 右半边镜像后反向走回根部，手柄顺序随之对调 */
  const path = [
    `M${point(p0)}`,
    `C${point(p1)} ${point(p2)} ${point(p3)}`,
    `L${point(p4)}`,
    `C${point(p5)} ${point(p6)} ${point(p7)}`,
    `C${point(mirror(p6))} ${point(mirror(p5))} ${point(mirror(p4))}`,
    `L${point(mirror(p3))}`,
    `C${point(mirror(p2))} ${point(mirror(p1))} ${point(mirror(p0))}`,
    'Z',
  ].join(' ')

  return { width, height, path }
}

/**
 * 解析角标的宽高
 *
 * 只传一项时另一项按默认宽高比跟随，两项都传则独立缩放
 */
export function resolveFloatingArrowBox(
  options: FloatingArrowGeometryOptions = {},
): Pick<FloatingArrowGeometry, 'width' | 'height'> {
  const { size, height } = options
  const aspect = DEFAULT_FLOATING_ARROW_SIZE / DEFAULT_FLOATING_ARROW_HEIGHT

  if (size === undefined && height === undefined) return { width: DEFAULT_FLOATING_ARROW_SIZE, height: DEFAULT_FLOATING_ARROW_HEIGHT }

  const width = sanitize(size ?? height! * aspect)
  return {
    width,
    height: sanitize(height ?? width / aspect),
  }
}

/** 收敛到非负数，并把 NaN 之类的脏输入按 0 处理 */
function sanitize(value: number): number {
  if (!Number.isFinite(value)) return 0

  return Math.max(value, 0)
}

/** 路径坐标保留 3 位小数，避免浮点尾数把 d 属性撑长 */
function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

type Point = [number, number]
