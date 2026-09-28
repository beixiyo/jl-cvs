/** LazyImg 的公共资源、解析与组件属性契约 */

import type { MotionProps } from 'motion/react'
import type React from 'react'
import type { PreviewImgProps } from '../PreviewImg/types'

/** LazyImg 接收或解析得到的完整图片源 */
export type LazyImgSource = {
  src: string
  srcSet?: string
  sizes?: string
}

/** LazyImg 当前持有的图片源及其可选释放函数 */
export type LazyImgResolvedSource = LazyImgSource & {
  /** 换源或卸载时调用，例如归还 ObjectURL 引用；异常会交给 `onDisposeError` */
  dispose?: () => void
  /**
   * 当相同 `sourceKey` 此前已加载成功时，允许复用 loaded 展示状态
   *
   * 仅应在复用同一个驻留资源地址时启用；新建 ObjectURL 或重新下载的资源应保持默认值
   * @default false
   */
  reuseLoadedState?: boolean
}

/** 传给异步图片源解析器的当前资源上下文 */
export type LazyImgResolveContext = LazyImgSource & {
  sourceKey: string
  signal: AbortSignal
}

/** 支持视口懒加载、异步资源解析、错误占位与预览扩展的图片组件属性 */
export type LazyImgProps =
  & LazyImgSource
  & {
    className?: string
    imgClassName?: string
    style?: React.CSSProperties
    imgStyle?: React.CSSProperties
    children?: React.ReactNode
    /**
     * 是否在进入预加载范围后才下发 `src` / `srcSet`
     * @default true
     */
    lazy?: boolean
    /**
     * 资源稳定身份；相同身份下更新 `src` 不会重置图片或重新解析
     * @default createImageRequestKey(src, srcSet, sizes)
     */
    sourceKey?: string
    /**
     * 图片真正开始加载时解析资源。懒加载模式下只在进入预加载范围后调用
     * @default undefined
     */
    resolveSource?: (
      context: LazyImgResolveContext,
    ) => LazyImgResolvedSource | Promise<LazyImgResolvedSource>
    /**
     * 当前资源解析失败时调用；因换源或卸载而取消的解析不会触发
     * @default undefined
     */
    onResolveError?: (error: unknown) => void
    /**
     * 解析结果的 `dispose` 抛出异常时调用；释放异常不会打断换源或卸载
     * @default undefined
     */
    onDisposeError?: (error: unknown) => void
    /**
     * loading 占位内容，支持传入 JSX
     * @default Skeleton 全屏占位
     */
    loading?: React.ReactNode
    /**
     * 自定义错误占位图；未提供或该图片也加载失败时显示 ImageOff 图标
     * @default undefined
     */
    errorSrc?: string
    /**
     * 图片加载失败后的提示文案
     * @default ''
     */
    errorText?: string
    /**
     * 图片等待进入视口或正在加载时的提示文案
     * @default ''
     */
    loadingText?: string
    /**
     * 未显式指定高度时是否使用 1:1 占位比例；调用方同时指定宽高时以调用方为准
     * @default true
     */
    keepAspect?: boolean
    /**
     * 是否可预览
     * @default true
     */
    previewable?: boolean
    /**
     * 预览时显示的图片数组（多图预览）
     * 如果提供此属性，预览时将显示多图轮播，否则只预览单张图片（src）
     */
    previewImages?: string[]
    /**
     * 是否显示缩略图
     * @default true
     */
    showThumbnails?: boolean
    /**
     * 点击遮罩空白区域时是否关闭预览
     * @default true
     */
    previewMaskClosable?: boolean
    /**
     * 自定义图片预览渲染器；仅在图片加载成功且用户点击打开预览后调用
     * @default props => <PreviewImg {...props} />
     */
    renderPreview?: (props: PreviewImgProps) => React.ReactNode
  }
  & Omit<
    React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    'src' | 'srcSet' | 'sizes' | 'loading'
  >
  & MotionProps
