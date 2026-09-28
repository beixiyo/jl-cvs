/** 多个组件共用、但不对外承诺稳定性的内部 DOM 定位属性名 */
export const INTERNAL_DATA_ATTR = {
  chatInput: {
    panel: 'data-vv-chat-input-panel',
  },
  mdEditor: {
    panel: 'data-vv-md-editor-panel',
  },
  virtual: {
    itemIndex: 'data-vv-virtual-item-index',
    /** 尺寸正由收放动画驱动的行 */
    driven: 'data-vv-virtual-driven',
  },
} as const
