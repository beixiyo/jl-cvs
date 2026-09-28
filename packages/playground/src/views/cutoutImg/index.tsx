import { cn } from '@/utils'
import { CutoutImg } from './CutoutImg'
import { CUTOUT_BED_MASK_URL, CUTOUT_BED_URL } from '../_shared/releaseAssets';

/** 模块级常量，避免每次渲染重新计算 URL */
const ORIGIN_IMG = CUTOUT_BED_URL
const CUTOUT_IMG = CUTOUT_BED_MASK_URL

export default function Test() {
  return (
    <div
      className={ cn(
        'size-full flex flex-col items-center',
      ) }
    >
      <CutoutImg
        originImg={ ORIGIN_IMG }
        cutoutImg={ CUTOUT_IMG }
        onChangeMask={ () => console.log('Mask changed') }
        onChangePreviewImg={ () => console.log('Preview image changed') }
        onLoading={ (loading) => console.log('Loading state:', loading) }
      />
    </div>
  )
}
