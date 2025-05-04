/**
 * 波浪动画配置项
 */
export interface WaveConfig {
  /**
   * Canvas元素
   */
  canvas: HTMLCanvasElement

  /**
   * 水平间距
   * @default 10
   */
  xGap?: number

  /**
   * 垂直间距
   * @default 32
   */
  yGap?: number

  /**
   * 额外宽度
   * @default 200
   */
  extraWidth?: number

  /**
   * 额外高度
   * @default 30
   */
  extraHeight?: number

  /**
   * 鼠标效果范围
   * @default 175
   */
  mouseEffectRange?: number

  /**
   * 线条颜色
   * @default "black"
   */
  strokeStyle?: string
}

/**
 * 点的坐标
 */
export interface Point {
  x: number
  y: number
  wave: {
    x: number
    y: number
  }
  cursor: {
    x: number
    y: number
    vx: number
    vy: number
  }
}

/**
 * 鼠标状态
 */
export interface MouseState {
  x: number
  y: number
  lx: number
  ly: number
  sx: number
  sy: number
  v: number
  vs: number
  a: number
  set: boolean
}
