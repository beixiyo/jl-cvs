export type ImgToFadeOpts = {
  /** 容器大小 */
  width: number
  /** 容器大小 */
  height: number
  imgWidth?: number
  imgHeight?: number

  src: string
  /** 背景色，默认纯黑 */
  bgc?: string

  /** 小球每次的移动速度倍数，默认 1.25 */
  speed?: number
  /** 额外删除的像素点，默认 20 */
  extraDelCount?: number
  /** 每帧生成的小球， 默认 15 */
  ballCount?: number
  /**
   * 粒子更新多少次后被删除
   * @default 100
   */
  lifetime?: number
}

export type BallContext = {
  /** 记录绘制次数 */
  count: number
}
