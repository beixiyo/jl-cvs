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
