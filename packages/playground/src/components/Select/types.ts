import type { ReactNode } from 'react'

export interface Option {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  children?: Option[]
}

/** 选项细粒度类名（SelectOption 组件用） */
export interface SelectOptionClassNames {
  className?: string
  contentClassName?: string
  labelClassName?: string
  checkIconClassName?: string
  chevronIconClassName?: string
}

/** 上层传入的选项类名（Select 透传时带 option 前缀） */
export type SelectOptionClassNamesFromParent = {
  [K in keyof SelectOptionClassNames as `option${Capitalize<string & K>}`]?: SelectOptionClassNames[K]
}

export interface SelectOptionProps extends SelectOptionClassNames {
  option: Option
  id?: string
  selected: boolean
  highlighted?: boolean
  onClick: (value: string) => void
  onMouseEnter?: () => void
  renderExtra?: (option: Option) => ReactNode
}

export interface SelectProps<T extends string | string[] = string> extends SelectOptionClassNamesFromParent {
  options: Option[]
  value?: T
  defaultValue?: T
  onClick?: () => void
  onChange?: (value: T) => void
  onClickOutside?: () => void
  placeholder?: string
  placeholderIcon?: ReactNode
  /**
   * 默认 trigger 有值时是否在 hover 状态下以清除按钮替换下拉箭头
   *
   * 仅在非 editable 模式下生效
   * @default false
   */
  clearable?: boolean | SelectClearableConfig
  /** 用户通过清除按钮移除当前选择后触发 */
  onClear?: () => void
  /**
   * trigger 左侧常驻前缀图标，无论是否已选中都显示
   * 区别于 {@link SelectProps.placeholderIcon}（仅占位态显示）与 {@link Option.icon}（仅下拉选项显示）
   */
  prefixIcon?: ReactNode

  disabled?: boolean
  showDownArrow?: boolean
  rotate?: boolean
  loading?: boolean
  showEmpty?: boolean
  multiple?: boolean
  maxSelect?: number
  searchable?: boolean
  required?: boolean

  /**
   * 下拉面板是否显示边框（不影响 trigger，trigger 默认无边框，可用 className 自定义）
   * @default light: false, dark: true
   */
  bordered?: boolean
  /**
   * 下拉面板是否显示阴影（不影响 trigger，trigger 默认无阴影，可用 className 自定义）
   * @default true
   */
  shadowed?: boolean
  /**
   * 启用 combobox 模式：trigger 变为 input，支持手填自定义值 + 下拉选择
   * - 仅对 single select（非 multiple）生效
   * - blur / Enter 提交当前文本（可以是选项外的任意值）
   * - Escape 回退至上次提交的值
   * @default false
   */
  editable?: boolean
  className?: string
  placeholderClassName?: string
  /** editable 模式下 input 元素的额外类名 */
  editableInputClassName?: string
  /**
   * 下拉面板的额外类名，追加在默认样式之后，可覆盖阴影、圆角等默认外观
   * 级联与非级联模式均生效；不影响 trigger（trigger 用 {@link SelectProps.className}）
   */
  dropdownClassName?: string
  /**
   * 自定义下拉框固定高度（非级联模式下为固定高度，选项较少时会留白）
   * @default 150
   */
  dropdownHeight?: number
  /**
   * 下拉框最大高度（非级联模式）。传入后下拉框高度随内容自适应、超出才滚动，
   * 优先级高于 `dropdownHeight`；不传则维持 `dropdownHeight` 的固定高度行为
   */
  dropdownMaxHeight?: number

  /** searchable 模式下搜索词变化时触发 */
  onSearch?: (query: string) => void
  /** 在每个选项右侧渲染额外内容（如编辑/删除按钮），不影响 trigger 显示 */
  renderOptionExtra?: (option: Option) => ReactNode

  /** 表单相关属性 */
  name?: string
  error?: boolean
  errorMessage?: string
}

/** Select 默认 trigger 的清除按钮配置 */
export interface SelectClearableConfig {
  /** 自定义清除图标，默认使用 CloseBtn 的叉号 */
  clearIcon?: ReactNode
}
