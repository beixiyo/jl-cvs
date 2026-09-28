export type ImgThumbnailsOrientation = 'horizontal' | 'vertical'

export interface ImgThumbnailsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 图片数组
   */
  images: string[]
  /**
   * 当前选中的图片索引
   */
  currentIndex: number
  /**
   * 图片切换回调
   */
  onImageChange: (index: number) => void
  /**
   * 自定义类名
   */
  containerClassName?: string
  /**
   * 布局方向
   * @default 'vertical'
   */
  orientation?: ImgThumbnailsOrientation
  /**
   * 隐藏容器外边框（清爽模式）
   * @default false
   */
  hideBorder?: boolean
  /**
   * 隐藏当前项高亮（无边框/阴影/缩放/橙色遮罩）
   * @default false
   */
  hideHighlight?: boolean
  /**
   * 单张缩略图的边长（像素）
   * @default 60
   */
  thumbSize?: number
  /**
   * 单张缩略图的额外类名，用于覆盖圆角等样式
   */
  thumbClassName?: string
  /**
   * 选中态类名，传入即替换默认高亮（橙色描边 + 阴影 + 放大）
   */
  activeThumbClassName?: string
  /**
   * 未选中态类名，传入即替换默认样式（透明描边 + hover 放大）
   */
  inactiveThumbClassName?: string
  /**
   * 自定义单张缩略图的内容，外层按钮（点击、滚动定位、尺寸）仍由组件负责
   */
  renderThumb?: (ctx: ImgThumbnailRenderCtx) => React.ReactNode
}

export interface ImgThumbnailRenderCtx {
  /** 图片地址 */
  src: string
  /** 所在下标 */
  index: number
  /** 是否为当前选中项 */
  active: boolean
}
