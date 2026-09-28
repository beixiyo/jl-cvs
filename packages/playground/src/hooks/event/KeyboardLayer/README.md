# KeyboardLayer

`useKeyboardLayer` 用于协调嵌套交互区域的全局键盘事件。最高 `priority` 的活动层拥有响应权；同优先级时最近激活的层优先。同一次按键不会继续触发下层，适合 Modal、Popover、选择器和快捷键面板

```tsx
useKeyboardLayer({
  active: open,
  keys: ['Enter'],
  mod: true,
  onKeyDown: submit,
})
```

## 契约

- `active` 决定当前实例是否注册到栈中
- `onKeyDown` / `onKeyUp` 决定参与哪些事件：传了才参与，两个都传时同一层同时处理按下和抬起
- 两种事件各有独立层栈，`keyup` 层不会抢走 `keydown` 层的响应权
- `eventTypes` 显式指定参与的事件类型；不传时由回调推导，两个回调都不传时按 `['keydown']` 处理，只有需要「无回调的纯 keyup 阻断层」时才用得上
- `keys` 匹配 `KeyboardEvent.key`，大小写不敏感；省略时匹配所有按键，空数组不匹配任何按键
- `codes` 匹配 `KeyboardEvent.code`；传入后 `keys` 不参与匹配。macOS 的 Option 会改写 `key` 的字符（Option + A 得到 `å`），带 `alt` 的字母组合键必须用 `codes`
- `mod`、`ctrl`、`shift`、`alt`、`meta` 约束修饰键状态；省略的字段不参与匹配，显式传入 `false` 表示要求未按下
- `mod` 表示当前平台的主修饰键：Apple 平台为 Command（`metaKey`），其它平台为 Ctrl（`ctrlKey`），并要求另一个修饰键未按下；与 `ctrl` / `meta` 同时传入时以 `mod` 为准
- `alt` 无需按平台区分，macOS 的 Option 在 Web API 里就是 `altKey`；同理 Command 只有 `metaKey` 这一个名字，没有 Super
- `ignoreComposing` 默认跳过输入法组字期间的事件，组字中的 Enter / Escape 属于输入法自身的确认与取消
- `when` 负责事件目标或其他复杂条件；它与 `keys` / `codes`、修饰键约束按 AND 关系匹配
- `when` 返回 `false` 表示这次事件整个层栈都不处理，**不是**把它放行给下一层：栈顶层不匹配时不会向下查找，下层同样收不到。需要让下层接手就别让本层进栈（`active: false`）
- `priority` 决定视觉层级，数值较大的活动层优先；同优先级按最近激活顺序处理
- 调用方应让 `priority` 与真实视觉 z-index 一致；只有数值型 z-index 能被组件自动同步，CSS class 或字符串覆盖需要显式传入对应数值
- 不走 Portal、嵌在别的层里的浮层（弹窗里的下拉、面板）自己的 z-index 只在宿主的层叠上下文里有意义，`priority` 必须相对宿主抬高，否则宿主会先吃掉这一下；comps 里由宿主提供上下文、嵌套浮层经 `useNestedLayerPriority` 统一处理
- 只有优先级最高的活动层参与匹配；不匹配时不会向下层查找
- `handlerEnabled=false` 时不执行回调，但栈顶层仍可消费匹配事件，避免穿透
- `allowRepeat=false` 时长按产生的重复事件仍被消费，但不重复执行 handler
- `consume=true` 会对匹配事件执行 `preventDefault` 和 `stopPropagation`
- 两个回调都省略时，匹配事件仍按 `consume` 处理，可用于纯阻断层
- 返回的 `isTopLayer` 表示当前层在它参与的**每一种**事件类型上都位于栈顶

Escape 也是普通键盘层场景，使用 `keys: ['Escape']` 即可

按键匹配、修饰键匹配和组字判定统一走 `utils/keyboard`，与 `useShortCutKey` 共用一份语义

独立的应用快捷键或元素内键盘导航使用 `useShortCutKey`；需要按视觉层级互斥响应的浮层交互使用 `useKeyboardLayer`

## 与 `useShortCutKey` 的差异

两者共用同一套 `key` / `code` / 修饰键语义和 `onKeyDown` / `onKeyUp` 回调命名，唯一的区别是修饰键的默认值：

- `useKeyboardLayer` 是过滤器，省略的修饰键**不参与匹配**（`Escape` 层不关心是否按着 Shift）
- `useShortCutKey` 是精确组合键，省略的修饰键**默认要求未按下**（`Ctrl + S` 不会被 `Ctrl + Shift + S` 命中）
