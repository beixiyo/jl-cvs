import { BaseSource } from './BaseSource'

export class VideoSource extends BaseSource {
    video: HTMLVideoElement
    width: number
    height: number
    constructor(option: VideoSourceOption) {
        super()
        this.video = option.video
        this.width = option.width
        this.height = option.height
        this.video.muted = this.video.loop = true
        this.video.play()
    }

    protected initCanvas(): void {
        this.canvas.width = this.width
        this.canvas.height = this.height
    }
    protected draw(): void {
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
