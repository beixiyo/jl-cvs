/**
 * RetryImg 类型声明
 */

export type RetryImgStatus = 'loading' | 'success' | 'error'

export type RetryImgProps =
  & {
    className?: string
    style?: React.CSSProperties
    src: string
    /**
     * 加载失败时的重试次数
     * @default 3
     */
    retryCount?: number
    /**
     * 全部重试失败后渲染的兜底内容，不传时仍渲染原始 `<img>`（保持向后兼容）
     * @default undefined
     */
    fallback?: React.ReactNode
    /**
     * 重试成功回调，参数为最终加载成功的图片 url（含缓存破坏参数）
     * @default undefined
     */
    onRetrySuccess?: (url: string) => void
    /**
     * 全部重试失败回调
     * @default undefined
     */
    onRetryFail?: () => void
  }
  & Omit<
    React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    'src'
  >
