import { LANGUAGES } from '@/i18n'
import { enUS } from './en-US'
import { jaJP } from './ja-JP'
import { zhCN } from './zh-CN'
import { zhTW } from './zh-TW'

export const uploaderResources = {
  [LANGUAGES.ZH_CN]: zhCN,
  [LANGUAGES.EN_US]: enUS,
  [LANGUAGES.ZH_TW]: zhTW,
  [LANGUAGES.JA_JP]: jaJP,
} as const
