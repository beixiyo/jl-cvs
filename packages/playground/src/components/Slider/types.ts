/** 类型定义 */
export type TooltipConfig = {
  /**
   * 自定义格式化函数
   */
  formatter?: (value: number) => React.ReactNode
  /**
   * 提示框位置
   * @default 'auto' - 自动根据slider方向选择
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
}

export type MarkConfig = {
  /**
   * 标签内容
   */
  label: React.ReactNode
  /**
   * 自定义样式
   */
  style?: React.CSSProperties
}

export type SliderStyleConfig = {
  /**
   * 滑块手柄样式配置
   */
  handle?: {
    /**
     * 手柄大小
     * @default 'w-4 h-4'
     */
    size?: string
    /**
     * 手柄颜色
     * @default 'bg-background border-brand'
     */
    color?: string
    /**
     * 手柄边框
     * @default 'border-2'
     */
    border?: string
    /**
     * 手柄圆角
     * @default 'rounded-full'
     */
    rounded?: string
    /**
     * 悬停效果
     * @default 'hover:scale-110'
     */
    hover?: string
    /**
     * 焦点效果
     * @default 'focus:scale-110 focus:outline-hidden focus:ring-2 focus:ring-brand focus:ring-opacity-50'
     */
    focus?: string
  }
  /**
   * 轨道样式配置
   */
  track?: {
    /**
     * 轨道背景颜色
     * @default 'bg-border'
     */
    background?: string
    /**
     * 轨道高度/宽度
     * @default 'h-1' (水平) 或 'w-1' (垂直)
     */
    size?: string
    /**
     * 轨道圆角
     * @default 'rounded-full'
     */
    rounded?: string
  }
  /**
   * 进度条样式配置
   */
  fill?: {
    /**
     * 进度条颜色
     * @default 'bg-brand'
     */
    color?: string
    /**
     * 进度条圆角
     * @default 'rounded-full'
     */
    rounded?: string
  }
  /**
   * 刻度标记样式配置
   */
  marks?: {
    /**
     * 刻度点颜色
     * @default 'bg-background border-border2'
     */
    dotColor?: string
    /**
     * 激活状态刻度点颜色
     * @default 'bg-brand border-brand'
     */
    activeDotColor?: string
    /**
     * 标签文字颜色
     * @default 'text-text2'
     */
    labelColor?: string
  }
}

export type SliderProps<T extends number | [number, number] = number> =
  & {
    /**
     * 值为 true 时，滑块为禁用状态
     * @default false
     */
    disabled?: boolean
    /**
     * 支持使用键盘操作 handler
     * @default true
     */
    keyboard?: boolean
    /**
     * 是否只能拖拽到刻度上
     * @default false
     */
    dots?: boolean
    /**
     * marks 不为空对象时有效，值为 true 时表示值为包含关系，false 表示并列
     * @default true
     */
    included?: boolean
    /**
     * 刻度标记，key 的类型必须为 number 且取值在闭区间 [min, max] 内，每个标签可以单独设置样式
     */
    marks?: Record<number, React.ReactNode | MarkConfig>
    /**
     * 最大值
     * @default 100
     */
    max?: number
    /**
     * 最小值
     * @default 0
     */
    min?: number
    /**
     * 双滑块模式
     * @default false
     */
    range?: boolean
    /**
     * 反向坐标轴
     * @default false
     */
    reverse?: boolean
    /**
     * 步长，取值必须大于 0，并且可被 (max - min) 整除。当 marks 不为空对象时，可以设置 step 为 null，此时 Slider 的可选值仅有 marks、min 和 max
     * @default 1
     */
    step?: number | null
    /**
     * 设置 Tooltip 相关属性
     */
    tooltip?: boolean | TooltipConfig
    /**
     * 设置当前取值。当 range 为 false 时，使用 number，否则用 [number, number]
     */
    value?: T
    /**
     * 非受控模式下的初始值。当未传 value 时用于初始化内部状态，
     * range 为 true 时传 [number, number]
     */
    defaultValue?: T
    /**
     * 值为 true 时，Slider 为垂直方向
     * @default false
     */
    vertical?: boolean
    /**
     * 滑块手柄的无障碍标签，透传到 role="slider" 元素的 aria-label
     */
    ariaLabel?: string
    /**
     * 与 mouseup 和 keyup 触发时机一致，把当前值作为参数传入
     */
    onChangeComplete?: (value: T) => void
    /**
     * 当 Slider 的值发生改变时，会触发 onChange 事件，并把改变后的值作为参数传入
     */
    onChange?: (value: T) => void
    /**
     * 样式配置
     */
    styleConfig?: SliderStyleConfig
  }
  & Omit<React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>, 'onChange'>
