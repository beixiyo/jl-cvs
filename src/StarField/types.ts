export interface StarFieldConfig {
  /** 星星数量，默认 300 */
  starCount?: number
  /** 星星大小范围，默认 [0.5, 2] */
  sizeRange?: [number, number]
  /** 速度范围，星星速度在 [-speedRange, speedRange]，默认 0.05 */
  speedRange?: number
  /** 颜色配置：颜色数组或颜色生成函数 */
  colors?: string[] | (() => string)
  /** 背景颜色，默认 '#001122' */
  backgroundColor?: string
  /** 闪烁速度，控制正弦波频率，默认 0.01 */
  flickerSpeed?: number

  /** 改变大小时的防抖时间，默认 80 */
  debounceTime?: number

  width?: number
  height?: number
}

export interface IStar {
  x: number
  y: number
  radius: number
  /** 用于渐变中间色 */
  baseColor: string
  alpha: number
  dx: number
  dy: number
  phase: number
}