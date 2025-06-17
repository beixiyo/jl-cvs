declare interface HTMLVideoElement {
  captureStream(): MediaStream
}

declare interface ImageCapture {
  grabFrame(): Promise<ImageBitmap>
}
