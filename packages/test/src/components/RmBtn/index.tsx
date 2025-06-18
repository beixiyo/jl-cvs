import { X } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/utils'

export const RmBtn = memo<RmBtnProps>((props) => {
  const {
    style,
    className,
    iconSize = props.mode === 'absolute'
      ? 12
      : 26,
    mode = 'absolute',
    ...rest
  } = props

  return <div
    className={ cn(
      'RmBtnContainer z-50',
      'size-4 flex transform cursor-pointer select-none items-center justify-center rounded-full',
      'bg-red-500 text-white transition-all duration-300 hover:scale-110 hover:bg-red-400 focus:outline-none',
      mode === 'absolute'
        ? 'absolute right-0 top-0'
        : 'fixed right-4 top-4 size-10 bg-dark/70',
      className,
    ) }
    style={ style }
    { ...rest }
  >
    <X size={ iconSize } />
  </div>
})

RmBtn.displayName = 'RmBtn'

export type RmBtnProps = {
  /**
   * Icon size
   * @default 12
   */
  iconSize?: number
  /**
   * 按钮定位模式
   * @default 'absolute'
   */
  mode?: 'absolute' | 'fixed'
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
