import type { Refs } from '@/hooks'
import type { ClipboardEvent, CSSProperties, DragEvent, InputHTMLAttributes, ReactNode } from 'react'
import { DATA_ATTR } from '../../constants/dataAttributes'

/** renderPreviewList 的配置，用于自定义预览列表样式 */
export interface RenderPreviewListOptions {
  /** 预览列表容器 className，会与 Uploader 的 previewClassName 合并 */
  className?: string
  /** 可选覆盖本次渲染的预览配置（如尺寸、自定义 renderItem） */
  previewConfig?: Partial<PreviewConfig>
}

/** 自定义上传区域时传入的上下文 */
export interface UploadAreaRenderContext {
  /** 是否有文件拖入 */
  dragActive: boolean
  /** 拖入是否无效（类型/大小等不合法） */
  dragInvalid: boolean
  disabled: boolean
  /** 触发文件选择（等同于点击 input） */
  triggerClick: () => void
  /** 绑定到根元素以支持拖拽、粘贴、点击触发，如 <div {...getRootProps()}> */
  getRootProps: () => {
    onDragEnter?: (e: DragEvent) => void
    onDragLeave?: (e: DragEvent) => void
    onDragOver?: (e: DragEvent) => void
    onDrop?: (e: DragEvent) => void
    onPaste?: (e: ClipboardEvent) => void
    onClick: () => void
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void
    role: 'button'
    'aria-label': string
    'aria-disabled': boolean
    [DATA_ATTR.dragging]: boolean
    [DATA_ATTR.invalid]: boolean
    tabIndex: number
    className: string
  }
  /**
   * 渲染默认预览列表，可在自定义布局中任意位置使用
   * @param options 可选，用于自定义本次渲染的样式（与 Uploader 的 previewClassName / previewConfig 合并）
   */
  renderPreviewList: (options?: RenderPreviewListOptions) => ReactNode
}

export interface UploaderRef {
  clear: () => void
  click: () => void
}

/** 自定义「添加」按钮时传入的上下文 */
export interface AddTriggerRenderProps {
  /** 点击触发文件选择 */
  onClick: () => void
  disabled: boolean
  width: number
  height: number
  dragActive: boolean
  dragInvalid: boolean
}

export type PreviewConfig = {
  /**
   * 预览图片宽度
   * @default 70
   */
  width?: number
  /**
   * 预览图片高度
   * @default 70
   */
  height?: number

  /**
   * 自定义预览项组件
   */
  renderItem?: (props: {
    src: string
    index: number
    onRemove: () => void
  }) => ReactNode

  /**
   * 自定义「添加」按钮 JSX，传入上下文后可完全自定义样式与结构
   */
  renderAddTrigger?: (props: AddTriggerRenderProps) => ReactNode
}

/**
 * `maxCount` 按「`previewImgs.length` + 本批已收」计数，Uploader 自己不持有列表；
 * 因此限制总数时必须同时传 `previewImgs`，否则每批都从 0 起算，限制形同虚设
 */
export type UploaderCountProps =
  | {
    /** 最大上传图片数量（跨批次总数） */
    maxCount: number
    /** 当前已有的图片 src 列表，既用于渲染预览，也是 `maxCount` 的计数基准 */
    previewImgs: string[]
  }
  | {
    maxCount?: undefined
    /** 当前已有的图片 src 列表，用于渲染预览 */
    previewImgs?: string[]
  }

export type UploaderProps =
  & UploaderCountProps
  & {
    /**
     * 上传模式
     * @default 'default'
     */
    mode?: 'default' | 'card'
    /**
     * 是否禁用上传功能
     * @default false
     */
    disabled?: boolean
    /**
     * 单轮选择去重
     */
    distinct?: boolean
    /**
     * 最大文件大小，单位字节
     */
    maxSize?: number
    /**
     * 最大图片像素，文件必须是图片，并且可加载
     */
    maxPixels?: {
      width: number
      height: number
    }

    /**
     * 本批通过校验的**新增**文件，不是全量列表
     *
     * Uploader 不持有文件，调用方自行 append 并生成 `previewImgs`
     */
    onChange?: (files: File[]) => void
    /** 点击预览项的移除按钮，按 `previewImgs` 的索引回传 */
    onRemove?: (index: number) => void
    onExceedSize?: (size: number) => void
    onExceedCount?: VoidFunction
    onExceedPixels?: (width: number, height: number) => void
    /**
     * 自定义过滤：每个文件逐个调用，返回 `true` 表示该文件被过滤掉（不进入结果）
     *
     * 用于实现 Uploader 无法内置的策略，例如「跟已上传列表按指纹去重」
     *
     * 同步谓词，只能基于 `File` 元数据判断；按内容（base64）去重需要异步读文件，
     * 这里做不到，请在 `onChange` 拿到 `File[]` 后由调用方自行处理
     * @example
     * // 文件指纹去重：已存在列表中的文件直接丢弃
     * shouldFilterOut={ file => uploadedFiles.some(f => f.name === file.name && f.size === file.size) }
     */
    shouldFilterOut?: (file: File) => boolean
    /**
     * 被 `shouldFilterOut` 过滤掉的文件回调（每批处理后调用一次）
     *
     * 用于给用户反馈，例如「已过滤 N 张重复图片」
     */
    onFiltered?: (files: File[]) => void

    /**
     * 谁可以触发粘贴事件
     */
    pasteEls?: Refs<HTMLElement>
    placeholder?: string
    showAcceptedTypesText?: boolean

    /**
     * 预览配置
     */
    previewConfig?: PreviewConfig

    /**
     * 选择文件后自动清空 input，使再次选择相同文件仍能触发上传
     * 设为 `false` 时无法连续上传同一文件
     * @default true
     */
    autoClear?: boolean

    /**
     * 外部拖拽区域的ref
     * 如果提供，将在该元素上添加拖拽事件监听
     */
    dragAreaEl?: React.RefObject<HTMLElement | null>

    /**
     * 是否在使用外部拖拽区域的同时渲染children
     * @default false
     */
    renderChildrenWithDragArea?: boolean
    /**
     * 是否使用点击外部拖拽区域触发文件选择
     * @default false
     */
    dragAreaClickTrigger?: boolean

    /** 样式相关 */
    className?: string
    style?: CSSProperties
    previewClassName?: string
    dragActiveClassName?: string

    /**
     * 自定义上传区域 JSX，传入上下文后可完全自定义拖拽区与预览布局
     * 使用 getRootProps() 绑定事件以保留拖拽/粘贴/点击触发
     * 使用 renderPreviewList() 在任意位置插入默认预览列表
     */
    renderUploadArea?: (ctx: UploadAreaRenderContext) => ReactNode

    children?: ReactNode
  }
  & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>
