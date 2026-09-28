/**
 * 语义化 z-index 分层常量
 *
 * 参考 Chakra UI 的分层设计，层间间隔 100 留足插入空间
 * 组件按语义查表，不使用魔法数字
 */
export const Z = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1700,
  tooltip: 1800,
  preview: 1900,
} as const

export type ZLayer = typeof Z[keyof typeof Z]
