/**
 * Toolbar 类型声明
 */

import type * as React from 'react'

export type BaseProps = React.HTMLAttributes<HTMLDivElement>

export interface ToolbarProps extends BaseProps {
  variant?: 'floating' | 'fixed'
}
