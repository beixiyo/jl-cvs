export type Size = 'sm' | 'md' | 'lg' | number
export type SizeStyle = Record<Exclude<Size, number>, string>

export type Rounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
export type RoundedStyle = Record<Rounded, string>

export type AsChildProps<BaseProps, ChildProps> =
  | ({ asChild: true } & BaseProps)
  | ({ asChild: false } & BaseProps & ChildProps)

/**
 * 统一的命令式组件控制器接口
 * 所有命令式调用的组件（Message、Modal、Notification 等）都应返回此接口
 */
export interface ComponentController {
  /** 关闭/销毁组件 */
  close: () => void
}
