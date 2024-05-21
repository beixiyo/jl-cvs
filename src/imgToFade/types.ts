export type ImgToFadeOpts = {
    width?: number
    height?: number
    src: string
    /** 小球每次的移动速度倍数，默认 1.05 */
    speed?: number
    /** 半径 */
    r?: () => number
}
