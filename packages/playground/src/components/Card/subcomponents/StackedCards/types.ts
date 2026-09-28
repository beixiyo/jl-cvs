import type React from 'react'

/**
 * 堆叠卡片层数
 * @default 3
 */
export type StackedCardsLayers = 1 | 2 | 3

/**
 * 堆叠样式变体
 * - border: 边框划分层级，顶层带轻微阴影
 * - shadow: 无边框，用阴影表现堆叠（顶层最强、下层逐级减弱）
 * - background: 无边框无阴影，用背景色层级（bg-secondary/tertiary/quaternary）区分
 */
export type StackedCardsVariant = 'border' | 'shadow' | 'background'

/**
 * 多层堆叠卡片参数
 * @default {}
 */
export type StackedCardsProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * 堆叠样式变体
     * @default 'border'
     */
    variant?: StackedCardsVariant
    /**
     * 堆叠层数（1-3）
     * @default 3
     */
    layers?: StackedCardsLayers
    /**
     * 每一层的内容，按“从上到下”的顺序传入
     * 例如：layers=3 时，layersContent[0] 为顶层内容
     * @default []
     */
    layersContent?: React.ReactNode[]
    /**
     * 是否根据内容自适应高度
     * @default false
     */
    autoHeight?: boolean
    /**
     * X 方向偏移量（px）
     * @default 0
     */
    offsetX?: number
    /**
     * Y 方向偏移量（px）
     * @default 8
     */
    offsetY?: number
    /**
     * 每层缩放差值
     * @default 0.03
     */
    scaleStep?: number
    /**
     * 每层透明度递减
     * @default 0.08
     */
    opacityStep?: number
    /**
     * 起始层级
     * @default 0
     */
    zIndexBase?: number
    /**
     * 所有层的 className（会与变体基础样式、layerClassNames 合并）
     * @default ''
     */
    layerClassName?: string
    /**
     * 顶层的 className
     * @default ''
     */
    topLayerClassName?: string
    /**
     * 按层索引的 className：[顶层, 第二层, 第三层]，可只传需要覆盖的项
     * @default undefined
     */
    layerClassNames?: [string?, string?, string?]
    /**
     * 顶层内容容器的 className
     * @default ''
     */
    contentClassName?: string
  }
>
