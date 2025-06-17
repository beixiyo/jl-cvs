import type { ModalProps } from './types'
import { Button } from '@/components/Button'
import { cn } from '@/utils'

export function Footer(
  {
    onClose,
    onOk,
    okText = 'OK',
    cancelText = 'Cancel',
    footer,
    footerClassName,
    footerStyle,
  }: ModalProps,
) {
  if (footer !== undefined)
    return footer

  return (
    <div
      className={ cn(
        `flex items-center justify-end gap-4 mt-auto`,
        footerClassName,
      ) }
      style={ footerStyle }
    >

      <Button onClick={ onClose }>
        {cancelText}
      </Button>

      <Button onClick={ onOk } variant="primary">
        {okText}
      </Button>
    </div>
  )
}
