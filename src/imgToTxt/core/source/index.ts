import { BaseSource } from './BaseSource'
import { ImgSource, ImgSourceOption } from './ImgSource'
import { TxtSourceOption, TxtSource } from './TxtSource'
import { VideoSource, VideoSourceOption } from './VideoSource'

export { BaseSource }
export type { TxtSourceOption, ImgSourceOption, VideoSourceOption}


export function createSource(
    isDynamic: boolean,
    sourceOption: TxtSourceOption | ImgSourceOption | VideoSourceOption
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
