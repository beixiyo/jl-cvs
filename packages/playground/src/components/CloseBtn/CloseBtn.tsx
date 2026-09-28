import { IconButton } from '../icons/subcomponents/IconButton'
import { X } from '../icons/subcomponents/X'
import type { CloseBtnProps } from './types'

/**
 * 通用关闭按钮组件
 * - 支持 absolute / fixed / static 三种定位模式
 * - 非 static 模式下默认吸附到右上角，可通过 corner 定制
 * - 如需自定义偏移量，通过 className 传入 Tailwind 类名（如 top-4 right-4 或 top-[13px]）
 */
export function CloseBtn(props: CloseBtnProps) {
  return <IconButton { ...props } icon={ X } aria-label={ props['aria-label'] ?? 'close' } />
}
