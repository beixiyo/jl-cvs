import { cn } from '@/utils'
import { FolderOpen, Upload } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo } from 'react'
import { useT } from '../../../i18n'

export interface DragIndicatorProps {
  dragActive: boolean
  dragInvalid: boolean
  disabled?: boolean
  placeholder?: string
}

export const DragIndicator = memo<DragIndicatorProps>((props) => {
  const { dragActive, dragInvalid, disabled, placeholder: propsPlaceholder } = props
  const t = useT()
  const placeholder = propsPlaceholder || t('uploader.placeholder')

  return (
    <AnimatePresence mode="wait">
      { dragActive
        ? (
          <motion.div
            key={ dragInvalid
              ? 'drag-invalid'
              : 'drag-active' }
            initial={ { scale: 0.8, opacity: 0 } }
            animate={ { scale: 1, opacity: 1 } }
            exit={ { scale: 0.8, opacity: 0 } }
            transition={ { duration: 0.2 } }
            className="flex flex-col items-center gap-2"
          >
            { dragInvalid
              ? (
                <>
                  <FolderOpen className="size-12 text-danger sm:size-16" />
                  <div className="text-center">
                    <p className="text-sm text-danger font-medium sm:text-base">
                      { t('uploader.unsupportedFileType') }
                    </p>
                    <p className="mt-1 text-xs text-danger sm:text-sm opacity-80">
                      { t('uploader.selectSupportedFormat') }
                    </p>
                  </div>
                </>
              )
              : (
                <>
                  <FolderOpen className="size-12 text-brand sm:size-16" />
                  <p className="text-sm text-brand font-medium sm:text-base">
                    { t('uploader.releaseToUpload') }
                  </p>
                </>
              ) }
          </motion.div>
        )
        : (
          <motion.div
            key="normal"
            initial={ { scale: 0.8, opacity: 0 } }
            animate={ { scale: 1, opacity: 1 } }
            exit={ { scale: 0.8, opacity: 0 } }
            transition={ { duration: 0.2 } }
            className="flex flex-col items-center gap-2 sm:gap-3"
          >
            <div className="relative">
              <Upload
                className={ cn(
                  'size-8 transition-colors',
                  disabled
                    ? 'text-textDisabled'
                    : 'text-text4 group-hover:text-text2',
                ) }
              />
            </div>
            <div className="px-4 text-center sm:px-6">
              <p
                className={ cn(
                  'text-sm font-medium sm:text-base',
                  disabled
                    ? 'text-textDisabled'
                    : 'text-text2',
                ) }
              >
                { placeholder }
              </p>
            </div>
          </motion.div>
        ) }
    </AnimatePresence>
  )
})

DragIndicator.displayName = 'DragIndicator'
