/**
 * Tabs 相关类型定义
 */
import type { CSSProperties, ReactNode } from 'react'

/**
 * Tabs 内容项
 * @default {}
 */
export type TabsContentItem = {
  value: string
  children?: ReactNode
  key?: string
  /** 关联的 tab 元素 id */
  tabId?: string
  /** 当前 tabpanel 的 id */
  panelId?: string
}

/**
 * KeepAlive 缓存策略
 * - activity: 使用 React 19 Activity (Offscreen) 实现，DOM 始终存在，切换平滑
 * - suspense: 使用自定义 Suspense + throw Promise 实现，组件会被挂起
 * - none: 不使用缓存，非活动标签会被卸载
 */
export type KeepAliveStrategy = 'activity' | 'suspense' | 'none'

/**
 * Tabs Content 属性
 * @default {}
 */
export type TabsContentProps =
  & {
    className?: string
    style?: CSSProperties
    items: TabsContentItem[]
    /**
     * 当前激活值
     * @default undefined
     */
    activeValue?: string
    /**
     * 缓存模式
     * @default 'suspense'
     */
    mode?: KeepAliveStrategy
    /**
     * 动画时长（秒）
     * @default 0.4
     */
    duration?: number
    /**
     * 内容项容器类名
     * @default undefined
     */
    itemClassName?: string
    /**
     * 内容项容器样式
     * @default undefined
     */
    itemStyle?: CSSProperties
    /**
     * 仅在 mode 为 suspense 时生效。为 true 时，每次激活会强制刷新对应 KeepAlive 子组件（用于 motion 等动画库重置动画等状态）
     * @default false
     */
    suspenseModeForceRender?: boolean
  }
  & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>

/**
 * 旧 Tabs 数据结构（兼容内部组件使用）
 * @default {}
 */
export type TabItemType<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
  /**
   * 指定为激活状态
   * @default undefined
   */
  active?: boolean
  children?: ReactNode
  header?: (item: Omit<TabItemType<T>, 'header'>) => ReactNode
}

/**
 * Tabs 属性
 * @default {}
 */
export type TabsProps<T extends string> = {
  className?: string
  contentClassName?: string
  style?: CSSProperties
  headerClass?: string
  itemClass?: string

  header?: ReactNode
  headerWrapClass?: string
  headerStyle?: CSSProperties
  headerAfter?: ReactNode

  /** 活跃标签的类名 */
  activeClassName?: string
  /** 非活跃标签的类名 */
  inactiveClassName?: string
  /** 底部横条的渐变色数组 */
  colors?: string[]

  /**
   * 标签高度
   * @default 56
   */
  tabHeight?: number
  items: TabItemType<T>[]
  activeKey?: T
  onChange?: (item: TabItemType<T>) => void
  /**
   * 是否启用 KeepAlive 缓存
   * @default true
   */
  keepAlive?: KeepAliveStrategy
  /**
   * 动画时长（秒）
   * @default 0.4
   */
  duration?: number
  dataId?: string
  /**
   * 最大可见标签数，超出部分将显示在下拉菜单中
   * @default undefined
   */
  maxVisibleTabs?: number
  /**
   * 缓存模式
   * @default 'suspense'
   */
  mode?: KeepAliveStrategy
}
