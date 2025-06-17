import type { ImgSourceOption } from './ImgSource'
import type { TxtSourceOption } from './TxtSource'
import type { VideoSourceOption } from './VideoSource'
import { BaseSource } from './BaseSource'
import { ImgSource } from './ImgSource'
import { TxtSource } from './TxtSource'
import { VideoSource } from './VideoSource'

export { BaseSource }
export type { ImgSourceOption, TxtSourceOption, VideoSourceOption }

export function createSource(
  isDynamic: boolean,
  sourceOption: TxtSourceOption | ImgSourceOption | VideoSourceOption,
): BaseSource {
  if ((sourceOption as TxtSourceOption).txt) {
    return new TxtSource(isDynamic, sourceOption as TxtSourceOption)
  }
  if ((sourceOption as ImgSourceOption).img) {
    return new ImgSource(isDynamic, sourceOption as ImgSourceOption)
  }
  if ((sourceOption as VideoSourceOption).video) {
    return new VideoSource(isDynamic, sourceOption as VideoSourceOption)
  }

  throw new TypeError('invalid source options')
}
