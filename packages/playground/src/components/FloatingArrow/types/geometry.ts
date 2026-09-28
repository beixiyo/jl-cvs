export type FloatingArrowGeometryOptions = {
  /**
   * 箭头宽度，单位 px；不传时按 height 与默认宽高比推算
   * @default 24
   */
  size?: number
  /**
   * 箭头尖端凸出浮层边缘的高度，单位 px；不传时按 size 与默认宽高比推算，
   * 不应超过 size，否则会被方形绘制区裁掉
   * @default 7
   */
  height?: number
}

export type FloatingArrowGeometry = {
  /** 箭头宽度，单位 px */
  width: number
  /** 箭头从浮层边缘凸出的可见高度，单位 px */
  height: number
  /** SVG path 的 d 属性，坐标系为 `0 0 width width` */
  path: string
}
