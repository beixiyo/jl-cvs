import { BaseSource } from './BaseSource'
import { ImgSource, ImgSourceOption } from './ImgSource'
import { TextSourceOption, TextSource } from './TextSource'
import { VideoSource, VideoSourceOption } from './VideoSource'

export { BaseSource }
export type { TextSourceOption }
export type { ImgSourceOption }
export type { VideoSourceOption }


export function createSource(
    sourceOption: TextSourceOption | ImgSourceOption | VideoSourceOption
): BaseSource {
    if ((sourceOption as TextSourceOption).txt) {
        return new TextSource(sourceOption as TextSourceOption)
    } 
    else if ((sourceOption as ImgSourceOption).img) {
        return new ImgSource(sourceOption as ImgSourceOption)
    } 
    else if ((sourceOption as VideoSourceOption).video) {
        return new VideoSource(sourceOption as VideoSourceOption)
    }
    
    throw new TypeError('invalid source options')
}
