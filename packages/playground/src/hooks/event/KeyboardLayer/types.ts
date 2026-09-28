import type { KeyCodeEnum, KeyEnum, KeyEventType, ModifierExpectation } from '@/utils/keyboard'

/** 键盘交互层注册选项 */
export type UseKeyboardLayerOptions = ModifierExpectation & {
  /** 当前层是否进入键盘响应栈 */
  active: boolean
  /**
   * 参与响应的事件类型；不同类型各有独立的层栈，互不抢占
   *
   * 不传时由 `onKeyDown` / `onKeyUp` 的存在推导；两个回调都不传时按 `['keydown']` 处理，
   * 只有需要「无回调的纯 keyup 阻断层」时才显式传入
   */
  eventTypes?: readonly KeyEventType[]
  /** 匹配的 `KeyboardEvent.key`，大小写不敏感；不传时匹配所有按键，空数组不匹配任何按键 */
  keys?: readonly KeyEnum[]
  /**
   * 匹配的 `KeyboardEvent.code`，区分大小写
   *
   * 传入后 `keys` 不参与匹配：macOS 上 Option 会改写 `key` 的字符，
   * 带 Alt 的字母组合键必须用 `codes`
   */
  codes?: readonly KeyCodeEnum[]
  /**
   * 进一步限制按键、组合键或事件目标
   *
   * 返回 `false` 是「这次事件整个层栈都不处理」，不是「本层放行给下一层」：
   * 只有栈顶层参与匹配，它不匹配时不会向下查找。想让下层接手就别让本层进栈（`active: false`）
   */
  when?: (event: KeyboardEvent) => boolean
  /**
   * 是否忽略输入法组字期间的事件（组字中的 Enter / Escape 属于输入法自身的确认与取消）
   * @default true
   */
  ignoreComposing?: boolean
  /**
   * 层级优先级；数值更大的活动层优先，同优先级按最近激活顺序处理
   * @default 0
   */
  priority?: number
  /** 当前层命中 `keydown` 时执行；传入才参与 keydown 层栈 */
  onKeyDown?: (event: KeyboardEvent) => void
  /** 当前层命中 `keyup` 时执行；传入才参与 keyup 层栈 */
  onKeyUp?: (event: KeyboardEvent) => void
  /**
   * 是否允许执行 `onKeyDown` / `onKeyUp`
   *
   * 关闭时仍占据栈顶并可消费事件，避免穿透到下层
   * @default true
   */
  handlerEnabled?: boolean
  /**
   * 是否响应长按产生的重复事件；关闭时重复事件仍会被消费
   * @default true
   */
  allowRepeat?: boolean
  /**
   * 是否消费匹配事件，阻止默认行为和后续传播
   * @default true
   */
  consume?: boolean
}

/** 键盘交互层控制器 */
export interface KeyboardLayerController {
  /** 当前实例是否位于所属事件类型的键盘响应栈顶 */
  isTopLayer: boolean
}
