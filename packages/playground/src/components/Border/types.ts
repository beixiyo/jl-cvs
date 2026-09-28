/**
 * Border 组件类型声明
 */

export type BorderProps =
  & {
    /**
     * 虚线段的长度
     * @default 10
     */
    dashLength?: number
    /**
     * 虚线段之间的间距
     * @default 12
     */
    dashGap?: number
    /**
     * 边框颜色
     *
     * 默认值依赖设计 token CSS 变量 `--border`，下游整包拷贝时需在主题中提供该变量，
     * 否则颜色会失效，可直接传入具体颜色值覆盖
     * @default 'rgb(var(--border) / 1)'
     */
    strokeColor?: string
    /**
     * 边框颜色（鼠标悬停）
     *
     * 默认值依赖设计 token CSS 变量 `--brand`，下游整包拷贝时需在主题中提供该变量，
     * 否则悬停颜色会失效，可直接传入具体颜色值覆盖
     * @default 'rgb(var(--brand) / 1)'
     */
    hoverStrokeColor?: string
    /**
     * 边框宽度
     * @default 2
     */
    strokeWidth?: number
    /**
     * 是否启用流动动画
     * @default true
     */
    animated?: boolean
    /**
     * 鼠标进入时才触发动画
     * @default true
     */
    enterAnimate?: boolean
    /**
     * 动画速度（毫秒）
     * @default 50
     */
    animationSpeed?: number
    /**
     * 边框圆角半径
     * @default 20
     */
    borderRadius?: number
  }
  & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
