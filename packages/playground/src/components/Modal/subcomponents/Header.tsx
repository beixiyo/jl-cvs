import { cn } from '@/utils'
import { variantStyles } from '../constants'
import type { ModalProps } from '../types'

export function Header(
  {
    titleText = 'Modal Title',
    header,
    headerClassName,
    headerStyle,
    variant = 'default',
    showIcon,
    titleAlign,
    titleId,
  }: HeaderProps,
) {
  if (header !== undefined) return header

  const variantStyle = variantStyles[variant]
  const IconComponent = variantStyle.icon
  const isDefaultVariant = variant === 'default'

  /** 默认行为：default variant 不显示 icon，其他 variant 显示 icon */
  const shouldShowIcon = showIcon ?? !isDefaultVariant

  /** 默认行为：default variant 居中对齐，其他 variant 左对齐 */
  const align = titleAlign ?? (isDefaultVariant
    ? 'center'
    : 'left')

  /** 对齐方式的类名映射 */
  const alignClassMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const TitleContent = () => {
    if (!titleText) {
      return null
    }

    /** 不显示图标时，直接渲染标题 */
    if (!shouldShowIcon) {
      return (
        <h2
          className={ cn(
            'text-base font-semibold flex-1',
            alignClassMap[align],
          ) }
          id={ titleId }
        >
          { titleText }
        </h2>
      )
    }

    /** 显示图标时，使用 flex 布局 */
    return (
      <div
        className={ cn(
          'flex items-center gap-3 w-full',
          align === 'center' && 'justify-center',
          align === 'right' && 'justify-end',
        ) }
      >
        <div
          className={ cn(
            'rounded-lg p-1.5',
            variantStyle.iconBg,
          ) }
        >
          <IconComponent className={ cn('w-4 h-4', variantStyle.accent) } />
        </div>

        <h2 className="text-base font-semibold" id={ titleId }>
          { titleText }
        </h2>
      </div>
    )
  }

  return (
    <div
      className={ cn(
        `flex items-start justify-between rounded-t w-full`,
        headerClassName,
      ) }
      style={ headerStyle }
    >
      <TitleContent />
    </div>
  )
}

type HeaderProps = Pick<ModalProps, 'titleText' | 'header' | 'headerClassName' | 'headerStyle' | 'variant' | 'showIcon' | 'titleAlign'> & {
  titleId?: string
}
