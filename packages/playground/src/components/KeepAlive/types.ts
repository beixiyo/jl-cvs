export interface KeepAliveProps {
  children: React.ReactNode
  active: boolean
  /**
   * 是否在激活时强制刷新子组件（通过递增 renderKey 触发重新挂载）
   * 用于解决 motion 等动画库在 Suspense 恢复后状态不重置的问题
   * @default false
   */
  forceRender?: boolean
  /**
   * 过渡配置：传入后 active 的切换不再立即生效，而是先经过 entering / exiting 窗口
   * 不传时行为与未接入过渡前完全一致（立即切换，逐帧无差异）
   * @default undefined
   */
  transition?: KeepAliveTransitionOptions
  /**
   * 退场彻底完成（phase 变为 exited）时触发一次
   * 供上层清理临时占位（如结构上会被移除的槽位）；常驻实例（如 Tabs / 并列面板）通常无需使用
   */
  onExited?: () => void
  /**
   * 触发本次 active 切换的方向，用于让退场 / 进场动画感知前进 / 后退
   * 由使用方传入（如 Tabs 的索引增减、步骤器的前进 / 后退）
   * @default 'replace'
   */
  direction?: KeepAliveTransitionDirection
}

/**
 * {@link useKeepAliveEffect} 的回调
 *
 * 激活时执行，可返回一个在「失活（隐藏）/ 卸载」时调用的 cleanup（同 {@link useEffect} 约定）
 */
export type KeepAliveEffectCallback = () => void | (() => void)

export interface KeepAliveContextType {
  registerActiveEffect: (key: keyof any, effectCallback: Function) => void
  registerDeactiveEffect: (key: keyof any, effectCallback: Function) => void

  findEffect: (key?: keyof any) => {
    activeEffect: Function[]
    deactiveEffect: Function[]
  }

  /** 传 callback 则只移除该回调；不传 callback 删除整个 key；不传 key 清空全部 */
  delActiveEffect: (key?: keyof any, callback?: Function) => void
  delDeactiveEffect: (key?: keyof any, callback?: Function) => void
}

/**
 * 切换方向：让过渡动画感知「前进 / 后退」，从而选择对应的滑动方向
 * - `forward`：向前 / 追加（如 Tabs 向右切、列表向后翻页）
 * - `back`：向后 / 回退（如 Tabs 向左切、返回上一步）
 * - `replace`：无方向语义（如原地替换当前项）
 */
export type KeepAliveTransitionDirection = 'forward' | 'back' | 'replace'

/**
 * 单个 KeepAlive 实例当前所处的过渡阶段
 * - `entering`：已激活但进场动画尚未确认结束
 * - `entered`：进场完成，稳定展示中
 * - `exiting`：逻辑上已失活，但仍保留挂载以播放退场动画
 * - `exited`：退场完成（即将真正被挂起 / 移出渲染树）
 */
export type KeepAliveTransitionPhase = 'entering' | 'entered' | 'exiting' | 'exited'

/**
 * 过渡配置。不传（`undefined`）则完全不启用过渡，逐帧零行为差异
 */
export interface KeepAliveTransitionOptions {
  /**
   * 进场兜底超时（毫秒）：超过该时长仍未调用 finishEnter 则自动判定为进场完成
   * @default 500
   */
  enterTimeout?: number
  /**
   * 退场兜底超时（毫秒）：超过该时长仍未调用 finishExit 则自动判定为退场完成
   * @default 500
   */
  exitTimeout?: number
  /**
   * 是否遵循 `prefers-reduced-motion: reduce`，命中时跳过过渡窗口、立即切换
   * @default true
   */
  respectReducedMotion?: boolean
}

/**
 * 通过 {@link useKeepAliveTransition} 暴露给子树的过渡状态
 */
export interface KeepAliveTransitionState {
  /** 当前所处阶段 */
  phase: KeepAliveTransitionPhase
  /** 手动确认进场动画已结束；不调用时由 enterTimeout 兜底 */
  finishEnter: () => void
  /** 手动确认退场动画已结束；不调用时由 exitTimeout 兜底 */
  finishExit: () => void
  /**
   * 触发本次进场 / 退场的方向，在 active 切换的瞬间被捕获快照，
   * 之后即使外部方向再变化也不受影响（避免动画播放到一半方向突变）
   */
  direction: KeepAliveTransitionDirection
}
