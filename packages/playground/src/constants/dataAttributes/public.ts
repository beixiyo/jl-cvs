/**
 * 对外稳定的组件 DOM 属性名
 *
 * ARIA 属性负责可访问性语义；这些 `data-*` 属性仅用于外部样式和 DOM 查询契约
 * 所有属性使用 `data-vv-*` 命名空间，避免与业务代码及其他组件库冲突
 */
export const DATA_ATTR = {
  state: 'data-vv-state',
  selected: 'data-vv-selected',
  highlighted: 'data-vv-highlighted',
  disabled: 'data-vv-disabled',
  invalid: 'data-vv-invalid',
  dragging: 'data-vv-dragging',
  sort: 'data-vv-sort',

  floatingArrow: 'data-vv-floating-arrow',

  bottomGlow: {
    scale: 'data-vv-bottom-glow-scale',
    position: 'data-vv-bottom-glow-position',
  },

  button: {
    name: 'data-vv-button-name',
  },

  cascader: {
    selected: 'data-vv-cascader-selected',
    menu: 'data-vv-cascader-menu',
    option: 'data-vv-cascader-option',
  },

  collapsibleSidebar: {
    collapsed: 'data-vv-collapsible-sidebar-collapsed',
  },

  datePicker: {
    ignore: 'data-vv-date-picker-ignore',
    rangePosition: 'data-vv-date-picker-range-position',
    quickTimeTrigger: 'data-vv-date-picker-quick-time-trigger',
    quickTimeIgnore: 'data-vv-date-picker-quick-time-ignore',
    timeSegment: 'data-vv-date-picker-time-segment',
    timeSegmentControl: 'data-vv-date-picker-time-segment-control',
    timeSegmentGroup: 'data-vv-date-picker-time-segment-group',
  },

  message: {
    id: 'data-vv-message-id',
  },

  modal: {
    top: 'data-vv-modal-top',
    /** 弹窗打开时优先聚焦的元素；不标记则聚焦首个可 Tab 元素 */
    autofocus: 'data-vv-modal-autofocus',
  },

  tabs: {
    active: 'data-vv-tabs-active',
    id: 'data-vv-tabs-id',
  },
} as const
