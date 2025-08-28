import { cn } from '@/utils'
import { CutoutImg } from './CutoutImg'

export default function Test() {
  return <div
    className={ cn(
      'size-full flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
    ) }
  >
    <CutoutImg
      originImg={ new URL('./assets/bed.webp', import.meta.url).href }
      cutoutImg={ new URL('./assets/bed-cutout.webp', import.meta.url).href }
      onChangeMask={ mask => console.log('Mask changed') }
      onChangePreviewImg={ img => console.log('Preview image changed') }
      onLoading={ loading => console.log('Loading state:', loading) }
    />
  </div>
}
