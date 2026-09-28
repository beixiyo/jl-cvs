/**
 * PlusBtn 类型声明
 */

import type { IconButton } from '../icons/subcomponents/IconButton'

export type PlusBtnProps = Omit<React.ComponentProps<typeof IconButton>, 'icon'>
