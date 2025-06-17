import type { ModalProps } from './types'
import { cn } from '@/utils'
import { variantStyles } from './constants'

export function Header(
  {
    titleText = 'Modal Title',
    header,
    headerClassName,
    headerStyle,
    variant,
  }: ModalProps,
) {
  if (header !== undefined)
    return header

  const variantStyle = variantStyles[variant || 'default']
  const IconComponent = variantStyle.icon

  return (
    <div
      className={ cn(
        `flex items-start justify-between rounded-t`,
        headerClassName,
      ) }
      style={ headerStyle }
    >
      {
        titleText
          ? <div className="flex items-center gap-3">
              <div className={ `p-1.5 ${variantStyle.iconBg} rounded-lg` }>
                <IconComponent className={ `w-4 h-4 ${variantStyle.accent}` } />
              </div>
              <h2 className="text-lg">{ titleText }</h2>
            </div>
          : null
      }
    </div>
  )
}
