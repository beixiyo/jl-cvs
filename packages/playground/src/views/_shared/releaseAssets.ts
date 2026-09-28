/**
 * 演示功能资源（示例图、演示视频）的统一出口
 *
 * 二进制资源不纳入仓库，统一托管在 GitHub Release（tag: assets，
 * https://github.com/beixiyo/jl-cvs/releases/tag/assets），
 * 资产名即下方各 URL 的文件名部分
 */
export const RELEASE_ASSETS_BASE = 'https://github.com/beixiyo/jl-cvs/releases/download/assets'

/** 各演示页共用的默认示例图 */
export const DEMO_IMAGE_URL = `${RELEASE_ASSETS_BASE}/umr.webp`

/** 视频帧提取 / 图像转字符的默认演示视频 */
export const DEMO_VIDEO_URL = `${RELEASE_ASSETS_BASE}/demo-video.mp4`

/** 智能选区演示图 */
export const SMART_SELECTION_DEMO_URL = `${RELEASE_ASSETS_BASE}/smart-selection-demo.webp`

/** 智能抠图的原图与成品图 */
export const CUTOUT_BED_URL = `${RELEASE_ASSETS_BASE}/cutout-bed.webp`
export const CUTOUT_BED_MASK_URL = `${RELEASE_ASSETS_BASE}/cutout-bed-mask.webp`
