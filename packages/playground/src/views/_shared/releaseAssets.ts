import cutoutBedMaskUrl from '@/assets/img/cutout-bed-mask.webp'
import cutoutBedUrl from '@/assets/img/cutout-bed.webp'
import smartSelectionDemoUrl from '@/assets/img/smart-selection-demo.webp'
import demoImageUrl from '@/assets/img/umr.webp'
import demoVideoUrl from '@/assets/video/demo-video.mp4'

/**
 * 演示站资源统一出口
 *
 * 两类资源、两种托管方式：
 * - 画廊预览图（纯 img 展示）托管在 GitHub Release（tag: assets，
 *   https://github.com/beixiyo/jl-cvs/releases/tag/assets），仓库不收大图
 * - 演示功能资源（会被 canvas 处理，依赖 CORS）随仓库打包，保证截帧、
 *   截图、图像处理等链路可靠
 */

/** GitHub Release 资产基址（画廊预览图） */
export const RELEASE_ASSETS_BASE = 'https://github.com/beixiyo/jl-cvs/releases/download/assets'

/** 各演示页共用的默认示例图 */
export const DEMO_IMAGE_URL = demoImageUrl

/** 视频帧提取 / 图像转字符的默认演示视频 */
export const DEMO_VIDEO_URL = demoVideoUrl

/** 智能选区演示图 */
export const SMART_SELECTION_DEMO_URL = smartSelectionDemoUrl

/** 智能抠图的原图与成品图 */
export const CUTOUT_BED_URL = cutoutBedUrl
export const CUTOUT_BED_MASK_URL = cutoutBedMaskUrl
