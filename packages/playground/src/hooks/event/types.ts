export interface ClickOutsideOpts {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean

  /**
   * 事件类型
   * @default mousedown
   */
  trigger?: 'click' | 'mousedown' | 'contextmenu'

  /**
   * 额外的 CSS 选择器，用于检测点击是否在这些元素内部
   * 主要用于处理固定定位的面板等场景
   * @default []
   */
  additionalSelectors?: string[]
}

export interface ScrollBottomOpts {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
  /**
   * 启动平滑滚动，可能造成无法滚动到底
   * @default false
   */
  smooth?: boolean
  /**
   * 延迟时间
   * @default 0
   */
  delay?: number
}

export interface ScrollReachBottomOpts {
  /**
   * 触底阈值（像素）
   * @default 50
   */
  threshold?: number
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
}

export type InsertStyleOpts = {
  enable?: boolean
  lightStyleStrOrUrl?: string
  darkStyleStrOrUrl?: string
}
