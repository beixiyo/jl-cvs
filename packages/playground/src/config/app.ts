import { isMobile } from '@jl-org/tool'

export const isiOS = typeof window != 'undefined'
  ? /iPad|iPhone|iPod|Mac OS/.test(navigator.userAgent)
  : false

export const IS_MOBILE_DEVICE = isMobile()
