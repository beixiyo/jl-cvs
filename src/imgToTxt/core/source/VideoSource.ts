import { BaseSource } from './BaseSource'

export class VideoSource extends BaseSource {
    video: HTMLVideoElement
    width: number
    height: number

    constructor(isDynamic: boolean, option: VideoSourceOption) {
        super(isDynamic)

        this.video = option.video
        this.width = option.width
        this.height = option.height
        /** 静音才能播放 */
        this.video.muted = this.video.loop = true
        this.video.play()
    }

    protected override setCvsSize() {
        this.canvas.width = this.width
        this.canvas.height = this.height
    }

    protected override draw() {
        this.ctx.drawImage(
            this.video,
            0,
            0,
            this.video.videoWidth,
            this.video.videoHeight,
            0,
            0,
            this.width,
            this.height
        )
    }
}

export type VideoSourceOption = {
    video: HTMLVideoElement
    width: number
    height: number
}
