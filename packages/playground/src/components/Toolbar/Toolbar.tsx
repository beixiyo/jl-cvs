'use client'

import { cn } from '@/utils'
import { forwardRef } from 'react'
import { Separator } from '../Separator'
import type { BaseProps, ToolbarProps } from './types'

// 1. 定义内部组件
const ToolbarGroup = forwardRef<HTMLDivElement, BaseProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ ref }
      role="group"
      className={ cn('flex items-center gap-0.5 empty:hidden', className) }
      { ...props }
    >
      { children }
    </div>
  ),
)
ToolbarGroup.displayName = 'Toolbar.Group'

const ToolbarSeparator = forwardRef<HTMLDivElement, BaseProps>(
  ({ ...props }, ref) => <Separator ref={ ref } orientation="vertical" decorative { ...props } />,
)
ToolbarSeparator.displayName = 'Toolbar.Separator'

// 2. 定义主组件
const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, className, variant = 'fixed', ...props }, ref) => {
    return (
      <div
        ref={ ref }
        role="toolbar"
        aria-label="toolbar"
        className={ cn(
          'flex items-center gap-1',
          variant === 'fixed'
            && 'sticky top-0 z-10 w-full min-h-11 bg-background border-b border-border2 px-2 overflow-x-auto hide-scroll max-md:absolute max-md:top-auto max-md:h-[calc(2.75rem+env(safe-area-inset-bottom,0px))] max-md:border-t max-md:border-b-0 max-md:pb-[env(safe-area-inset-bottom,0px)] max-md:flex-nowrap max-md:justify-start',
          variant === 'floating'
            && 'p-1 rounded-2xl bg-background shadow-card outline-hidden overflow-hidden max-md:w-full max-md:rounded-none max-md:border-none max-md:shadow-none',
          className,
        ) }
        { ...props }
      >
        { children }
      </div>
    )
  },
)
ToolbarRoot.displayName = 'Toolbar'

// 3. 组合并导出
export const Toolbar = Object.assign(ToolbarRoot, {
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
})
