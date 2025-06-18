import type { ModalProps, ModalRef, ModelType } from './types'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils'
import { Mask } from '../Mask'
import { DURATION, variantStyles } from './constants'
import { extendModal } from './extendModal'
import { Footer } from './Footer'
import { Header } from './Header'

const InnerModal = forwardRef<ModalRef, ModalProps>((
  props,
  ref,
) => {
  const {
    width = 800,
    height,

    isOpen,
    onClose,
    onOk,

    zIndex = 50,
    titleText = 'Modal Title',
    okText = 'OK',
    cancelText = 'Cancel',

    header,
    footer,

    children,
    className,
    style,
    variant = 'default',
    showCloseBtn,

    headerClassName,
    headerStyle,

    bodyClassName,
    bodyStyle,

    footerClassName,
    footerStyle,
  } = props
  const variantStyle = variantStyles[variant]
  const [open, setOpen] = useState(isOpen)

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    },
    [onClose],
  )

  useEffect(
    () => {
      if (open) {
        document.addEventListener('keydown', handleEscape)
      }
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    },
    [open, handleEscape],
  )

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  /**
   * Ref
   */
  useImperativeHandle(ref, () => ({
    hide: () => {
      setOpen(false)
    },
  }))

  const ModalContent = (
    <AnimatePresence>
      { open && <Mask style={ { zIndex } }>
        { showCloseBtn && <div
          className={ cn(
            'fixed top-4 right-4 z-50 rounded-full flex justify-center items-center size-10 rounded-full',
            'hover:opacity-50 cursor-pointer duration-300 transition-all',
            'bg-primary text-white',
          ) }
          onClick={ onClose }
        >
          <X />
        </div> }

        <div
          onClick={ onClose }
          className="fixed inset-0"
        ></div>

        <motion.div
          className={ cn(
            'relative bg-white rounded-xl shadow-xl shadow-black/10',
            variantStyle.bg,
            className,
          ) }
          style={ {
            width,
            height,
            ...style,
          } }
          initial={ { scale: 0.5, opacity: 0 } }
          animate={ { scale: 1, opacity: 1 } }
          exit={ { scale: 0.5, opacity: 0 } }
          transition={ { duration: DURATION } }
        >
          <div className="h-full max-h-[90vh] flex flex-col gap-6 p-6">
            { header === null
              ? null
              : header === undefined
                ? <Header
                    { ...props }
                    onClose={ onClose }
                    titleText={ titleText }
                    header={ header }
                    headerClassName={ headerClassName }
                    headerStyle={ headerStyle }
                  />
                : null }

            <div
              className={ cn(
                `overflow-y-auto overflow-x-hidden flex-1`,
                bodyClassName,
              ) }
              style={ bodyStyle }
            >
              { children }
            </div>

            { footer === null
              ? null
              : footer === undefined
                ? <Footer
                    { ...props }
                    onClose={ onClose }
                    onOk={ onOk }
                    okText={ okText }
                    cancelText={ cancelText }
                    footer={ footer }
                    footerClassName={ footerClassName }
                    footerStyle={ footerStyle }
                  />
                : null }
          </div>
        </motion.div>
      </Mask> }
    </AnimatePresence>
  )

  return createPortal(ModalContent, document.body)
})

export const Modal = memo<ModalProps>(InnerModal) as unknown as ModelType<typeof InnerModal>
Modal.displayName = 'Modal'
extendModal()
