import type { CSSProperties, HTMLAttributes } from 'react'
import type { TabItemType } from '.'
import { cn } from '@/utils'
import { memo } from 'react'

function InnerTabHeader<T extends string>(
  {
    style,
    className,

    item,
    active,
    dataId,
    ...rest
  }: TabHeaderProps<T>,
) {
  if (item.header) {
    return item.header(item)
  }

  return <div
    className={ cn(
      'flex-1 flex justify-center items-center py-1 bg-innerBg',
      'rounded-md cursor-pointer',
      'hover:!bg-primary hover:!text-white transition-all duration-300',
      { 'bg-primary text-white': active },
      className,
    ) }
    style={ {
      boxShadow: active
        ? '0 0 6px 1px rgba(0, 0, 0, 0.5)'
        : 'none',
      ...style,
    } }
    { ...rest }
    data-id={ `${dataId ?? ''}${item.value}` }
  >
    <span>{ item.value }</span>
  </div>
}

InnerTabHeader.displayName = 'TabHeader'
export const TabHeader = memo(InnerTabHeader) as typeof InnerTabHeader

export type TabHeaderProps<T extends string> = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode

  active: boolean
  item: TabItemType<T>
  dataId?: string
}
& HTMLAttributes<HTMLDivElement>
