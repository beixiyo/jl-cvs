import { IconButton } from '../icons/subcomponents/IconButton'
import { Plus } from '../icons/subcomponents/Plus'
import type { PlusBtnProps } from './types'

/**
 * 通用加号按钮组件
 */
export function PlusBtn(props: PlusBtnProps) {
  return <IconButton { ...props } icon={ Plus } aria-label={ props['aria-label'] ?? '添加' } />
}
