import { cn } from '@/utils'
import { memo } from 'react'
import { Dropdown } from '..'
import type { DropdownProps } from '../types'

export const Faq = memo<FaqProps>((
  {
    style,
    className,
    items,
  },
) => {
  return (
    <div
      className={ cn(
        'FaqContainer',
        'py-8 md:py-16',
        className,
      ) }
      style={ style }
    >
      <h3
        className={ cn(
          'text-center text-text font-bold tracking-tight',
          'text-3xl mb-8 mt-8 md:text-5xl md:mb-16 md:mt-16',
        ) }
      >
        FAQ
      </h3>

      <div
        className={ cn(
          'mx-auto max-w-3xl',
          'px-4 py-4 md:px-0 md:py-8',
        ) }
      >
        <Dropdown
          items={ items }
          className="space-y-6"
          sectionHeaderClassName={ cn(
            'text-text font-semibold hover:text-brand transition-colors',
            'text-lg md:text-xl',
          ) }
          itemTitleClassName="text-text2"
          itemDescClassName="text-text3"
          itemInactiveClassName="hover:bg-background2/50"
          itemClassName={ cn(
            'border-border/50 space-y-4 transition-all duration-300 hover:border-border rounded-2xl bg-background2/20',
            'py-4 px-5 text-sm md:py-6 md:px-8 md:text-base',
          ) }
        >
        </Dropdown>
      </div>
    </div>
  )
})

Faq.displayName = 'Faq'

export type FaqProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  items: DropdownProps['items']
}
