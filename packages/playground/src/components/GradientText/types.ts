export interface GradientTextProps {
  children: React.ReactNode
  /** 根容器类名 */
  className?: string
  /** 渐变文字内容层类名；用于设置截断、宽度等文字布局 */
  contentClassName?: string
  style?: React.CSSProperties

  /**
   * 渐变色值列表（至少 2 个；首尾同色时配合 `seamlessLoop` 可无缝循环）
   * @default ['#ffaa40', '#9c40ff', '#ffaa40']
   */
  colors?: string[]
  /**
   * 动画时长（CSS 时间字符串，如 `'8s'`）
   * @default '8s'
   */
  animationDuration?: string
  /**
   * 渐变背景尺寸；不传时按是否 `seamlessLoop` 取默认（来回 `'300% 100%'` / 转圈 `'200% 100%'`）
   */
  backgroundSize?: string
  /**
   * 单向无缝循环动画：渐变从左到右「转一圈」，首尾同色（如 `['#a','#b','#a']`）时无缝衔接
   * 关闭时为来回摆动动画
   * @default true
   */
  seamlessLoop?: boolean

  /**
   * 是否显示渐变描边边框
   * @default false
   */
  showBorder?: boolean
  /**
   * 是否启用渐变流动动画
   * @default true
   */
  showAnimate?: boolean
}
