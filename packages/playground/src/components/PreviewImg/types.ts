import type { ImgThumbnailsOrientation, ImgThumbnailsProps } from '../ImgThumbnails/types'

/** 缩略图列表贴靠的边 */
export type PreviewImgThumbnailPlacement = 'top' | 'bottom' | 'left' | 'right'

export type PreviewImgProps = {
  /**
   * 预览图片的URL，支持单张或多张图片
   * - string: 单张图片预览
   * - string[]: 多张图片预览，顶部显示轮播图切换
   */
  src: string | string[]
  /**
   * 关闭预览的回调函数
   */
  onClose: () => void
  /**
   * 初始显示的图片索引（仅多图时有效）
   * @default 0
   */
  initialIndex?: number
  /**
   * 缩略图布局方向
   * @default 'vertical'
   */
  orientation?: ImgThumbnailsOrientation
  /**
   * 缩略图列表贴靠的边，不传时由 `orientation` 推导（vertical → right，horizontal → bottom）
   */
  thumbnailPlacement?: PreviewImgThumbnailPlacement
  /**
   * 透传给内部 `ImgThumbnails` 的配置，用于定制尺寸、圆角、选中态等
   */
  thumbnailProps?: Omit<ImgThumbnailsProps, 'images' | 'currentIndex' | 'onImageChange' | 'orientation'>
  /**
   * 整条替换缩略图列表，定位与让位仍由预览负责
   */
  renderThumbnails?: (ctx: PreviewImgOverlayCtx) => React.ReactNode
  /**
   * 整条替换底部工具栏，定位与让位仍由预览负责
   */
  renderToolbar?: (ctx: PreviewImgOverlayCtx) => React.ReactNode
  /**
   * 追加到内置工具栏（旋转、重置、下载）之后的按钮，如删除、分享
   *
   * 传函数可拿到上下文，直接复用预览的能力（`ctx.currentSrc`、`ctx.download()` 等），
   * 无需自己抬状态；需要完全掌控整条工具栏时改用 `renderToolbar`
   */
  toolbarActions?: React.ReactNode | ((ctx: PreviewImgOverlayCtx) => React.ReactNode)
  /**
   * 是否显示缩略图
   * @default true
   */
  showThumbnails?: boolean
  /**
   * 点击遮罩空白区域时是否关闭预览
   * @default true
   */
  maskClosable?: boolean
  /**
   * 预览层对 Electron 窗口拖拽区的命中策略
   * - `no-drag`：预览打开期间优先保证按钮和图片交互命中
   * - `inherit`：不额外声明 app-region，沿用外层窗口行为
   * @default 'no-drag'
   */
  windowDragMode?: 'no-drag' | 'inherit'
  /**
   * 预览大图基准显示的最大宽度（px），实际生效值为它与视口可用宽度的较小者，
   * 用户仍可通过滚轮缩放放大；不传则只受视口可用宽度约束
   */
  imageMaxWidth?: number
  /**
   * 预览层 z-index
   * @default Z.preview
   */
  zIndex?: number
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>

/** 传给自定义工具栏 / 缩略图列表的上下文，让外部 TSX 能与预览联动 */
export interface PreviewImgOverlayCtx {
  /** 全部图片 */
  images: string[]
  /** 当前图片下标 */
  currentIndex: number
  /** 当前图片地址 */
  currentSrc: string
  /** 当前缩放倍率 */
  scale: number
  /** 当前旋转角度 */
  rotation: number
  /** 切到指定下标 */
  select: (index: number) => void
  /** 上一张 */
  prev: () => void
  /** 下一张 */
  next: () => void
  /** 顺时针旋转 90° */
  rotate: () => void
  /** 复位缩放、旋转与位移 */
  reset: () => void
  /** 下载当前图片 */
  download: () => void
  /** 关闭预览 */
  close: () => void
}
